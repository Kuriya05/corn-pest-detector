import { NextResponse } from 'next/server';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { callGemini, parseJsonLoose, GeminiError } from '@/lib/gemini';
import { createHash } from 'crypto';
import { buildSystemPrompt, loadKnowledgeBase, IMAGE_PROMPT, RESPONSE_SCHEMA, enrichFinding, consolidateFindings, type KnowledgeBase, type RawFinding, type Finding } from '@/lib/analysis';

const execAsync = promisify(exec);

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB
const YOLO_TIMEOUT_MS = 40_000;
const YOLO_GRACE_MS = 6_000;
/** ชื่อคลาสของโมเดล YOLO (best.pt) → ชื่อไทย และคำค้นสำหรับจับคู่คลังโรค (ไม่ใส่ query = ยังไม่มีในคลัง) */
const YOLO_DISEASES: Record<string, { th: string; query?: string }> = {
  'Bacterial Leaf Blight': { th: 'โรคใบไหม้จากแบคทีเรีย' },
  'Bacterial Wilt': { th: 'โรคเหี่ยวจากแบคทีเรีย' },
  'Charcoal Rot': { th: 'โรคต้นเน่าสีดำ', query: 'Charcoal rot' },
  'Corn Anthracnose': { th: 'โรคแอนแทรคโนส', query: 'Anthracnose stalk rot' },
  'Corn Root Rot': { th: 'โรครากเน่า' },
  'Fusarium Wilt': { th: 'โรคเหี่ยวฟิวซาเรียม', query: 'Fusarium stalk rot' },
  'Maize Chlorotic Mottle Disease': { th: 'โรคใบด่างเหลืองซีด (MCMD)' },
  'Maize Streak Disease': { th: 'โรคลายขีดข้าวโพด (Maize streak)' },
  'Seedling Blight': { th: 'โรคต้นกล้าไหม้' },
  'Sheath Blight': { th: 'โรคกาบและใบไหม้', query: 'Banded leaf and sheath blight' },
};

/** YOLO ที่เทรนน้อยมักมั่นใจเกินจริง รับเฉพาะผลที่มั่นใจพอและตรงกับคลังความรู้ */
const YOLO_MIN_CONF = 50;

/** แคชผลตามลายนิ้วมือของภาพ: ภาพเดิมได้ผลเดิม (กันผลเปลี่ยนทุกครั้ง) เก็บในหน่วยความจำของ instance */
const CACHE_TTL_MS = 30 * 60_000;
const CACHE_MAX = 60;
const cache = new Map<string, { at: number; body: Record<string, unknown> }>();

type GeminiResult = {
  is_corn?: boolean;
  image_quality?: string;
  plant_part?: string;
  growth_stage_guess?: string;
  findings?: RawFinding[];
  summary_th?: string;
  next_steps_th?: string[];
  need_better_photo?: boolean;
  photo_tip_th?: string;
};

/** หา python ที่ใช้งานได้ — รองรับ virtualenv ทั้ง Windows และ Linux */
function resolvePython(projectRoot: string): string | null {
  const candidates = [
    process.env.PYTHON_PATH,
    join(projectRoot, '..', '.venv', 'Scripts', 'python.exe'),
    join(projectRoot, '..', '.venv', 'bin', 'python'),
    join(projectRoot, '.venv', 'Scripts', 'python.exe'),
    join(projectRoot, '.venv', 'bin', 'python'),
  ].filter(Boolean) as string[];

  for (const c of candidates) if (existsSync(c)) return c;
  return process.platform === 'win32' ? 'python' : 'python3';
}

/** เรียกโมเดล YOLO ที่เทรนเอง เพื่อช่วยตีกรอบตำแหน่งแมลง (ไม่บังคับ) */
async function runYolo(imagePath: string, kb: KnowledgeBase): Promise<{ ok: boolean; boxes: Finding[]; error?: string }> {
  if (process.env.YOLO_ENABLED === 'false') return { ok: false, boxes: [], error: 'ปิดการใช้งานไว้' };

  const root = process.cwd();
  const script = resolve(/*turbopackIgnore: true*/ root, process.env.YOLO_SCRIPT_PATH || '../detect_model.py');
  const model = resolve(/*turbopackIgnore: true*/ root, process.env.YOLO_MODEL_PATH || '../best.pt');
  if (!existsSync(script) || !existsSync(model)) {
    return { ok: false, boxes: [], error: 'ไม่พบไฟล์โมเดลหรือสคริปต์ YOLO' };
  }

  const python = resolvePython(root);
  if (!python) return { ok: false, boxes: [], error: 'ไม่พบ Python ในเครื่อง' };

  const conf = process.env.YOLO_CONF || '0.35';
  const cmd = `"${python}" "${script}" "${model}" "${imagePath}" ${conf}`;

  try {
    const { stdout } = await execAsync(cmd, { timeout: YOLO_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 });
    const start = stdout.indexOf('[');
    if (start === -1) return { ok: false, boxes: [], error: 'YOLO ไม่ได้ส่ง JSON กลับมา' };

    const parsed = JSON.parse(stdout.slice(start)) as {
      class: string; confidence: number; box: { top: string; left: string; width: string; height: string };
    }[];

    const boxes: Finding[] = parsed.filter((p) => p.confidence >= YOLO_MIN_CONF).map((p) => {
      const num = (v: string) => parseFloat(String(v).replace('%', '')) || 0;
      const box = { top: num(p.box.top), left: num(p.box.left), width: num(p.box.width), height: num(p.box.height) };
      const known = YOLO_DISEASES[p.class];
      // โมเดลนี้เทรนมาตรวจ "โรค" — จับคู่คลังความรู้เฉพาะชนิดที่ตรงกันจริง (กัน keyword กว้าง ๆ เช่น blight/rot จับผิดโรค)
      if (known?.query) {
        const enriched = enrichFinding({ type: 'disease', name_th: known.th, name_en: known.query, confidence: p.confidence }, kb);
        return { ...enriched, source: 'yolo' as const, box };
      }
      return {
        type: 'disease' as const,
        nameTh: known?.th ?? p.class,
        nameEn: p.class,
        confidence: Math.round(p.confidence),
        severity: 'medium' as const,
        source: 'yolo' as const,
        box,
      };
    });

    return { ok: true, boxes };
  } catch (err) {
    // ไม่เปิดเผย path ในเครื่องให้ผู้ใช้เห็น — log ไว้ฝั่งเซิร์ฟเวอร์แทน
    const raw = err instanceof Error ? err.message : String(err);
    console.warn('[yolo]', raw.slice(0, 400));
    const friendly = /ultralytics/i.test(raw)
      ? 'ยังไม่ได้ติดตั้งไลบรารี ultralytics ใน Python ของเครื่องนี้'
      : /timed out|ETIMEDOUT|SIGTERM/i.test(raw) ? 'ประมวลผลนานเกินกำหนด' : 'เรียกใช้งานไม่สำเร็จ';
    return { ok: false, boxes: [], error: friendly };
  }
}

/** บริบทจากผู้ใช้ — บอกโมเดลชัด ๆ ว่าเป็นข้อมูลประกอบ ห้ามใช้แทนสิ่งที่เห็นในภาพ */
function userContext(part: string, hint: string): string {
  if (!part && !hint) return '';
  return `\n\nข้อมูลจากผู้ใช้ (ใช้ประกอบเท่านั้น ถ้าขัดกับสิ่งที่เห็นในภาพให้ยึดภาพเป็นหลัก):${part ? `\n- ส่วนของต้นที่ถ่าย: ${part}` : ''}${hint ? `\n- อาการที่ผู้ใช้สังเกตเห็น: ${hint}` : ''}`;
}

export async function POST(request: Request) {
  let tempPath: string | null = null;

  try {
    const form = await request.formData();
    const file = (form.get('image') ?? form.get('file')) as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'ไม่พบไฟล์รูปภาพ กรุณาเลือกรูปก่อน' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'ไฟล์ใหญ่เกิน 12 MB กรุณาย่อรูปหรือถ่ายใหม่' },
        { status: 413 },
      );
    }

    const fresh = form.get('fresh') === '1';
    // ข้อมูลที่ผู้ใช้เลือกเอง (ส่วนของต้น/อาการที่เห็น) — ใช้เป็นบริบทเท่านั้น ตัดความยาวและอักขระแปลก ๆ ออก
    const clean = (v: FormDataEntryValue | null, max: number) =>
      typeof v === 'string' ? v.replace(/[^\p{L}\p{N}\s,./()-]/gu, '').trim().slice(0, max) : '';
    const part = clean(form.get('part'), 30);
    const hint = clean(form.get('hint'), 160);
    const bytes = Buffer.from(await file.arrayBuffer());
    const hash = createHash('sha256').update(bytes).update(`|${part}|${hint}`).digest('hex');
    const hit = cache.get(hash);
    if (!fresh && hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return NextResponse.json({ ...hit.body, cached: true });
    }

    const mime = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
    const buffer = bytes;
    const base64 = buffer.toString('base64');

    // เขียนไฟล์ชั่วคราวไว้ให้ YOLO อ่าน (ไม่เขียนลง public/ เพื่อไม่ให้ไฟล์ค้างสะสม)
    const dir = await mkdtemp(join(tmpdir(), 'corn-detect-'));
    tempPath = join(dir, `upload-${Date.now()}.jpg`);
    await writeFile(tempPath, buffer);

    // เรียก Gemini และ YOLO พร้อมกัน — Gemini เป็นตัวหลัก, YOLO รอเพิ่มได้ไม่เกิน YOLO_GRACE_MS หลัง Gemini เสร็จ
    // (โหลด PyTorch ครั้งแรกอาจช้า ต้องไม่ลากให้ผู้ใช้รอนาน)
    const kb = await loadKnowledgeBase();
    const yoloPromise = runYolo(tempPath, kb);
    const aiResult = await callGemini({
      system: buildSystemPrompt(kb),
      parts: [{ text: IMAGE_PROMPT + userContext(part, hint) }, { inline_data: { mime_type: mime, data: base64 } }],
      json: true,
      schema: RESPONSE_SCHEMA as unknown as Record<string, unknown>,
      seed: 7,
      temperature: 0,
      maxOutputTokens: 3072,
      timeoutMs: 100_000,
      validate: (text) => {
        const r = parseJsonLoose<GeminiResult>(text);
        if (!r || typeof r !== 'object' || !Array.isArray(r.findings)) throw new Error('ไม่มีรายการ findings');
      },
    });
    const yoloResult = await Promise.race([
      yoloPromise,
      new Promise<{ ok: boolean; boxes: Finding[]; error?: string }>((resolve) =>
        setTimeout(() => resolve({ ok: false, boxes: [], error: 'ประมวลผลช้าเกินกำหนด (ข้ามไปก่อน)' }), YOLO_GRACE_MS),
      ),
    ]);

    const parsed = parseJsonLoose<GeminiResult>(aiResult.text);
    const imageQuality = parsed.image_quality ?? 'good';
    // ภาพไม่ใช่ข้าวโพด — ไม่แสดงชื่อโรค/แมลงที่โมเดลอาจเดามา
    const rawFindings = parsed.is_corn === false ? [] : (parsed.findings ?? []);
    const aiFindings = rawFindings.filter((f) => f && typeof f === 'object').map((f) => enrichFinding(f, kb));

    // ใช้ YOLO ยืนยัน/เติมกรอบให้ผลของ Gemini: ผลที่ตรงกันมั่นใจขึ้น, YOLO ที่ Gemini ไม่เห็นด้วยเก็บเป็นข้อมูลเสริม
    const aiKeys = new Set(aiFindings.map((f) => f.kbId).filter(Boolean));
    for (const f of aiFindings) {
      const match = yoloResult.boxes.find((bx) => bx.kbId && bx.kbId === f.kbId);
      if (match) {
        f.source = 'both';
        f.box = f.box ?? match.box;
        f.confidence = Math.min(98, Math.max(f.confidence, Math.round((f.confidence + match.confidence) / 2) + 5));
      }
    }
    const findings = consolidateFindings(aiFindings, imageQuality);
    const extraYolo = parsed.is_corn === false ? [] : yoloResult.boxes.filter((bx) => !aiKeys.has(bx.kbId)).slice(0, 3);

    const body = {
      success: true,
      model: aiResult.model,
      isCorn: parsed.is_corn !== false,
      imageQuality,
      plantPart: parsed.plant_part ?? 'ไม่ชัดเจน',
      growthStageGuess: parsed.growth_stage_guess ?? '',
      findings,
      yolo: {
        available: yoloResult.ok,
        error: yoloResult.error,
        count: yoloResult.boxes.length,
        extra: extraYolo,
      },
      summary: parsed.summary_th ?? '',
      nextSteps: parsed.next_steps_th ?? [],
      needBetterPhoto: parsed.need_better_photo === true,
      photoTip: parsed.photo_tip_th ?? '',
      analyzedAt: new Date().toISOString(),
      disclaimer:
        'AI ช่วยดูเบื้องต้นเท่านั้น ก่อนใช้สารเคมีอย่าลืมอ่านฉลากผลิตภัณฑ์ และถามเจ้าหน้าที่ส่งเสริมการเกษตรในพื้นที่อีกที',
    };

    // เก็บแคชเฉพาะผลที่ใช้ได้จริง (ไม่เก็บกรณีภาพไม่ชัดที่ควรถ่ายใหม่)
    if (!body.needBetterPhoto) {
      if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
      cache.set(hash, { at: Date.now(), body });
    }
    return NextResponse.json(body);
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    console.error('[/api/detect]', message);

    const friendly =
      status === 503 ? 'ระบบ AI กำลังมีผู้ใช้งานหนาแน่น กรุณาลองใหม่อีกครั้งในอีกสักครู่'
      : status === 429 ? 'ใช้งานเกินโควต้าที่กำหนดในช่วงนี้ กรุณาลองใหม่ภายหลัง'
      : status === 401 || status === 403 ? 'คีย์ API ไม่ถูกต้องหรือหมดสิทธิ์ใช้งาน กรุณาตรวจสอบค่า GEMINI_API_KEY'
      : status === 502 || status === 504 ? 'AI ตอบช้าหรือตอบผิดรูปแบบหลายครั้งติดกัน กรุณาลองใหม่อีกครั้ง'
      : message;

    return NextResponse.json({ success: false, error: friendly, detail: message }, { status: status >= 400 ? status : 500 });
  } finally {
    if (tempPath) await unlink(tempPath).catch(() => {});
  }
}
