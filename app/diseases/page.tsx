'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Leaf, Search, ChevronDown, AlertTriangle, Shield, FlaskConical, Eye, Thermometer, Microscope,
  Sprout, Stethoscope, Loader2, ArrowRight, HelpCircle, ClipboardCheck, ScanLine,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { ImageGallery, toImages } from '@/components/image-gallery';
import {
  PageHeader, Card, Chip, Callout, SeverityBadge, BulletList, SourceList, ChemicalTable, EmptyState,
} from '@/components/ui';
import { diseases as seedDiseases } from '@/lib/data/diseases';
import { useCollection } from '@/lib/use-collection';
import type { Disease } from '@/lib/data/types';
import type { Finding } from '@/lib/analysis';

const kinds = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'เชื้อรา', label: 'เชื้อรา' },
  { id: 'แบคทีเรีย', label: 'แบคทีเรีย' },
  { id: 'ไวรัส', label: 'ไวรัส' },
] as const;

/** อาการที่ให้เกษตรกรเลือก จัดกลุ่มตามส่วนของต้น */
const symptomGroups: { part: string; items: string[] }[] = [
  {
    part: 'ใบ',
    items: [
      'ใบมีลายทางสีขาวหรือเหลืองจากโคนใบถึงปลายใบ',
      'ตอนเช้ามีผงสีขาวบนใบและใต้ใบ',
      'แผลยาวรูปกระสวย สีเทาหรือน้ำตาล เริ่มจากใบล่าง',
      'แผลสี่เหลี่ยมเล็ก ๆ ขนานไปตามเส้นใบ',
      'ตุ่มนูนสีน้ำตาลแดง ลูบแล้วมีผงสีสนิมติดมือ',
      'จุดเล็กมีวงแหวนสีเหลืองล้อมรอบ',
      'ลายคราบขวางใบเป็นชั้น ๆ คล้ายคราบงู',
      'ใบด่างเหลืองสลับเขียว ต้นแคระแกร็น',
      'ใบล่างเหลืองเป็นรูปตัว V จากปลายใบ',
      'ขอบใบเหลืองซีดแล้วแห้งไหม้',
      'ใบเป็นรูพรุน เว้าแหว่ง หรือยอดกุด',
    ],
  },
  {
    part: 'ลำต้น / ยอด',
    items: [
      'ลำต้นมีรูเจาะ หักล้มง่าย',
      'โคนต้นช้ำสีน้ำตาลแดง มีเมือกไหลและกลิ่นเหม็น',
      'ผ่าลำต้นดูภายในเป็นสีชมพูหรือม่วง',
      'ยอดแห้งตายทั้งที่ใบล่างยังเขียว',
      'ต้นเตี้ย ข้อถี่ ยอดแตกเป็นพุ่ม',
      'ถอนต้นขึ้นง่าย รากเปลี่ยนสีและมีเส้นใยขาว',
    ],
  },
  {
    part: 'ฝัก / ไหม',
    items: [
      'ไหมถูกกัดกินหรือแห้ง ผสมเกสรไม่ติด',
      'ติดเมล็ดไม่เต็ม ฟันหลอ',
      'ปลายฝักมีรูเจาะหรือมีหนอนอยู่ข้างใน',
      'มีเชื้อราสีเขียวอมฟ้าหรือขาวระหว่างเมล็ด',
      'เมล็ดมีสีดำเป็นมันวาว',
      'มีปมสีขาวแล้วเปลี่ยนเป็นสีดำบนฝัก',
    ],
  },
];

const plantParts = ['ใบ', 'ลำต้น', 'ยอด', 'ฝัก', 'ราก', 'ทั้งต้น'];

export default function DiseasesPage() {
  const { items: diseases } = useCollection<Disease>('diseases', seedDiseases);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<(typeof kinds)[number]['id']>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    if (hash && hash !== 'advisor') {
      setOpenId(hash);
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } else if (hash === 'advisor') {
      setTimeout(() => document.getElementById('advisor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return diseases.filter((d) => {
      if (kind !== 'all' && d.kind !== kind) return false;
      if (!q) return true;
      return [d.nameTh, d.nameEn, d.pathogen, d.summary, ...d.symptoms].join(' ').toLowerCase().includes(q);
    });
  }, [diseases, query, kind]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Disease Library"
        title={`คลังโรคข้าวโพด (${diseases.length} โรค)`}
        description="โรคข้าวโพดที่พบในประเทศไทย พร้อมวิธีแยกโรคที่อาการคล้ายกัน สภาพแวดล้อมที่ทำให้เกิดโรค และคำแนะนำการป้องกันกำจัดจากกรมวิชาการเกษตร"
        icon={<Leaf size={26} strokeWidth={2.3} />}
      />

      <SymptomAdvisor />

      <div className="mt-10 mb-5 space-y-3">
        <h2 className="text-[20px] font-extrabold text-leaf-900">ค้นหาโรคในคลังข้อมูล ({diseases.length} โรค)</h2>
        <label className="relative block">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อโรค หรือพิมพ์อาการ เช่น แผลยาว ผงสีขาว ตุ่มสนิม"
            className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-12 pr-4 py-3.5 text-[15px] placeholder:text-leaf-400 focus-ring"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {kinds.map((k) => (
            <Chip
              key={k.id}
              active={kind === k.id}
              onClick={() => setKind(k.id)}
              count={k.id === 'all' ? diseases.length : diseases.filter((d) => d.kind === k.id).length}
            >
              {k.label}
            </Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Search size={24} />} title="ไม่พบโรคที่ตรงกับคำค้น" hint="ลองพิมพ์ลักษณะแผลที่เห็น เช่น แผลยาว จุดกลม ตุ่มนูน ใบด่าง" />
      ) : (
        <div className="space-y-3.5">
          {list.map((d) => {
            const open = openId === d.id;
            return (
              <article key={d.id} id={d.id} className="scroll-mt-24">
                <Card className={open ? 'ring-2 ring-leaf-300' : ''}>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : d.id)}
                    aria-expanded={open}
                    className="w-full text-left focus-ring rounded-2xl"
                  >
                    <div className="flex items-start gap-3.5">
                      {toImages(d)[0] ? (
                        <img src={toImages(d)[0]!} alt={d.nameTh ?? d.id} className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-1 ring-leaf-200" />
                      ) : (
                        <span className="grid place-items-center w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 shrink-0"><Microscope size={21} /></span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <SeverityBadge level={d.severity} />
                          <span className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-[11.5px] font-bold text-leaf-700">{d.kind}</span>
                        </div>
                        <h3 className="text-[18px] font-extrabold text-leaf-900">{d.nameTh}</h3>
                        <p className="text-[12.5px] text-leaf-500">
                          {d.nameEn} · <i>{d.pathogen}</i>
                        </p>
                        <p className="mt-2 text-[14px] text-leaf-700">{d.summary}</p>
                      </div>
                      <ChevronDown size={20} className={`shrink-0 text-leaf-500 transition ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {open && (
                    <div className="mt-5 space-y-5 border-t border-leaf-100 pt-5 animate-rise">
                      <ImageGallery images={toImages(d)} alt={d.nameTh ?? d.id ?? ''} showPlaceholder />
                      <Section icon={<Eye size={17} />} title="อาการที่มองเห็น">
                        <BulletList items={d.symptoms} />
                      </Section>

                      {d.distinguish && (
                        <Callout tone="info" title="วิธีแยกจากโรคที่อาการคล้ายกัน">{d.distinguish}</Callout>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoBox icon={<Thermometer size={16} />} title="สภาพแวดล้อมที่ทำให้เกิดโรค" text={d.conditions} />
                        <InfoBox icon={<Sprout size={16} />} title="ระยะที่พบ" text={d.stage} />
                      </div>

                      {d.lossImpact && (
                        <Callout tone="warn" title="ความเสียหายต่อผลผลิต">{d.lossImpact}</Callout>
                      )}

                      {d.resistantVarieties?.length ? (
                        <Section icon={<Shield size={17} />} title="พันธุ์ต้านทานที่แนะนำ">
                          <div className="flex flex-wrap gap-2">
                            {d.resistantVarieties.map((v) => (
                              <span key={v} className="rounded-full bg-leaf-100 px-3 py-1 text-[13px] font-bold text-leaf-800">
                                {v}
                              </span>
                            ))}
                          </div>
                        </Section>
                      ) : null}

                      <Section icon={<Shield size={17} />} title="วิธีเขตกรรมและการป้องกัน">
                        <BulletList items={d.cultural} marker="check" />
                      </Section>

                      <Section icon={<FlaskConical size={17} />} title="สารป้องกันกำจัดที่แนะนำ">
                        <ChemicalTable rows={d.chemicals} />
                      </Section>

                      {d.warnings?.length ? (
                        <Callout tone="danger" title="ข้อควรระวัง">
                          <BulletList items={d.warnings} marker="warn" />
                        </Callout>
                      ) : null}

                      <SourceList sources={d.sources} />
                    </div>
                  )}
                </Card>
              </article>
            );
          })}
        </div>
      )}
    </SiteShell>
  );
}

/* ---------------- วินิจฉัยจากอาการ (ไม่ต้องใช้รูป) ---------------- */

type AdvisorResponse = {
  success: boolean;
  error?: string;
  findings?: Finding[];
  summary?: string;
  nextSteps?: string[];
  checkInField?: string[];
  askBack?: string[];
  disclaimer?: string;
};

function SymptomAdvisor() {
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [age, setAge] = useState('');
  const [part, setPart] = useState('');
  const [province, setProvince] = useState('');
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<AdvisorResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  async function submit() {
    setLoading(true);
    setErr(null);
    setRes(null);
    try {
      const r = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selected,
          note: note.trim(),
          plantAgeDays: age ? Number(age) : undefined,
          plantPart: part || undefined,
          province: province.trim() || undefined,
        }),
      });
      const data: AdvisorResponse = await r.json();
      if (!r.ok || !data.success) setErr(data.error || 'วินิจฉัยไม่สำเร็จ กรุณาลองใหม่');
      else setRes(data);
    } catch {
      setErr('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="advisor" className="scroll-mt-24">
      <Card className="ring-2 ring-corn-200">
        <div className="flex items-start gap-3.5 mb-5">
          <span className="grid place-items-center w-11 h-11 rounded-2xl bg-corn-400 text-leaf-900 shrink-0">
            <Stethoscope size={21} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[19px] font-extrabold text-leaf-900">วินิจฉัยจากอาการ (ไม่ต้องใช้รูป)</h2>
            <p className="mt-1 text-[14px] text-leaf-700">
              ถ่ายรูปไม่ได้หรือรูปไม่ชัด? เลือกอาการที่พบในแปลง ระบบจะช่วยประเมินว่าน่าจะเป็นโรคหรือแมลงอะไร
              และบอกว่าต้องออกไปดูอะไรเพิ่มเพื่อยืนยัน
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {symptomGroups.map((g) => (
            <div key={g.part}>
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-2">อาการที่ {g.part}</p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((s) => {
                  const on = selected.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(s)}
                      aria-pressed={on}
                      className={`rounded-2xl px-3.5 py-2 text-[13.5px] font-semibold text-left transition focus-ring ${
                        on ? 'bg-leaf-700 text-white shadow-sm' : 'bg-white text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="block text-[12.5px] font-bold text-leaf-700 mb-1.5">อายุข้าวโพด (วันหลังปลูก)</span>
              <input
                type="number" min={0} max={200} inputMode="numeric"
                value={age} onChange={(e) => setAge(e.target.value)} placeholder="เช่น 25"
                className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] focus-ring"
              />
            </label>
            <label className="block">
              <span className="block text-[12.5px] font-bold text-leaf-700 mb-1.5">ส่วนที่พบปัญหา</span>
              <select
                value={part} onChange={(e) => setPart(e.target.value)}
                className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] focus-ring"
              >
                <option value="">เลือก…</option>
                {plantParts.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-[12.5px] font-bold text-leaf-700 mb-1.5">จังหวัด / พื้นที่</span>
              <input
                type="text" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="เช่น เพชรบูรณ์"
                className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] focus-ring"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-[12.5px] font-bold text-leaf-700 mb-1.5">อธิบายเพิ่มเติม (ถ้ามี)</span>
            <textarea
              value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              placeholder="เช่น ฝนตกหนักติดกัน 3 วัน แล้วใบล่างเริ่มเป็นแผลยาว ลามขึ้นข้างบนเรื่อย ๆ"
              className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] placeholder:text-leaf-400 focus-ring resize-y"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={loading || (!selected.length && !note.trim())}
              className="inline-flex items-center gap-2 rounded-2xl bg-leaf-700 px-5 py-3.5 font-bold text-white shadow-sm hover:bg-leaf-800 disabled:opacity-50 transition focus-ring"
            >
              {loading ? <Loader2 size={19} className="animate-spin" /> : <Stethoscope size={19} />}
              {loading ? 'กำลังวินิจฉัย…' : 'วินิจฉัยจากอาการที่เลือก'}
            </button>
            {selected.length > 0 && (
              <button type="button" onClick={() => setSelected([])} className="text-[14px] font-bold text-leaf-600 hover:text-leaf-900 focus-ring rounded">
                ล้างที่เลือก ({selected.length})
              </button>
            )}
            <Link href="/detect" className="ml-auto inline-flex items-center gap-1.5 text-[14px] font-bold text-leaf-700 hover:text-leaf-900 focus-ring rounded">
              <ScanLine size={16} /> ถ่ายรูปสแกนแทน
            </Link>
          </div>

          {err && <Callout tone="danger" title="วินิจฉัยไม่สำเร็จ">{err}</Callout>}

          {res && (
            <div className="space-y-4 border-t border-leaf-100 pt-5 animate-rise">
              {res.summary && (
                <p className="rounded-3xl bg-leaf-50 px-4 py-3.5 text-[15px] leading-relaxed text-leaf-900">{res.summary}</p>
              )}

              {(res.findings ?? []).map((f, i) => (
                <div key={i} className="rounded-3xl ring-1 ring-leaf-100 bg-white/80 p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="rounded-full bg-leaf-100 px-2.5 py-0.5 text-[11.5px] font-extrabold text-leaf-800">
                      {i === 0 ? 'น่าจะเป็นมากที่สุด' : `ความเป็นไปได้ที่ ${i + 1}`}
                    </span>
                    <SeverityBadge level={f.severity} />
                    <span className="ml-auto text-[13px] font-extrabold text-leaf-700 tabular-nums">{f.confidence}%</span>
                  </div>
                  <p className="text-[16px] font-extrabold text-leaf-900">{f.nameTh}</p>
                  {f.evidence && <p className="mt-1.5 text-[14px] text-leaf-700 leading-relaxed">{f.evidence}</p>}
                  {f.link && (
                    <Link href={f.link.href} className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-leaf-700 hover:text-leaf-900 focus-ring rounded">
                      {f.link.label} <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              ))}

              {(res.checkInField ?? []).length > 0 && (
                <div className="rounded-3xl bg-corn-50 ring-1 ring-corn-200 p-4">
                  <p className="flex items-center gap-2 font-extrabold text-[14.5px] text-corn-900 mb-2">
                    <ClipboardCheck size={17} /> ออกไปดูในแปลงเพิ่มเพื่อยืนยัน
                  </p>
                  <BulletList items={res.checkInField!} marker="warn" />
                </div>
              )}

              {(res.nextSteps ?? []).length > 0 && (
                <div className="rounded-3xl bg-leaf-700 text-white p-4">
                  <p className="font-extrabold text-[14.5px] text-corn-300 mb-2">สิ่งที่ควรทำต่อ</p>
                  <ol className="space-y-2">
                    {res.nextSteps!.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-[14px]">
                        <span className="grid place-items-center w-5.5 h-5.5 rounded-md bg-white/15 text-[11.5px] font-extrabold shrink-0">{i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {(res.askBack ?? []).length > 0 && (
                <Callout tone="info" title="ข้อมูลที่ยังขาด — ช่วยดูเพิ่มแล้วลองวินิจฉัยใหม่">
                  <BulletList items={res.askBack!} />
                </Callout>
              )}

              <p className="flex gap-2 text-[12.5px] text-soil-700">
                <HelpCircle size={15} className="shrink-0 mt-0.5" />
                {res.disclaimer}
              </p>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="flex items-center gap-2 font-extrabold text-[15px] text-leaf-900 mb-2.5">
        <span className="text-leaf-600">{icon}</span>
        {title}
      </h4>
      <div className="text-leaf-800">{children}</div>
    </div>
  );
}

function InfoBox({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-leaf-50 p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-1.5">
        {icon} {title}
      </p>
      <p className="text-[14px] leading-relaxed text-leaf-900">{text}</p>
    </div>
  );
}

export { AlertTriangle };
