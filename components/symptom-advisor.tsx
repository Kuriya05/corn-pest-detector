'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Leaf, Sprout, Wheat, Shovel, CircleHelp, ArrowLeft, ArrowRight, Check, RotateCcw, Loader2,
  ClipboardCheck, ScanLine, ChevronDown, Stethoscope, Volume2, type LucideIcon,
} from 'lucide-react';
import { SeverityBadge, BulletList, Callout } from '@/components/ui';
import type { Finding } from '@/lib/analysis';
import { speakResult, describeResult } from '@/lib/voice';

/* ---------- ข้อมูลอาการ จัดกลุ่มตามส่วนของต้น ---------- */
type Part = { id: string; label: string; hint: string; Icon: LucideIcon; apiPart: string; symptoms: string[] };

const PARTS: Part[] = [
  {
    id: 'leaf', label: 'ใบ', hint: 'จุด แผล ลาย สีผิดปกติ รูพรุน', Icon: Leaf, apiPart: 'ใบ',
    symptoms: [
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
    id: 'stem', label: 'ลำต้น / ยอด', hint: 'หัก ล้ม เน่า ยอดแห้ง ต้นแคระ', Icon: Sprout, apiPart: 'ลำต้น',
    symptoms: [
      'ลำต้นมีรูเจาะ หักล้มง่าย',
      'โคนต้นช้ำสีน้ำตาลแดง มีเมือกไหลและกลิ่นเหม็น',
      'ผ่าลำต้นดูภายในเป็นสีชมพูหรือม่วง',
      'ยอดแห้งตายทั้งที่ใบล่างยังเขียว',
      'ต้นเตี้ย ข้อถี่ ยอดแตกเป็นพุ่ม',
    ],
  },
  {
    id: 'ear', label: 'ฝัก / ไหม', hint: 'ติดเมล็ดไม่เต็ม รา หนอนในฝัก', Icon: Wheat, apiPart: 'ฝัก',
    symptoms: [
      'ไหมถูกกัดกินหรือแห้ง ผสมเกสรไม่ติด',
      'ติดเมล็ดไม่เต็ม ฟันหลอ',
      'ปลายฝักมีรูเจาะหรือมีหนอนอยู่ข้างใน',
      'มีเชื้อราสีเขียวอมฟ้าหรือขาวระหว่างเมล็ด',
      'เมล็ดมีสีดำเป็นมันวาว',
      'มีปมสีขาวแล้วเปลี่ยนเป็นสีดำบนฝัก',
    ],
  },
  {
    id: 'root', label: 'ราก / โคนต้น', hint: 'ถอนง่าย รากเน่า ต้นเหี่ยว', Icon: Shovel, apiPart: 'ราก',
    symptoms: [
      'ถอนต้นขึ้นง่าย รากเปลี่ยนสีและมีเส้นใยขาว',
      'ต้นเหี่ยวทั้งต้นทั้งที่ดินมีน้ำ',
      'โคนต้นนิ่มยุบ มีสีน้ำตาลถึงดำ',
    ],
  },
];

const STEP_LABELS = ['ปัญหาอยู่ตรงไหน', 'เห็นอะไรบ้าง', 'ผลที่ได้'];

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

export function SymptomAdvisor() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [partId, setPartId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [note, setNote] = useState('');
  const [age, setAge] = useState('');
  const [province, setProvince] = useState('');
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<AdvisorResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const part = PARTS.find((p) => p.id === partId) ?? null;
  const symptomList = part ? part.symptoms : PARTS.flatMap((p) => p.symptoms);

  const toggle = (s: string) => setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const choosePart = (id: string | null) => {
    setPartId(id);
    setSelected((prev) => (id ? prev.filter((s) => PARTS.find((p) => p.id === id)!.symptoms.includes(s)) : prev));
    setStep(2);
  };

  async function submit() {
    setStep(3);
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
          plantPart: part?.apiPart,
          province: province.trim() || undefined,
        }),
      });
      const data: AdvisorResponse = await r.json().catch(() => ({ success: false, error: 'ได้รับคำตอบที่อ่านไม่ได้จากเซิร์ฟเวอร์' }));
      if (!r.ok || !data.success) setErr(data.error || 'ยังช่วยดูไม่สำเร็จ กรุณาลองใหม่');
      else {
        setRes(data);
        speakResult(describeResult({ title: 'ประเมินจากอาการเสร็จแล้ว', findings: data.findings ?? [], summary: data.summary, nextSteps: data.nextSteps }));
      }
    } catch {
      setErr('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  const restart = () => {
    setStep(1); setPartId(null); setSelected([]); setNote(''); setAge(''); setProvince(''); setShowMore(false); setRes(null); setErr(null);
  };

  return (
    <section id="advisor" className="scroll-mt-24">
      {/* หัวข้อ + ตัวบอกขั้นตอน */}
      <div className="rounded-3xl border border-soil-200 bg-white p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-leaf-50 text-leaf-700 shrink-0"><Stethoscope size={21} /></span>
          <div className="min-w-0">
            <h2 className="text-[22px] text-leaf-950">ประเมินจากอาการ</h2>
            <p className="mt-1 text-[14.5px] text-soil-600">ไม่มีรูปก็ไม่เป็นไร เล่าอาการที่เห็นให้ฟังสั้น ๆ แล้วจะช่วยเดาว่าน่าจะเป็นอะไร และบอกว่าควรไปดูอะไรเพิ่มในแปลง</p>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="ขั้นตอน">
          {STEP_LABELS.map((l, i) => {
            const n = i + 1;
            const done = step > n;
            const now = step === n;
            return (
              <li key={l} className="min-w-0">
                <div className={`h-1.5 rounded-full ${done || now ? 'bg-leaf-600' : 'bg-soil-200'}`} />
                <p className={`mt-2 flex items-center gap-1.5 text-[12.5px] sm:text-[13.5px] truncate ${now ? 'font-semibold text-leaf-900' : 'text-soil-500'}`}>
                  <span className={`grid place-items-center w-5 h-5 rounded-full text-[11px] shrink-0 ${done ? 'bg-leaf-600 text-white' : now ? 'bg-leaf-900 text-white' : 'bg-soil-200 text-soil-600'}`}>
                    {done ? <Check size={12} strokeWidth={3} /> : n}
                  </span>
                  <span className="truncate">{l}</span>
                </p>
              </li>
            );
          })}
        </ol>

        {/* ---------- ขั้นที่ 1: เลือกส่วนของต้น ---------- */}
        {step === 1 && (
          <div className="mt-7 animate-rise">
            <p className="font-semibold text-[17px] text-leaf-900">เห็นปัญหาตรงส่วนไหนของต้น?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PARTS.map((p) => (
                <button key={p.id} type="button" onClick={() => choosePart(p.id)}
                  className="group flex items-center gap-4 rounded-2xl border border-soil-200 bg-white p-4 text-left hover:border-leaf-400 hover:bg-leaf-50/50 transition focus-ring">
                  <span className="grid place-items-center w-12 h-12 rounded-xl bg-leaf-50 text-leaf-700 group-hover:bg-leaf-100 transition shrink-0"><p.Icon size={23} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[16.5px] text-leaf-900">{p.label}</span>
                    <span className="block text-[13px] text-soil-500">{p.hint}</span>
                  </span>
                  <ArrowRight size={18} className="text-soil-400 group-hover:text-leaf-700 transition shrink-0" />
                </button>
              ))}
              <button type="button" onClick={() => choosePart(null)}
                className="group flex items-center gap-4 rounded-2xl border border-dashed border-soil-300 p-4 text-left hover:border-leaf-400 transition focus-ring sm:col-span-2">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-soil-100 text-soil-600 shrink-0"><CircleHelp size={22} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[16.5px] text-leaf-900">ไม่แน่ใจ / หลายส่วน</span>
                  <span className="block text-[13px] text-soil-500">ดูรายการอาการทั้งหมดรวมกัน</span>
                </span>
                <ArrowRight size={18} className="text-soil-400 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* ---------- ขั้นที่ 2: เลือกอาการ ---------- */}
        {step === 2 && (
          <div className="mt-7 animate-rise">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-[17px] text-leaf-900">
                เห็นอะไรผิดปกติบ้าง? <span className="font-normal text-soil-500 text-[14px]">· {part ? part.label : 'ทุกส่วน'} (เลือกได้หลายข้อ)</span>
              </p>
            </div>

            <ul className="mt-4 space-y-2">
              {symptomList.map((s) => {
                const on = selected.includes(s);
                return (
                  <li key={s}>
                    <button type="button" onClick={() => toggle(s)} aria-pressed={on}
                      className={`w-full flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition focus-ring ${on ? 'border-leaf-600 bg-leaf-50' : 'border-soil-200 bg-white hover:border-soil-300'}`}>
                      <span className={`grid place-items-center w-6 h-6 rounded-md border-2 shrink-0 transition ${on ? 'bg-leaf-600 border-leaf-600 text-white' : 'border-soil-300'}`}>
                        {on && <Check size={15} strokeWidth={3} />}
                      </span>
                      <span className={`text-[15px] leading-snug ${on ? 'text-leaf-900 font-medium' : 'text-soil-700'}`}>{s}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* รายละเอียดเพิ่มเติม — พับไว้ ไม่บังคับ */}
            <button type="button" onClick={() => setShowMore((v) => !v)} aria-expanded={showMore}
              className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-leaf-700 hover:underline focus-ring rounded">
              เล่าเพิ่มอีกนิดให้แม่นขึ้น (ไม่บังคับ) <ChevronDown size={15} className={`transition ${showMore ? 'rotate-180' : ''}`} />
            </button>
            {showMore && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 animate-rise">
                <label className="block">
                  <span className="block text-[13px] text-soil-600 mb-1.5">อายุข้าวโพด (วันหลังปลูก)</span>
                  <input type="number" min={0} max={200} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="เช่น 25"
                    className="w-full rounded-xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[15px] focus-ring" />
                </label>
                <label className="block">
                  <span className="block text-[13px] text-soil-600 mb-1.5">จังหวัด / พื้นที่</span>
                  <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="เช่น เพชรบูรณ์"
                    className="w-full rounded-xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[15px] focus-ring" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="block text-[13px] text-soil-600 mb-1.5">เล่าเพิ่มเติม</span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                    placeholder="เช่น ฝนตกหนัก 3 วัน แล้วใบล่างเริ่มเป็นแผลยาว ลามขึ้นข้างบนเรื่อย ๆ"
                    className="w-full rounded-xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[15px] placeholder:text-soil-400 focus-ring resize-y" />
                </label>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3 sticky bottom-20 lg:bottom-4 bg-white/95 backdrop-blur py-3 -mx-1 px-1 rounded-2xl">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 rounded-xl border border-soil-300 px-4 py-3 font-medium text-soil-700 hover:bg-soil-100 transition focus-ring">
                <ArrowLeft size={16} /> ย้อนกลับ
              </button>
              <button type="button" onClick={submit} disabled={!selected.length && !note.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-6 py-3 font-medium text-white hover:bg-leaf-700 disabled:bg-soil-300 disabled:cursor-not-allowed transition focus-ring">
                ดูผลเลย {selected.length > 0 && <span className="rounded-full bg-white/20 px-2 text-[12.5px]">{selected.length}</span>} <ArrowRight size={17} />
              </button>
              {selected.length > 0 && (
                <button type="button" onClick={() => setSelected([])} className="text-[14px] text-soil-500 hover:text-leaf-900 focus-ring rounded">ล้างที่เลือก</button>
              )}
            </div>
          </div>
        )}

        {/* ---------- ขั้นที่ 3: ผล ---------- */}
        {step === 3 && (
          <div className="mt-7 animate-rise" aria-live="polite">
            {loading && (
              <div className="rounded-2xl bg-soil-50 border border-soil-200 py-14 text-center">
                <Loader2 size={30} className="mx-auto animate-spin text-leaf-600" />
                <p className="mt-3 font-semibold text-leaf-900">กำลังช่วยดูอาการ…</p>
                <p className="text-[13px] text-soil-500">ใช้เวลาประมาณ 5–15 วินาที</p>
              </div>
            )}

            {err && (
              <div className="space-y-4">
                <Callout tone="danger" title="ยังช่วยดูไม่สำเร็จ">{err}</Callout>
                <div className="flex gap-3">
                  <button type="button" onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-5 py-3 font-medium text-white hover:bg-leaf-700 focus-ring"><RotateCcw size={16} /> ลองอีกครั้ง</button>
                  <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-soil-300 px-5 py-3 font-medium text-soil-700 hover:bg-soil-100 focus-ring">แก้ไขอาการ</button>
                </div>
              </div>
            )}

            {res && (
              <div className="space-y-4">
                {selected.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.map((s) => <span key={s} className="rounded-full bg-soil-100 px-3 py-1 text-[12.5px] text-soil-700">{s}</span>)}
                  </div>
                )}
                {res.summary && <p className="rounded-2xl bg-leaf-50 border border-leaf-100 px-5 py-4 text-[15.5px] leading-relaxed text-leaf-900">{res.summary}</p>}

                {(res.findings ?? []).map((f, i) => (
                  <div key={i} className="rounded-2xl border border-soil-200 bg-white p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${i === 0 ? 'bg-leaf-900 text-white' : 'bg-soil-100 text-soil-700'}`}>
                        {i === 0 ? 'น่าจะเป็นมากที่สุด' : `ความเป็นไปได้ที่ ${i + 1}`}
                      </span>
                      <SeverityBadge level={f.severity} />
                      <span className="ml-auto text-[13px] font-semibold text-leaf-700 tabular-nums">{f.confidence}%</span>
                    </div>
                    <p className="text-[18px] font-semibold text-leaf-900">{f.nameTh}</p>
                    {f.evidence && <p className="mt-1.5 text-[14.5px] text-soil-600 leading-relaxed">{f.evidence}</p>}
                    {f.link && (
                      <Link href={f.link.href} className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-leaf-700 hover:underline focus-ring rounded">
                        {f.link.label} <ArrowRight size={15} />
                      </Link>
                    )}
                  </div>
                ))}

                {(res.findings ?? []).length === 0 && (
                  <Callout tone="info" title="ข้อมูลยังน้อยไปนิด">ลองติ๊กอาการเพิ่ม หรือเล่ารายละเอียดเพิ่ม แล้วดูผลอีกครั้งนะครับ</Callout>
                )}

                {(res.checkInField ?? []).length > 0 && (
                  <div className="rounded-2xl bg-corn-50 border border-corn-200 p-5">
                    <p className="flex items-center gap-2 font-semibold text-[15px] text-corn-900 mb-2"><ClipboardCheck size={17} /> ลองไปดูในแปลงเพิ่มอีกนิด</p>
                    <BulletList items={res.checkInField!} marker="warn" />
                  </div>
                )}

                {(res.nextSteps ?? []).length > 0 && (
                  <div className="rounded-2xl bg-leaf-900 text-white p-5">
                    <p className="font-semibold text-[15px] text-leaf-200 mb-3">แล้วต้องทำอะไรต่อ</p>
                    <ol className="space-y-2.5">
                      {res.nextSteps!.map((s, i) => (
                        <li key={i} className="flex gap-3 text-[14.5px]">
                          <span className="grid place-items-center w-6 h-6 rounded-md bg-white/15 text-[12px] font-semibold shrink-0">{i + 1}</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {(res.askBack ?? []).length > 0 && (
                  <Callout tone="info" title="ถ้าช่วยดูเพิ่มได้ จะแม่นขึ้น"><BulletList items={res.askBack!} /></Callout>
                )}

                <p className="text-[12.5px] text-soil-500">{res.disclaimer}</p>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 rounded-xl border border-soil-300 px-4 py-3 font-medium text-soil-700 hover:bg-soil-100 transition focus-ring"><ArrowLeft size={16} /> แก้ไขอาการ</button>
                  <button type="button" onClick={() => speakResult(describeResult({ title: 'ผลประเมินจากอาการ', findings: res.findings ?? [], summary: res.summary, nextSteps: res.nextSteps }), true)} className="inline-flex items-center gap-1.5 rounded-xl bg-corn-200 px-4 py-3 font-medium text-leaf-950 hover:bg-corn-300 transition focus-ring"><Volume2 size={16} /> ฟังผล</button>
                  <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 rounded-xl border border-soil-300 px-4 py-3 font-medium text-soil-700 hover:bg-soil-100 transition focus-ring"><RotateCcw size={16} /> เริ่มใหม่</button>
                  <Link href="/detect" className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-leaf-600 px-5 py-3 font-medium text-white hover:bg-leaf-700 transition focus-ring"><ScanLine size={16} /> ถ่ายรูปมายืนยัน</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
