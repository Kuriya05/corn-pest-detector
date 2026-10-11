/**
 * ตัวช่วยฝั่ง "ผู้ช่วยเสียง" — ให้หน้าต่าง ๆ ส่งข้อความไปให้แผงช่วยเหลืออ่านออกเสียง
 * โดยไม่ต้องผูกโค้ดเข้าหากัน (ส่งผ่าน CustomEvent)
 */
export const VOICE_EVENT = 'maize:speak';

/** force = true คือผู้ใช้กดปุ่ม "ฟังผล" เอง (อ่านเสมอ) · false = อ่านเฉพาะเมื่อเปิด "อ่านผลอัตโนมัติ" */
export function speakResult(text: string, force = false) {
  if (typeof window === 'undefined' || !text.trim()) return;
  window.dispatchEvent(new CustomEvent(VOICE_EVENT, { detail: { text, force } }));
}

type FindingLike = { nameTh: string; confidence: number; type?: string; severity?: string; evidence?: string };

const SEVERITY_TH: Record<string, string> = { low: 'ต้องเฝ้าระวัง', medium: 'ระดับปานกลาง', high: 'รุนแรง', critical: 'รุนแรงมาก' };

/** เรียบเรียงผลสแกน/ผลประเมินเป็นประโยคพูด — สั้น เข้าใจง่าย ไม่อ่านตัวเลขเยอะเกินไป */
export function describeResult(opts: {
  title: string;
  findings: FindingLike[];
  summary?: string;
  nextSteps?: string[];
  needBetterPhoto?: boolean;
  photoTip?: string;
}): string {
  const parts: string[] = [opts.title];
  const top = opts.findings[0];

  if (opts.needBetterPhoto) parts.push(`ภาพยังไม่ค่อยชัด ${opts.photoTip ?? 'ลองถ่ายใหม่ให้ชัดขึ้นอีกครั้ง'}`);

  if (!top) {
    parts.push('ยังสรุปไม่ได้ว่าเป็นอะไร ลองถ่ายรูปเพิ่มหรือเล่าอาการให้มากขึ้น');
  } else if (top.type === 'healthy') {
    parts.push('ต้นข้าวโพดดูสมบูรณ์ดี ไม่พบความผิดปกติชัดเจน');
  } else {
    const sev = top.severity ? `ระดับ${SEVERITY_TH[top.severity] ?? ''}` : '';
    parts.push(`น่าจะเป็น ${top.nameTh} AI มั่นใจประมาณ ${top.confidence} เปอร์เซ็นต์ ${sev}`.trim());
    if (opts.findings[1]) parts.push(`รองลงมาอาจเป็น ${opts.findings[1].nameTh}`);
  }

  if (opts.summary) parts.push(opts.summary);
  if (opts.nextSteps?.length) {
    parts.push('สิ่งที่ควรทำต่อ');
    opts.nextSteps.slice(0, 4).forEach((s, i) => parts.push(`ข้อ ${i + 1} ${s}`));
  }
  parts.push('ผลนี้เป็นการช่วยดูเบื้องต้น ก่อนใช้สารเคมีควรถามเจ้าหน้าที่เกษตรในพื้นที่');
  return parts.join('\n');
}
