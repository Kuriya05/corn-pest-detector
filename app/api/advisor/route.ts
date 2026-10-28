import { NextResponse } from 'next/server';
import { callGemini, parseJsonLoose, GeminiError } from '@/lib/gemini';
import { buildSystemPrompt, loadKnowledgeBase, enrichFinding, type RawFinding } from '@/lib/analysis';

export const runtime = 'nodejs';
export const maxDuration = 90;

type Body = {
  /** อาการที่เกษตรกรเลือกหรือพิมพ์ */
  symptoms?: string[];
  note?: string;
  plantAgeDays?: number;
  plantPart?: string;
  province?: string;
};

/** โครงสร้าง JSON ที่บังคับให้ AI ตอบ — ลดโอกาสได้คำตอบผิดรูปแบบ */
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    findings: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          type: { type: 'STRING', enum: ['pest', 'disease', 'deficiency', 'unknown'] },
          name_th: { type: 'STRING' },
          name_en: { type: 'STRING' },
          confidence: { type: 'INTEGER' },
          severity: { type: 'STRING', enum: ['low', 'medium', 'high', 'critical'] },
          evidence: { type: 'STRING' },
        },
        required: ['type', 'name_th', 'confidence', 'severity', 'evidence'],
      },
    },
    summary_th: { type: 'STRING' },
    next_steps_th: { type: 'ARRAY', items: { type: 'STRING' } },
    check_in_field_th: { type: 'ARRAY', items: { type: 'STRING' } },
    ask_back_th: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['findings', 'summary_th', 'next_steps_th'],
};

type Parsed = {
  findings?: RawFinding[];
  summary_th?: string;
  next_steps_th?: string[];
  check_in_field_th?: string[];
  ask_back_th?: string[];
};

const strList = (v: unknown, max: number) =>
  (Array.isArray(v) ? v : []).map((x) => String(x ?? '').trim()).filter(Boolean).slice(0, max);

const PROMPT = (b: Body) => `เกษตรกรแจ้งอาการในแปลงข้าวโพดดังนี้

- ส่วนของต้นที่พบปัญหา: ${b.plantPart || 'ไม่ระบุ'}
- อายุข้าวโพด: ${b.plantAgeDays ? `${b.plantAgeDays} วันหลังปลูก` : 'ไม่ระบุ'}
- จังหวัด/พื้นที่: ${b.province || 'ไม่ระบุ'}
- อาการที่สังเกตได้: ${(b.symptoms ?? []).join(', ') || 'ไม่ระบุ'}
- รายละเอียดเพิ่มเติมจากเกษตรกร: ${b.note || '-'}

จงวินิจฉัยว่าน่าจะเป็นอะไรได้บ้าง ตอบเป็น JSON ตามโครงสร้างนี้เท่านั้น:

{
  "findings": [
    { "type": "pest"|"disease"|"deficiency"|"unknown", "name_th": string, "name_en": string, "confidence": number, "severity": "low"|"medium"|"high"|"critical", "evidence": string }
  ],
  "summary_th": string,
  "next_steps_th": [string],
  "check_in_field_th": [string],
  "ask_back_th": [string]
}

กติกา:
- findings เรียงจากเป็นไปได้มากไปน้อย สูงสุด 3 รายการ
- evidence คืออธิบายว่าอาการที่แจ้งมาตรงกับโรค/แมลงนั้นอย่างไร และตรงกับอายุข้าวโพดที่แจ้งหรือไม่
- check_in_field_th คือสิ่งที่ให้เกษตรกรออกไปดูเพิ่มในแปลงเพื่อยืนยัน เช่น "พลิกใต้ใบดูว่ามีผงสีขาวตอนเช้าหรือไม่" 2–4 ข้อ
- ask_back_th คือคำถามที่ควรถามกลับถ้าข้อมูลยังไม่พอ 0–3 ข้อ
- ถ้าข้อมูลน้อยเกินกว่าจะวินิจฉัย ให้ findings ว่าง แล้วใส่คำถามใน ask_back_th แทน`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    if (!body.symptoms?.length && !body.note?.trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกอาการอย่างน้อย 1 ข้อ หรือพิมพ์อธิบายอาการที่พบ' },
        { status: 400 },
      );
    }

    const kb = await loadKnowledgeBase();
    const result = await callGemini({
      system: buildSystemPrompt(kb),
      parts: [{ text: PROMPT(body) }],
      json: true,
      schema: SCHEMA,
      temperature: 0,
      seed: 7,
      maxOutputTokens: 2560,
      validate: (text) => {
        const r = parseJsonLoose<Parsed>(text);
        if (!r || typeof r !== 'object') throw new Error('ไม่ใช่ JSON object');
      },
    });

    const parsed = parseJsonLoose<Parsed>(result.text);

    return NextResponse.json({
      success: true,
      model: result.model,
      findings: (Array.isArray(parsed.findings) ? parsed.findings : [])
        .filter((f) => f && typeof f === 'object')
        .slice(0, 3)
        .map((f) => enrichFinding(f, kb)),
      summary: String(parsed.summary_th ?? ''),
      nextSteps: strList(parsed.next_steps_th, 6),
      checkInField: strList(parsed.check_in_field_th, 6),
      askBack: strList(parsed.ask_back_th, 3),
      disclaimer:
        'การเดาจากอาการอย่างเดียวพลาดได้ง่าย ถ้าถ่ายรูปมาสแกนเพิ่มหรือถามเจ้าหน้าที่เกษตรในพื้นที่ จะมั่นใจขึ้นนะครับ',
    });
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
    console.error('[/api/advisor]', message);
    const friendly =
      status === 503 ? 'ระบบ AI กำลังมีผู้ใช้งานหนาแน่น กรุณาลองใหม่อีกครั้งในอีกสักครู่'
      : status === 401 || status === 403 ? 'คีย์ API ไม่ถูกต้อง กรุณาตรวจสอบค่า GEMINI_API_KEY'
      : status === 429 ? 'ใช้งานเกินโควต้าที่กำหนดในช่วงนี้ กรุณาลองใหม่ภายหลัง'
      : status === 502 || status === 504 ? 'AI ตอบช้าหรือตอบผิดรูปแบบหลายครั้งติดกัน กรุณาลองใหม่อีกครั้ง'
      : message;
    return NextResponse.json({ success: false, error: friendly }, { status: status >= 400 ? status : 500 });
  }
}
