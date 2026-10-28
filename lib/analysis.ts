import { getCollection } from './store';
import { normSeverity } from './normalize';
import type { Severity, Pest, Disease } from './data/types';
import type { Deficiency } from './data/fertilizer';

export type FindingType = 'pest' | 'disease' | 'deficiency' | 'damage' | 'healthy' | 'unknown';

export type RawFinding = {
  type?: string;
  name_th?: string;
  name_en?: string;
  confidence?: number;
  severity?: string;
  evidence?: string;
  box_2d?: number[];
};

export type Finding = {
  type: FindingType;
  nameTh: string;
  nameEn?: string;
  confidence: number;
  severity: Severity;
  evidence?: string;
  /** กรอบตำแหน่งบนภาพ หน่วยเปอร์เซ็นต์ */
  box?: { top: number; left: number; width: number; height: number };
  /** ลิงก์ไปหน้าคลังความรู้ที่ตรงกัน */
  link?: { href: string; label: string };
  /** คำแนะนำเร่งด่วนที่ดึงจากฐานข้อมูล */
  quickActions?: string[];
  source?: 'gemini' | 'yolo' | 'both';
  /** id ในคลังความรู้ที่จับคู่ได้ ใช้รวมผลจากหลายแหล่งให้ตรงกัน */
  kbId?: string;
};

const severityMap: Record<string, Severity> = {
  low: 'low', medium: 'medium', high: 'high', critical: 'critical',
  ต่ำ: 'low', ปานกลาง: 'medium', สูง: 'high', รุนแรง: 'high', รุนแรงที่สุด: 'critical',
};

const typeMap: Record<string, FindingType> = {
  pest: 'pest', disease: 'disease', deficiency: 'deficiency',
  damage: 'damage', healthy: 'healthy',
};

/** แปลงกรอบจาก Gemini (ymin,xmin,ymax,xmax สเกล 0–1000) เป็นเปอร์เซ็นต์ */
function toBox(box?: number[]): Finding['box'] {
  if (!Array.isArray(box) || box.length !== 4) return undefined;
  const [ymin, xmin, ymax, xmax] = box.map((n) => Math.max(0, Math.min(1000, Number(n) || 0)));
  if (ymax <= ymin || xmax <= xmin) return undefined;
  return {
    top: ymin / 10,
    left: xmin / 10,
    width: (xmax - xmin) / 10,
    height: (ymax - ymin) / 10,
  };
}

/** โมเดลบางครั้งตอบ confidence เป็นสเกล 0–1 แทน 0–100 — แปลงให้เป็นเปอร์เซ็นต์เสมอ */
function normalizeConfidence(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const scaled = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

/** คลังความรู้ที่ใช้จับคู่ผลของ AI — อ่านจากฐานข้อมูล (รวมรายการที่แอดมินเพิ่ม/แก้) */
export type KnowledgeBase = { pests: Pest[]; diseases: Disease[]; deficiencies: Deficiency[] };

const KB_TTL_MS = 60_000;
let kbCache: { at: number; kb: KnowledgeBase } | null = null;

export async function loadKnowledgeBase(): Promise<KnowledgeBase> {
  if (kbCache && Date.now() - kbCache.at < KB_TTL_MS) return kbCache.kb;
  const [pests, diseases, deficiencies] = await Promise.all([
    getCollection('pests'), getCollection('diseases'), getCollection('deficiencies'),
  ]);
  const kb = {
    pests: pests as unknown as Pest[],
    diseases: diseases as unknown as Disease[],
    deficiencies: deficiencies as unknown as Deficiency[],
  };
  kbCache = { at: Date.now(), kb };
  return kb;
}

/** ตัดช่องว่าง วงเล็บ และเครื่องหมายออก เพื่อให้ชื่อที่สะกดต่างกันเล็กน้อยเทียบกันได้ */
const norm = (s: unknown) => String(s ?? '').toLowerCase().replace(/[\s()[\]/,.–—_-]+/g, '');
const stripParen = (s: unknown) => String(s ?? '').replace(/\s*\(.*?\)\s*/g, ' ').trim();

type Matchable = { nameTh?: string; nameEn?: string; nutrient?: string; matchKeywords?: string[]; aliases?: string[] };

/**
 * หารายการในคลังที่ตรงกับชื่อจาก AI มากที่สุด
 * 1) ชื่อตรงกันทั้งชื่อ (ไทยหรืออังกฤษ) 2) คีย์เวิร์ดที่ยาวที่สุดที่อยู่ในชื่อ
 * — ไม่จับคู่คำสั้น ๆ เช่น "โรค" "หนอน" ที่ทำให้ได้รายการแรกของคลังแบบผิด ๆ
 */
function bestMatch<T extends Matchable>(items: T[], nameTh: string, nameEn: string): T | undefined {
  const th = norm(nameTh);
  const thCore = norm(stripParen(nameTh));
  const en = norm(nameEn);
  const q = `${th}|${en}`;
  if (!th && !en) return undefined;

  for (const it of items) {
    const names = [it.nameTh, stripParen(it.nameTh), it.nutrient && `ขาด${it.nutrient}`, ...(it.aliases ?? [])].map(norm).filter(Boolean);
    if ((th && (names.includes(th) || names.includes(thCore))) || (en && norm(it.nameEn) === en)) return it;
  }

  let best: T | undefined;
  let bestScore = 0;
  for (const it of items) {
    for (const raw of it.matchKeywords ?? []) {
      const k = norm(raw);
      if (k.length < 3) continue;
      const score = q.includes(k) ? k.length : (th.length >= 4 && k.includes(th)) ? th.length - 1 : 0;
      if (score > bestScore) { bestScore = score; best = it; }
    }
  }
  return best;
}

/** เติมข้อมูลจากคลังความรู้ให้ผลที่ AI ตรวจพบ */
export function enrichFinding(raw: RawFinding, kb: KnowledgeBase): Finding {
  const type = typeMap[String(raw.type ?? '').toLowerCase()] ?? 'unknown';
  const nameTh = (raw.name_th || raw.name_en || 'ไม่สามารถระบุได้').trim();
  const nameEn = raw.name_en?.trim();
  const confidence = normalizeConfidence(raw.confidence);

  const finding: Finding = {
    type,
    nameTh,
    nameEn,
    confidence,
    severity: severityMap[String(raw.severity ?? '').toLowerCase()] ?? 'medium',
    evidence: raw.evidence?.trim(),
    box: toBox(raw.box_2d),
    source: 'gemini',
  };

  const enQuery = nameEn ?? '';

  if (type === 'pest' || type === 'damage' || type === 'unknown') {
    const pest = bestMatch(kb.pests, nameTh, enQuery);
    if (pest) {
      finding.nameTh = pest.nameTh;
      finding.nameEn = pest.nameEn;
      finding.kbId = pest.id;
      finding.link = { href: `/pests#${pest.id}`, label: `ดูวิธีจัดการ${pest.nameTh}` };
      finding.severity = normSeverity(pest.severity);
      finding.quickActions = [
        ...(pest.threshold ? [`เกณฑ์ตัดสินใจพ่นสาร: ${pest.threshold}`] : []),
        ...(pest.cultural ?? []).slice(0, 2),
        ...(pest.chemicals?.[0] ? [`สารที่แนะนำ: ${pest.chemicals[0].name} ${pest.chemicals[0].formulation ?? ''} อัตรา ${pest.chemicals[0].rate}`] : []),
      ];
      if (type === 'unknown' || type === 'damage') finding.type = 'pest';
      return finding;
    }
  }

  if (type === 'disease' || type === 'unknown') {
    const disease = bestMatch(kb.diseases, nameTh, enQuery);
    if (disease) {
      finding.nameTh = disease.nameTh;
      finding.nameEn = disease.nameEn || finding.nameEn;
      finding.kbId = disease.id;
      finding.link = { href: `/diseases#${disease.id}`, label: `ดูวิธีจัดการ${disease.nameTh}` };
      finding.severity = normSeverity(disease.severity);
      finding.quickActions = [
        ...(disease.cultural ?? []).slice(0, 2),
        ...(disease.chemicals?.[0] ? [`สารที่แนะนำ: ${disease.chemicals[0].name} ${disease.chemicals[0].formulation ?? ''} อัตรา ${disease.chemicals[0].rate}`] : []),
        ...(disease.warnings?.slice(0, 1) ?? []),
      ];
      if (type === 'unknown') finding.type = 'disease';
      return finding;
    }
  }

  if (type === 'deficiency' || type === 'unknown') {
    const def = bestMatch(kb.deficiencies, nameTh, enQuery);
    if (def) {
      finding.kbId = `deficiency-${def.id}`;
      finding.link = { href: `/fertilizer#deficiency-${def.id}`, label: `ดูวิธีแก้อาการขาด${def.nutrient}` };
      finding.quickActions = [def.quickSign, def.fix].filter(Boolean);
      if (type === 'unknown') finding.type = 'deficiency';
      return finding;
    }
  }

  return finding;
}

/** หลักการวินิจฉัย (ส่วนคงที่) — ใช้ผ่าน buildSystemPrompt เพื่อเติมรายชื่อจากฐานข้อมูล */
const SYSTEM_PROMPT = `คุณคือนักวิชาการโรคพืชและกีฏวิทยาข้าวโพดของกรมวิชาการเกษตรไทย มีหน้าที่ช่วยเกษตรกรผู้ปลูกข้าวโพดเลี้ยงสัตว์วินิจฉัยปัญหาในแปลงจากภาพถ่าย

หลักการที่ต้องยึดอย่างเคร่งครัด:
1. ตอบเป็นภาษาไทยที่เกษตรกรอ่านเข้าใจ ใช้คำเรียกที่ใช้กันจริงในไทย น้ำเสียงเป็นกันเองและสุภาพ เหมือนเพื่อนที่รู้เรื่องข้าวโพดช่วยดูให้ ไม่ใช้ศัพท์ทางการหรือภาษาราชการเกินจำเป็น
2. ถ้าภาพไม่ใช่ข้าวโพด ให้ระบุ is_corn เป็น false และอย่าเดาโรค
3. ถ้าภาพเบลอ มืด หรือถ่ายไกลเกินไปจนดูไม่ออก ให้บอกตรง ๆ ผ่าน image_quality และให้ค่า confidence ต่ำ
4. ห้ามเดาชื่อโรคหรือแมลงถ้าหลักฐานในภาพไม่พอ — ให้ใช้ type เป็น "unknown" และอธิบายสิ่งที่เห็นแทน
5. ค่า confidence ต้องสะท้อนความมั่นใจจริง ไม่ใช่ตัวเลขสวย ๆ
6. อ้างอิงเฉพาะโรคและแมลงที่พบจริงในประเทศไทย
7. ชื่อใน name_th ต้องใช้ชื่อตามรายการด้านล่างให้ตรงตัวอักษรทุกครั้ง ห้ามตั้งชื่อใหม่หรือใช้ชื่อเรียกอื่น เพื่อให้ภาพเดียวกันได้ชื่อเดียวกันเสมอ ถ้าไม่ตรงกับรายการใดเลยให้ใช้ type "unknown"
8. พิจารณาจากสิ่งที่เห็นในภาพเท่านั้น ห้ามอนุมานจากฤดูกาลหรือสภาพอากาศ`;

/**
 * คำสั่งระบบพร้อมรายชื่อจากฐานข้อมูล — AI ต้องตอบชื่อตามนี้ตรงตัว ผลจึงจับคู่คลังได้ทุกครั้งและภาพเดิมได้ชื่อเดิม
 * (รายการที่แอดมินเพิ่มในฐานข้อมูลจะถูกส่งให้ AI รู้จักอัตโนมัติ)
 */
export function buildSystemPrompt(kb: KnowledgeBase): string {
  const list = (names: (string | undefined)[]) => [...new Set(names.map((n) => n?.trim()).filter(Boolean))].join(', ');
  return `${SYSTEM_PROMPT}

รายชื่อแมลงและสัตว์ศัตรูข้าวโพดที่พบในไทย: ${list(kb.pests.map((p) => p.nameTh))}

รายชื่อโรคข้าวโพดที่พบในไทย: ${list(kb.diseases.map((d) => d.nameTh))}
หมายเหตุ: ไม่มีรายงานทางการของโรค Gray leaf spot (Cercospora) ในข้าวโพดในประเทศไทย อย่าวินิจฉัยโรคนี้

อาการขาดธาตุอาหาร (ใช้ชื่อรูปแบบ "ขาด…"): ${list(kb.deficiencies.map((d) => `ขาด${d.nutrient}`))}`;
}

export const IMAGE_PROMPT = `วิเคราะห์ภาพนี้แล้วตอบกลับเป็น JSON ตามโครงสร้างนี้เท่านั้น ห้ามมีข้อความอื่นนอก JSON:

{
  "is_corn": boolean,
  "image_quality": "good" | "blurry" | "too_dark" | "too_far" | "not_plant",
  "plant_part": "ใบ" | "ลำต้น" | "ยอด" | "ฝัก" | "ราก" | "ทั้งต้น" | "ไม่ชัดเจน",
  "growth_stage_guess": string,
  "findings": [
    {
      "type": "pest" | "disease" | "deficiency" | "damage" | "healthy" | "unknown",
      "name_th": string,
      "name_en": string,
      "confidence": number,
      "severity": "low" | "medium" | "high" | "critical",
      "evidence": string,
      "box_2d": [ymin, xmin, ymax, xmax]
    }
  ],
  "summary_th": string,
  "next_steps_th": [string],
  "need_better_photo": boolean,
  "photo_tip_th": string
}

กติกา:
- box_2d ใช้สเกล 0–1000 เทียบกับขนาดภาพ เรียงเป็น [บน, ซ้าย, ล่าง, ขวา] ให้ครอบเฉพาะบริเวณที่พบอาการหรือตัวแมลง ถ้าระบุตำแหน่งไม่ได้ให้ละฟิลด์นี้
- confidence ต้องเป็นจำนวนเต็มระหว่าง 0 ถึง 100 (เช่น 85 หมายถึงมั่นใจ 85%) ห้ามตอบเป็นทศนิยม 0–1
- findings เรียงจากมั่นใจมากไปน้อย สูงสุด 4 รายการ
- evidence ต้องอธิบายสิ่งที่ "เห็นในภาพจริง" เช่น รูปร่างแผล สี ตำแหน่ง ไม่ใช่ความรู้ทั่วไป
- next_steps_th เป็นสิ่งที่เกษตรกรควรทำใน 1–7 วันข้างหน้า 2–4 ข้อ สั้น กระชับ ลงมือได้จริง
- ถ้าต้นดูปกติดี ให้ findings มี 1 รายการ type = "healthy"`;


/** โครงสร้าง JSON ที่บังคับให้ Gemini ตอบ (ลดปัญหา JSON เพี้ยน/ฟิลด์หาย) */
export const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    is_corn: { type: 'BOOLEAN' },
    image_quality: { type: 'STRING', enum: ['good', 'blurry', 'too_dark', 'too_far', 'not_plant'] },
    plant_part: { type: 'STRING' },
    growth_stage_guess: { type: 'STRING' },
    findings: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          type: { type: 'STRING', enum: ['pest', 'disease', 'deficiency', 'damage', 'healthy', 'unknown'] },
          name_th: { type: 'STRING' },
          name_en: { type: 'STRING' },
          confidence: { type: 'INTEGER' },
          severity: { type: 'STRING', enum: ['low', 'medium', 'high', 'critical'] },
          evidence: { type: 'STRING' },
          box_2d: { type: 'ARRAY', items: { type: 'INTEGER' } },
        },
        required: ['type', 'name_th', 'confidence', 'severity', 'evidence'],
      },
    },
    summary_th: { type: 'STRING' },
    next_steps_th: { type: 'ARRAY', items: { type: 'STRING' } },
    need_better_photo: { type: 'BOOLEAN' },
    photo_tip_th: { type: 'STRING' },
  },
  required: ['is_corn', 'image_quality', 'findings', 'summary_th', 'next_steps_th', 'need_better_photo'],
} as const;

const QUALITY_CAP: Record<string, number> = { good: 100, blurry: 55, too_dark: 55, too_far: 55, not_plant: 20 };

/**
 * ทำความสะอาดและจัดลำดับผลจาก AI ให้คงเส้นคงวา
 * - รวมรายการที่ตรงกับคลังความรู้เดียวกัน เก็บอันที่มั่นใจสูงสุด
 * - จำกัดค่าความมั่นใจตามคุณภาพภาพ (ภาพไม่ชัดห้ามมั่นใจสูง)
 * - ถ้ามีผล healthy ปนกับโรค/แมลงที่มั่นใจพอ ให้ตัด healthy ทิ้ง (ขัดแย้งกันเอง)
 */
export function consolidateFindings(list: Finding[], imageQuality: string): Finding[] {
  const cap = QUALITY_CAP[imageQuality] ?? 100;
  const byKey = new Map<string, Finding>();
  for (const f of list) {
    const key = f.kbId ?? `${f.type}:${f.nameTh.toLowerCase()}`;
    const capped = { ...f, confidence: Math.min(f.confidence, cap) };
    const prev = byKey.get(key);
    if (!prev || capped.confidence > prev.confidence) {
      byKey.set(key, { ...capped, box: capped.box ?? prev?.box });
    } else if (!prev.box && capped.box) {
      prev.box = capped.box;
    }
  }
  let out = [...byKey.values()].sort((a, b) => b.confidence - a.confidence);
  if (out.some((f) => f.type !== 'healthy' && f.type !== 'unknown' && f.confidence >= 40)) {
    out = out.filter((f) => f.type !== 'healthy');
  }
  return out.slice(0, 4);
}
