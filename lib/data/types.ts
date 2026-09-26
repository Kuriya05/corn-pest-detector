/** ชนิดข้อมูลกลางที่ใช้ร่วมกันทั้งเว็บ */

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export const severityLabel: Record<Severity, string> = {
  low: 'เฝ้าระวัง',
  medium: 'ปานกลาง',
  high: 'รุนแรง',
  critical: 'รุนแรงที่สุด',
};

export const severityStyle: Record<Severity, string> = {
  low: 'bg-sky-100 text-sky-800 ring-sky-200',
  medium: 'bg-amber-100 text-amber-900 ring-amber-200',
  high: 'bg-orange-100 text-orange-900 ring-orange-200',
  critical: 'bg-rose-100 text-rose-900 ring-rose-200',
};

/** สารป้องกันกำจัด 1 รายการ ตามคำแนะนำทางราชการ */
export type Chemical = {
  /** ชื่อสารออกฤทธิ์ภาษาไทย */
  name: string;
  /** เปอร์เซ็นต์และสูตร เช่น "12% SC" — ว่างไว้ได้ถ้าเอกสารต้นทางไม่ระบุ */
  formulation?: string;
  /** กลุ่มกลไกการออกฤทธิ์ (IRAC/FRAC) */
  group?: string;
  /** อัตราใช้ เช่น "20 มล. ต่อน้ำ 20 ลิตร" */
  rate: string;
  /** วิธีใช้ เช่น พ่นทางใบ / คลุกเมล็ด */
  method: 'พ่นทางใบ' | 'คลุกเมล็ด' | 'เหยื่อพิษ' | 'รมในโรงเก็บ' | 'ชีวภัณฑ์';
  note?: string;
};

export type SourceRef = {
  label: string;
  url: string;
};

export type Pest = {
  id: string;
  nameTh: string;
  nameEn: string;
  scientific: string;
  /** ชื่อเรียกอื่นที่เกษตรกรใช้ */
  aliases?: string[];
  severity: Severity;
  /** สรุปสั้น 1 บรรทัด สำหรับการ์ด */
  summary: string;
  /** จุดสังเกตตัวแมลง */
  identify: string[];
  /** ระยะข้าวโพดที่เข้าทำลาย */
  stage: string;
  /** อาการที่พบในแปลง */
  damage: string[];
  /** ระดับเศรษฐกิจ — เกณฑ์ตัดสินใจพ่นสาร */
  threshold?: string;
  /** ฤดู/สภาพอากาศที่ระบาด */
  season: string;
  /** วิธีเขตกรรม */
  cultural: string[];
  /** ชีววิธี */
  biological: string[];
  chemicals: Chemical[];
  /** ข้อควรระวัง */
  warnings?: string[];
  sources: SourceRef[];
  /** คำที่ใช้จับคู่กับผลตรวจจับของ AI */
  matchKeywords: string[];
};

export type Disease = {
  id: string;
  nameTh: string;
  nameEn: string;
  /** เชื้อสาเหตุ */
  pathogen: string;
  /** เชื้อรา/แบคทีเรีย/ไวรัส */
  kind: 'เชื้อรา' | 'แบคทีเรีย' | 'ไวรัส';
  severity: Severity;
  summary: string;
  /** อาการที่มองเห็น */
  symptoms: string[];
  /** จุดที่ใช้แยกจากโรคอื่นที่คล้ายกัน */
  distinguish?: string;
  /** สภาพแวดล้อมที่ทำให้เกิดโรค */
  conditions: string;
  stage: string;
  /** ความเสียหายต่อผลผลิต */
  lossImpact?: string;
  /** พันธุ์ต้านทาน */
  resistantVarieties?: string[];
  cultural: string[];
  chemicals: Chemical[];
  warnings?: string[];
  sources: SourceRef[];
  matchKeywords: string[];
};

/** ชีวภัณฑ์และศัตรูธรรมชาติ */
export type Biological = {
  id: string;
  nameTh: string;
  nameEn: string;
  scientific?: string;
  /** ประเภทของชีวภัณฑ์ */
  kind: 'เชื้อรา' | 'แบคทีเรีย' | 'ไวรัส' | 'แมลงตัวห้ำ' | 'แมลงตัวเบียน' | 'ไส้เดือนฝอย' | 'โปรโตซัว' | 'สารสกัดจากพืช';
  summary: string;
  /** ใช้ควบคุมศัตรูพืชชนิดใด */
  controls: string[];
  /** มีคำแนะนำอัตราใช้สำหรับข้าวโพดโดยตรงหรือไม่ */
  maizeSpecific: boolean;
  /** อัตราใช้หรืออัตราปล่อย */
  rate: string;
  howTo: string[];
  cautions: string[];
  sources: SourceRef[];
  matchKeywords: string[];
};

/** วัชพืชในไร่ข้าวโพด */
export type Weed = {
  id: string;
  nameTh: string;
  localNames?: string[];
  nameEn: string;
  scientific: string;
  group: 'ใบแคบ' | 'ใบกว้าง' | 'กก';
  lifeCycle: 'ฤดูเดียว' | 'ข้ามปี';
  /** ความถี่ที่พบจากการสำรวจแปลงข้าวโพดของกรมวิชาการเกษตร */
  frequency?: string;
  summary: string;
  /** ลักษณะที่ใช้จำแนกในแปลง */
  identify: string[];
  impact: string;
  cultural: string[];
  /** สารกำจัดวัชพืชที่ได้ผล */
  herbicides: string[];
  sources: SourceRef[];
  matchKeywords: string[];
};

/** พันธุ์ข้าวโพด */
export type Variety = {
  id: string;
  nameTh: string;
  code?: string;
  /** ชนิดของข้าวโพด */
  cropType: 'เลี้ยงสัตว์' | 'หวาน' | 'ข้าวเหนียว' | 'เทียน' | 'ฝักอ่อน';
  /** ประเภทพันธุ์ */
  hybridType: 'ลูกผสมเดี่ยว' | 'ลูกผสมสามทาง' | 'ผสมเปิด' | 'พันธุ์รับรอง';
  org: string;
  certifiedYear?: string;
  /** ผลผลิต */
  yield?: string;
  yieldDrought?: string;
  maturityDays?: string;
  silkingDays?: string;
  plantHeight?: string;
  earHeight?: string;
  /** ความต้านทานโรค — คีย์คือชื่อโรค */
  resistance: { disease: string; level: 'ต้านทาน' | 'ต้านทานปานกลาง' | 'อ่อนแอ' | 'ไม่ระบุ' }[];
  strengths: string[];
  recommendedFor: string;
  /** แหล่งติดต่อขอเมล็ดพันธุ์ */
  seedSource?: string;
  notes?: string[];
  sources: SourceRef[];
  matchKeywords: string[];
};
