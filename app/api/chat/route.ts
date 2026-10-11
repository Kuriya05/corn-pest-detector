import { NextResponse } from 'next/server';
import { callGemini, parseJsonLoose, GeminiError } from '@/lib/gemini';
import { getAllCollections, titleField, type CollectionName } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Msg = { role: 'user' | 'ai'; text: string };
type Body = { messages?: Msg[]; plot?: { name?: string; ageDays?: number; stage?: string; province?: string } };

const MAX_MSGS = 10;
const MAX_CHARS = 1000;

/** หน้าที่ AI อ้างลิงก์ไปได้ — กันลิงก์มั่ว */
const PAGE_PREFIX: Record<CollectionName, string> = {
  pests: '/pests#', diseases: '/diseases#', deficiencies: '/fertilizer#deficiency-', weeds: '/weeds#',
  varieties: '/varieties#', biologicals: '/biologicals#', chemicals: '/chemicals#',
};
const STATIC_PAGES = ['/detect', '/diseases#advisor', '/fertilizer', '/calendar', '/weather', '/farm', '/profit', '/shop', '/chat', '/pests', '/diseases', '/weeds', '/varieties', '/biologicals', '/chemicals'];

const clip = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

/** สรุปคลังความรู้ (รวมข้อมูลที่แอดมินแก้) เป็นข้อความสั้น ๆ ให้ AI ใช้ตอบ */
async function buildKnowledge(): Promise<{ text: string; allowed: Set<string>; titles: { title: string; href: string }[] }> {
  const cols = await getAllCollections();
  const allowed = new Set<string>(STATIC_PAGES);
  const lines: string[] = [];
  const titles: { title: string; href: string }[] = [];
  for (const name of Object.keys(PAGE_PREFIX) as CollectionName[]) {
    const label = { pests: 'แมลง', diseases: 'โรค', deficiencies: 'ธาตุอาหาร', weeds: 'วัชพืช', varieties: 'พันธุ์', biologicals: 'ชีวภัณฑ์', chemicals: 'สาร' }[name];
    for (const it of cols[name] ?? []) {
      const r = it as Record<string, unknown>;
      const href = `${PAGE_PREFIX[name]}${it.id}`;
      allowed.add(href);
      const ttl = clip(r[titleField[name]], 80).replace(/\s*\(.*?\)\s*/g, '').trim();
      if (ttl.length >= 4) titles.push({ title: ttl, href });
      const bits = [
        clip(r[titleField[name]], 80),
        r.nameEn ? `(${clip(r.nameEn, 50)})` : '',
        clip(r.summary ?? r.quickSign, 200),
        r.threshold ? `เกณฑ์พ่น: ${clip(r.threshold, 160)}` : '',
        r.fix ? `วิธีแก้: ${clip(r.fix, 160)}` : '',
        Array.isArray(r.cultural) && r.cultural.length ? `เขตกรรม: ${clip((r.cultural as string[]).slice(0, 2).join('; '), 180)}` : '',
      ].filter(Boolean);
      lines.push(`[${label}] ${bits.join(' · ')} → ${href}`);
    }
  }
  return { text: lines.join('\n'), allowed, titles };
}

const SYSTEM = `คุณคือ "น้องข้าวโพด" ผู้ช่วยตอบคำถามเรื่องการปลูกข้าวโพดเลี้ยงสัตว์ในประเทศไทย ของมหาวิทยาลัยแม่โจ้
น้ำเสียง: เป็นกันเอง สุภาพ เหมือนเพื่อนเกษตรกรที่รู้เรื่อง ไม่ใช้ภาษาราชการ ตอบสั้น กระชับ ลงมือทำได้จริง

กติกา:
1. ใช้ "คลังความรู้" ที่ให้มาเป็นหลัก ถ้าเรื่องที่ถามไม่อยู่ในคลัง ให้บอกตรง ๆ ว่าในคลังยังไม่มี แล้วให้คำแนะนำทั่วไปที่ปลอดภัย
2. ห้ามแต่งตัวเลขอัตราใช้สาร ปริมาณปุ๋ย หรือชื่อสารที่ไม่มีในคลัง ถ้าไม่มีข้อมูลให้ชี้ไปหน้าที่เกี่ยวข้องและแนะนำให้ถามเจ้าหน้าที่เกษตรในพื้นที่
3. เรื่องสารเคมี: เตือนให้อ่านฉลาก สวมอุปกรณ์ป้องกัน และบอกว่าหลายกรณีไม่จำเป็นต้องพ่นถ้ายังไม่ถึงเกณฑ์
4. ถ้าอาการไม่ชัด ให้ถามกลับ 1–2 ข้อ หรือแนะนำให้ถ่ายรูปมาสแกน (/detect)
5. ไม่ตอบเรื่องนอกเหนือการเกษตรข้าวโพด ให้บอกสุภาพว่าช่วยได้เฉพาะเรื่องข้าวโพด
6. ถ้ามีข้อมูลแปลงของผู้ใช้ (อายุ/ระยะ/จังหวัด) ให้ใช้ประกอบคำตอบ
7. หน้าอื่นของระบบที่แนะนำได้: ราคารับซื้อ/ต้นทุน/ปฏิทินงาน → /calendar · คำนวณกำไร → /profit · พยากรณ์อากาศและเตือนโรค → /weather · จดแปลงและนับอายุ → /farm · ซื้อของใช้ในไร่/ช่องทางขาย → /shop · ปุ๋ย → /fertilizer · ถ่ายรูปวินิจฉัย → /detect

ตอบเป็น JSON ตามรูปแบบที่กำหนด:
- answer: ข้อความตอบ (ภาษาไทย ย่อหน้าสั้น ๆ ใช้ "- " นำหน้าเมื่อเป็นรายการ ไม่ใช้ markdown อื่น)
- links: ถ้าในคลังมีรายการที่ตรงกับเรื่องที่ตอบ ให้ใส่ลิงก์ 1–3 ลิงก์เสมอ (ไม่มีจริง ๆ ค่อยเว้นว่าง) ต้องคัดลอก path มาจากคลังความรู้ (ส่วนหลังเครื่องหมาย →) หรือหน้าหลักเท่านั้น
- followUps: คำถามต่อเนื่องที่น่าถาม 0–3 ข้อ สั้น ๆ`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    answer: { type: 'STRING' },
    links: { type: 'ARRAY', items: { type: 'OBJECT', properties: { label: { type: 'STRING' }, href: { type: 'STRING' } }, required: ['label', 'href'] } },
    followUps: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['answer'],
};

export async function POST(request: Request) {
  try {
    let body: Body;
    try { body = (await request.json()) as Body; } catch {
      return NextResponse.json({ success: false, error: 'ส่งคำถามมาไม่ถูกรูปแบบ ลองใหม่อีกครั้งนะครับ' }, { status: 400 });
    }
    const msgs = (body.messages ?? []).filter((m) => (m.role === 'user' || m.role === 'ai') && typeof m.text === 'string' && m.text.trim()).slice(-MAX_MSGS);
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== 'user') {
      return NextResponse.json({ success: false, error: 'พิมพ์คำถามก่อนนะครับ' }, { status: 400 });
    }
    if (last.text.length > MAX_CHARS) {
      return NextResponse.json({ success: false, error: `คำถามยาวเกินไป (ไม่เกิน ${MAX_CHARS} ตัวอักษร)` }, { status: 400 });
    }

    const { text: knowledge, allowed, titles } = await buildKnowledge();
    const history = msgs.slice(0, -1).map((m) => `${m.role === 'user' ? 'ผู้ใช้' : 'น้องข้าวโพด'}: ${m.text.slice(0, MAX_CHARS)}`).join('\n');
    const p = body.plot;
    const plotInfo = p ? `แปลงของผู้ใช้: ${[p.name && `ชื่อ ${clip(p.name, 40)}`, typeof p.ageDays === 'number' && p.ageDays >= 0 && `อายุข้าวโพด ${Math.round(p.ageDays)} วัน`, p.stage && `ระยะ ${clip(p.stage, 40)}`, p.province && `จังหวัด ${clip(p.province, 30)}`].filter(Boolean).join(', ')}` : 'ไม่มีข้อมูลแปลงของผู้ใช้';

    const prompt = `คลังความรู้ของระบบ:\n${knowledge}\n\n${plotInfo}\n\n${history ? `บทสนทนาก่อนหน้า:\n${history}\n\n` : ''}คำถามล่าสุดของผู้ใช้: ${last.text}`;

    const result = await callGemini({ system: SYSTEM, parts: [{ text: prompt }], json: true, schema: SCHEMA, temperature: 0.3, maxOutputTokens: 1536, timeoutMs: 50_000 });
    const parsed = parseJsonLoose<{ answer?: string; links?: { label?: string; href?: string }[]; followUps?: string[] }>(result.text);

    const answerText = String(parsed.answer ?? '').trim().slice(0, 3000);
    const links: { label: string; href: string }[] = (parsed.links ?? [])
      .map((l) => ({ label: clip(l.label, 60), href: String(l.href ?? '').trim() }))
      .filter((l) => l.label && allowed.has(l.href))
      .slice(0, 3);
    // เติมลิงก์จากชื่อที่ถูกพูดถึงในคำตอบ (กรณี AI ลืมใส่/ใส่ path ผิด) — ใช้ชื่อในคลังเท่านั้น จึงเปิดได้จริงเสมอ
    for (const t of [...titles].sort((a, b) => b.title.length - a.title.length)) {
      if (links.length >= 3) break;
      if (answerText.includes(t.title) && !links.some((l) => l.href === t.href)) links.push({ label: t.title, href: t.href });
    }

    return NextResponse.json({
      success: true,
      model: result.model,
      answer: answerText || 'ขอโทษครับ ตอบไม่ได้ตอนนี้ ลองถามใหม่อีกครั้งนะครับ',
      links,
      followUps: (parsed.followUps ?? []).map((f) => clip(f, 80)).filter(Boolean).slice(0, 3),
    });
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    console.error('[/api/chat]', err instanceof Error ? err.message : err);
    const friendly =
      status === 503 ? 'ตอนนี้มีคนใช้เยอะ ลองถามใหม่อีกครั้งในอีกสักครู่นะครับ'
      : status === 429 ? 'ใช้งานถี่ไปหน่อย รอสักครู่แล้วลองใหม่นะครับ'
      : status === 401 || status === 403 ? 'ระบบ AI ยังตั้งค่าคีย์ไม่ถูกต้อง กรุณาแจ้งผู้ดูแล'
      : 'ตอบไม่สำเร็จ ลองถามใหม่อีกครั้งนะครับ';
    return NextResponse.json({ success: false, error: friendly }, { status: status >= 400 && status < 600 ? status : 500 });
  }
}
