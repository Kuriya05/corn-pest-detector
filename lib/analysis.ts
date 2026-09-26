import { matchPest } from './data/pests';
import { matchDisease } from './data/diseases';
import { matchDeficiency } from './data/fertilizer';
import type { Severity } from './data/types';

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
  source?: 'gemini' | 'yolo';
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

/** เติมข้อมูลจากคลังความรู้ให้ผลที่ AI ตรวจพบ */
export function enrichFinding(raw: RawFinding): Finding {
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

  const query = [nameTh, nameEn].filter(Boolean).join(' ');

  if (type === 'pest' || type === 'damage' || type === 'unknown') {
    const pest = matchPest(query);
    if (pest) {
      finding.link = { href: `/pests#${pest.id}`, label: `ดูวิธีจัดการ${pest.nameTh}` };
      finding.severity = pest.severity;
      finding.quickActions = [
        ...(pest.threshold ? [`เกณฑ์ตัดสินใจพ่นสาร: ${pest.threshold}`] : []),
        ...pest.cultural.slice(0, 2),
        ...(pest.chemicals[0] ? [`สารที่แนะนำ: ${pest.chemicals[0].name} ${pest.chemicals[0].formulation ?? ''} อัตรา ${pest.chemicals[0].rate}`] : []),
      ];
      if (type === 'unknown' || type === 'damage') finding.type = 'pest';
      return finding;
    }
  }

  if (type === 'disease' || type === 'unknown') {
    const disease = matchDisease(query);
    if (disease) {
      finding.link = { href: `/diseases#${disease.id}`, label: `ดูวิธีจัดการ${disease.nameTh}` };
      finding.severity = disease.severity;
      finding.quickActions = [
        ...disease.cultural.slice(0, 2),
        ...(disease.chemicals[0] ? [`สารที่แนะนำ: ${disease.chemicals[0].name} ${disease.chemicals[0].formulation ?? ''} อัตรา ${disease.chemicals[0].rate}`] : []),
        ...(disease.warnings?.slice(0, 1) ?? []),
      ];
      if (type === 'unknown') finding.type = 'disease';
      return finding;
    }
  }

  if (type === 'deficiency' || type === 'unknown') {
    const def = matchDeficiency(query);
    if (def) {
      finding.link = { href: `/fertilizer#deficiency-${def.id}`, label: `ดูวิธีแก้อาการขาด${def.nutrient}` };
      finding.quickActions = [def.quickSign, def.fix];
      if (type === 'unknown') finding.type = 'deficiency';
      return finding;
    }
  }

  return finding;
}

export const SYSTEM_PROMPT = `คุณคือนักวิชาการโรคพืชและกีฏวิทยาข้าวโพดของกรมวิชาการเกษตรไทย มีหน้าที่ช่วยเกษตรกรผู้ปลูกข้าวโพดเลี้ยงสัตว์วินิจฉัยปัญหาในแปลงจากภาพถ่าย

หลักการที่ต้องยึดอย่างเคร่งครัด:
1. ตอบเป็นภาษาไทยที่เกษตรกรอ่านเข้าใจ ใช้คำเรียกที่ใช้กันจริงในไทย
2. ถ้าภาพไม่ใช่ข้าวโพด ให้ระบุ is_corn เป็น false และอย่าเดาโรค
3. ถ้าภาพเบลอ มืด หรือถ่ายไกลเกินไปจนดูไม่ออก ให้บอกตรง ๆ ผ่าน image_quality และให้ค่า confidence ต่ำ
4. ห้ามเดาชื่อโรคหรือแมลงถ้าหลักฐานในภาพไม่พอ — ให้ใช้ type เป็น "unknown" และอธิบายสิ่งที่เห็นแทน
5. ค่า confidence ต้องสะท้อนความมั่นใจจริง ไม่ใช่ตัวเลขสวย ๆ
6. อ้างอิงเฉพาะโรคและแมลงที่พบจริงในประเทศไทย

รายชื่อแมลงศัตรูข้าวโพดที่พบในไทย: หนอนกระทู้ข้าวโพดลายจุด, หนอนเจาะลำต้นข้าวโพด, หนอนเจาะฝักข้าวโพด, เพลี้ยอ่อนข้าวโพด, เพลี้ยไฟ, มอดดิน, หนอนกระทู้หอม, หนอนกระทู้คอรวง, ตั๊กแตน, ด้วงกุหลาบ, ด้วงงวงข้าวโพด

รายชื่อโรคข้าวโพดที่พบในไทย: โรคราน้ำค้าง (ใบลาย), โรคใบไหม้แผลใหญ่, โรคใบไหม้แผลเล็ก, โรคราสนิม, โรคใบจุด, โรคกาบและใบไหม้, โรคต้นเน่าจากแบคทีเรีย, โรคต้นเน่าจากฟิวซาเรียม, โรคฝักเน่า–เมล็ดเน่า, โรคใบด่าง/ใบด่างแคระ (ไวรัส), โรคราเขม่าดำ
หมายเหตุ: ไม่มีรายงานทางการของโรค Gray leaf spot (Cercospora) ในข้าวโพดในประเทศไทย อย่าวินิจฉัยโรคนี้

อาการขาดธาตุอาหารที่พบบ่อย: ขาดไนโตรเจน, ขาดฟอสฟอรัส, ขาดโพแทสเซียม, ขาดแมกนีเซียม, ขาดสังกะสี, ขาดโบรอน, ขาดกำมะถัน, ขาดแคลเซียม`;

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
