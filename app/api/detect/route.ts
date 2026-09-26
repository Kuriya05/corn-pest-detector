import { NextResponse } from 'next/server';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { callGemini, parseJsonLoose, GeminiError } from '@/lib/gemini';
import { SYSTEM_PROMPT, IMAGE_PROMPT, enrichFinding, type RawFinding, type Finding } from '@/lib/analysis';

const execAsync = promisify(exec);

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

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
async function runYolo(imagePath: string): Promise<{ ok: boolean; boxes: Finding[]; error?: string }> {
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
    const { stdout } = await execAsync(cmd, { timeout: 60_000, maxBuffer: 8 * 1024 * 1024 });
    const start = stdout.indexOf('[');
    if (start === -1) return { ok: false, boxes: [], error: 'YOLO ไม่ได้ส่ง JSON กลับมา' };

    const parsed = JSON.parse(stdout.slice(start)) as {
      class: string; confidence: number; box: { top: string; left: string; width: string; height: string };
    }[];

    const boxes: Finding[] = parsed.map((p) => {
      const num = (v: string) => parseFloat(String(v).replace('%', '')) || 0;
      const enriched = enrichFinding({ type: 'pest', name_th: p.class, name_en: p.class, confidence: p.confidence });
      return {
        ...enriched,
        source: 'yolo',
        box: { top: num(p.box.top), left: num(p.box.left), width: num(p.box.width), height: num(p.box.height) },
      };
    });

    return { ok: true, boxes };
  } catch (err) {
    return { ok: false, boxes: [], error: err instanceof Error ? err.message.slice(0, 200) : 'เรียก YOLO ไม่สำเร็จ' };
  }
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

    const mime = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    // เขียนไฟล์ชั่วคราวไว้ให้ YOLO อ่าน (ไม่เขียนลง public/ เพื่อไม่ให้ไฟล์ค้างสะสม)
    const dir = await mkdtemp(join(tmpdir(), 'corn-detect-'));
    tempPath = join(dir, `upload-${Date.now()}.jpg`);
    await writeFile(tempPath, buffer);

    // เรียก Gemini และ YOLO พร้อมกัน
    const [aiResult, yoloResult] = await Promise.all([
      callGemini({
        system: SYSTEM_PROMPT,
        parts: [{ text: IMAGE_PROMPT }, { inline_data: { mime_type: mime, data: base64 } }],
        json: true,
        temperature: 0.15,
        maxOutputTokens: 3072,
        timeoutMs: 100_000,
      }),
      runYolo(tempPath),
    ]);

    const parsed = parseJsonLoose<GeminiResult>(aiResult.text);
    const findings = (parsed.findings ?? []).slice(0, 4).map(enrichFinding);

    // ถ้า YOLO เจอแมลงที่ Gemini ไม่ได้รายงาน ให้เพิ่มเข้าไปเป็นข้อมูลเสริม
    const known = new Set(findings.map((f) => f.nameTh));
    const extraYolo = yoloResult.boxes.filter((b) => !known.has(b.nameTh)).slice(0, 3);

    return NextResponse.json({
      success: true,
      model: aiResult.model,
      isCorn: parsed.is_corn !== false,
      imageQuality: parsed.image_quality ?? 'good',
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
        'ผลวิเคราะห์จาก AI เป็นข้อมูลประกอบการตัดสินใจเท่านั้น ก่อนใช้สารเคมีให้อ่านฉลากผลิตภัณฑ์และปรึกษาเจ้าหน้าที่ส่งเสริมการเกษตรในพื้นที่ทุกครั้ง',
    });
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    console.error('[/api/detect]', message);

    const friendly =
      status === 503 ? 'ระบบ AI กำลังมีผู้ใช้งานหนาแน่น กรุณาลองใหม่อีกครั้งในอีกสักครู่'
      : status === 429 ? 'ใช้งานเกินโควต้าที่กำหนดในช่วงนี้ กรุณาลองใหม่ภายหลัง'
      : status === 401 || status === 403 ? 'คีย์ API ไม่ถูกต้องหรือหมดสิทธิ์ใช้งาน กรุณาตรวจสอบค่า GEMINI_API_KEY'
      : message;

    return NextResponse.json({ success: false, error: friendly, detail: message }, { status: status >= 400 ? status : 500 });
  } finally {
    if (tempPath) await unlink(tempPath).catch(() => {});
  }
}
