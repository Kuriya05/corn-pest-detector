'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ScanLine, Camera, ImagePlus, X, Loader2, AlertTriangle, CheckCircle2,
  ArrowRight, RefreshCw, Copy, Printer, ClipboardPaste, PartyPopper, Volume2, Microscope, ClipboardCheck, Check, Search, BookOpen, FileText, Bug, Leaf, FlaskConical, Sparkles, Info, Target,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { Card, Callout, SeverityBadge } from '@/components/ui';
import type { Finding } from '@/lib/analysis';
import { speakResult, describeResult } from '@/lib/voice';

type DetectResponse = {
  success: boolean;
  error?: string;
  model?: string;
  isCorn?: boolean;
  imageQuality?: string;
  plantPart?: string;
  growthStageGuess?: string;
  findings?: Finding[];
  yolo?: { available: boolean; error?: string; count: number; extra: Finding[] };
  summary?: string;
  nextSteps?: string[];
  needBetterPhoto?: boolean;
  photoTip?: string;
  analyzedAt?: string;
  disclaimer?: string;
  cached?: boolean;
};

const qualityLabel: Record<string, string> = {
  good: 'ภาพชัดเจน',
  blurry: 'ภาพเบลอ',
  too_dark: 'ภาพมืดเกินไป',
  too_far: 'ถ่ายไกลเกินไป',
  not_plant: 'ไม่พบพืชในภาพ',
};

const typeMeta: Record<string, { label: string; icon: typeof Bug; cls: string }> = {
  pest: { label: 'แมลงศัตรูพืช', icon: Bug, cls: 'bg-rose-100 text-rose-800' },
  disease: { label: 'โรคพืช', icon: Leaf, cls: 'bg-orange-100 text-orange-900' },
  deficiency: { label: 'ขาดธาตุอาหาร', icon: FlaskConical, cls: 'bg-sky-100 text-sky-800' },
  damage: { label: 'ร่องรอยความเสียหาย', icon: Target, cls: 'bg-amber-100 text-amber-900' },
  healthy: { label: 'ต้นสมบูรณ์ดี', icon: CheckCircle2, cls: 'bg-leaf-200 text-leaf-900' },
  unknown: { label: 'ยังระบุไม่ได้', icon: Info, cls: 'bg-slate-100 text-slate-700' },
};


/** ย่อรูปก่อนส่ง: รูปจากมือถือมักใหญ่เกิน 4.5 MB (ลิมิต body ของ Vercel) และช้า — ย่อเหลือด้านยาว 1600px แทบไม่กระทบความแม่นยำ */
async function shrinkImage(file: File, maxSide = 1600, quality = 0.86): Promise<File> {
  try {
    if (file.size < 900 * 1024) return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** ส่งวิเคราะห์ พร้อมลองใหม่อัตโนมัติเมื่อระบบ AI คิวเต็ม/เน็ตหลุดชั่วคราว (สูงสุด 3 ครั้ง) */
async function requestAnalysis(file: File, fresh: boolean, extra: { part: string; hint: string }, onRetry: (n: number) => void): Promise<DetectResponse> {
  let last: DetectResponse = { success: false, error: 'วิเคราะห์ภาพไม่สำเร็จ กรุณาลองใหม่' };
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const fd = new FormData();
      fd.append('image', file);
      if (fresh) fd.append('fresh', '1');
      if (extra.part) fd.append('part', extra.part);
      if (extra.hint) fd.append('hint', extra.hint);
      const res = await fetch('/api/detect', { method: 'POST', body: fd });
      const data: DetectResponse = await res.json().catch(() => ({ success: false, error: 'ได้รับคำตอบที่อ่านไม่ได้จากเซิร์ฟเวอร์' }));
      if (res.ok && data.success) return data;
      last = { success: false, error: data.error || last.error };
      // ลองซ้ำเฉพาะความผิดพลาดชั่วคราว (คิวเต็ม/timeout/เซิร์ฟเวอร์) — ข้อผิดพลาดจากรูปหรือคีย์ไม่ต้องลองซ้ำ
      if (![429, 500, 502, 503, 504].includes(res.status)) return last;
    } catch {
      last = { success: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่' };
    }
    if (attempt < 3) {
      onRetry(attempt + 1);
      await sleep(1200 * attempt);
    }
  }
  return last;
}


const PARTS = [
  { v: 'ใบ' },
  { v: 'ลำต้น' },
  { v: 'ยอด' },
  { v: 'ฝัก' },
  { v: 'ไม่แน่ใจ' },
];
const SYMPTOMS = [
  { v: 'ใบเป็นรูพรุน' },
  { v: 'ใบเหลืองซีด' },
  { v: 'มีจุดแผลสีน้ำตาล' },
  { v: 'เห็นตัวหนอนหรือแมลง' },
  { v: 'มีผงหรือราสีขาว' },
  { v: 'ใบม้วนหรือแห้ง' },
];
const STAGE_ICONS = [Search, Target, BookOpen, FileText];
const STAGES = [
  { t: 'กำลังส่องดูภาพ…' },
  { t: 'ตรวจรอยแผลและรูเจาะ…' },
  { t: 'เทียบกับคลังโรคและแมลง…' },
  { t: 'เรียบเรียงคำแนะนำ…' },
];

/** ตัวนับขั้นตอนด้านบน: 1 เลือกรูป → 2 วิเคราะห์ → 3 ดูผล */
function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, t: 'เลือกรูป', I: Camera },
    { n: 2, t: 'AI วิเคราะห์', I: Microscope },
    { n: 3, t: 'รับคำแนะนำ', I: ClipboardCheck },
  ];
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2 mt-6 flex-wrap">
      {items.map((it, i) => {
        const done = step > it.n;
        const now = step === it.n;
        return (
          <li key={it.n} className="flex items-center gap-1.5 sm:gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition ${
              now ? 'bg-leaf-900 text-white' : done ? 'bg-leaf-100 text-leaf-800' : 'bg-white text-leaf-500 ring-1 ring-leaf-200'
            }`}>
              {done ? <Check size={15} strokeWidth={3} /> : <it.I size={15} />}{it.t}
            </span>
            {i < items.length - 1 && <span className={`w-5 sm:w-8 h-px ${step > it.n ? 'bg-leaf-500' : 'bg-leaf-300'}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/** วงแหวนแสดงความมั่นใจ */
function ConfidenceRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const tone = value >= 70 ? '#38a56c' : value >= 40 ? '#f2a12a' : '#94a3b8';
  return (
    <div className="relative w-[68px] h-[68px] shrink-0" role="img" aria-label={`ความมั่นใจ ${value} เปอร์เซ็นต์`}>
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5f3ea" strokeWidth="7" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={tone} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)' }} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[14px] font-extrabold text-leaf-900 tabular-nums">{value}%</span>
    </div>
  );
}

export default function DetectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBoxes, setShowBoxes] = useState(true);
  const [attempt, setAttempt] = useState(1);
  const [part, setPart] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  // ข้อความระหว่างรอเปลี่ยนไปเรื่อย ๆ ให้รู้สึกว่าระบบกำลังทำงาน
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setStage((n) => Math.min(n + 1, STAGES.length - 1)), 3200);
    return () => clearInterval(t);
  }, [loading]);

  const pick = useCallback((f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return; }
    if (f.size > 12 * 1024 * 1024) { setError('ไฟล์ใหญ่เกิน 12 MB กรุณาย่อรูปหรือถ่ายใหม่'); return; }
    setError(null);
    setResult(null);
    setFile(f);
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f); });
  }, []);

  // วางรูปจากคลิปบอร์ด (Ctrl+V) ได้เลย
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? []).find((x) => x.type.startsWith('image/'));
      if (f) pick(f);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [pick]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setActive(null);
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return null; });
  };

  async function analyze() {
    if (!file) return;
    const fresh = result !== null; // กด "วิเคราะห์ซ้ำ" = ขอผลใหม่ ไม่ใช้แคช
    setLoading(true);
    setError(null);
    setResult(null);
    setAttempt(1);
    setStage(0);
    setActive(null);
    try {
      const small = await shrinkImage(file);
      const data = await requestAnalysis(small, fresh, { part: part === 'ไม่แน่ใจ' ? '' : part, hint: symptoms.join(', ') }, setAttempt);
      if (!data.success) {
        setError(data.error || 'วิเคราะห์ภาพไม่สำเร็จ กรุณาลองใหม่');
        return;
      }
      setResult(data);
      saveHistory(data, file.name);
      speakResult(describeResult({ title: 'วิเคราะห์ภาพเสร็จแล้ว', findings: data.findings ?? [], summary: data.summary, nextSteps: data.nextSteps, needBetterPhoto: data.needBetterPhoto, photoTip: data.photoTip }));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } finally {
      setLoading(false);
    }
  }

  const allBoxes = [...(result?.findings ?? []), ...(result?.yolo?.extra ?? [])].filter((f) => f.box);

  return (
    <SiteShell>
      <header className="mb-8 animate-rise">
        <p className="mono-label text-[11px] uppercase text-leaf-600 mb-3">สแกนด้วย AI</p>
        <h1 className="text-[34px] sm:text-[46px] text-leaf-950 leading-[1.12] max-w-2xl">สแกนวินิจฉัยจากภาพถ่าย</h1>
        <p className="mt-3 text-[15.5px] text-leaf-700 max-w-2xl leading-relaxed">
          ถ่ายรูปส่วนที่ดูไม่ปกติมาได้เลย ใบ ลำต้น ยอด หรือฝัก เดี๋ยว AI ช่วยดูว่าเป็นโรค แมลง หรือขาดธาตุอาหาร แล้วบอกว่าควรทำอะไรต่อ
        </p>
        <Stepper step={result ? 3 : loading ? 2 : 1} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start">
        {/* ---------- ฝั่งซ้าย: อัปโหลดและพรีวิว ---------- */}
        <Card className="lg:sticky lg:top-24">
          {/* input อยู่นอกเงื่อนไข เพื่อให้ปุ่ม "เปลี่ยนรูป" ใช้งานได้หลังมีรูปแล้ว */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
            onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          <input ref={inputRef} type="file" accept="image/*" hidden
            onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
              className={`viewfinder rounded-4xl border-2 border-dashed px-5 py-12 text-center transition ${dragging ? 'border-corn-400 bg-corn-50 scale-[1.02]' : 'border-leaf-300 bg-leaf-50/60'}`}
            >
              <span className="vf-bl" /><span className="vf-br" />
              <span className="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-3xl bg-leaf-600 text-white ">
                <ImagePlus size={30} />
              </span>
              <p className="font-extrabold text-leaf-900 text-[18px]">{dragging ? 'ปล่อยตรงนี้ได้เลย' : 'ลากรูปมาวาง หรือเลือกรูปข้าวโพด'}</p>
              <p className="mt-1.5 text-[13.5px] text-leaf-600 max-w-sm mx-auto">
                ถ่ายใกล้ ๆ ตรงจุดที่เป็น ให้แสงพอ ไม่ย้อนแสง · รองรับ JPG / PNG ไม่เกิน 12 MB
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-600 px-5 py-3.5 font-bold text-white  hover:bg-leaf-700 transition focus-ring"
                >
                  <Camera size={19} /> ถ่ายรูปตอนนี้
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
                >
                  <ImagePlus size={19} /> เลือกจากเครื่อง
                </button>
              </div>
              <p className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] text-leaf-600"><ClipboardPaste size={14} /> ลากรูปมาวาง หรือกด Ctrl+V เพื่อวางรูปก็ได้</p>

            </div>
          ) : (
            <div>
              <div className="viewfinder relative overflow-hidden rounded-2xl bg-leaf-950"><span className="vf-bl" /><span className="vf-br" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="ภาพข้าวโพดที่อัปโหลด" className="w-full max-h-[62vh] object-contain" />

                {loading && (
                  <div className="absolute inset-0 bg-leaf-950/55 backdrop-blur-[2px] grid place-items-center">
                    <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-corn-300/40 to-transparent animate-sweep" />
                    <div className="relative text-center text-white px-6 w-full max-w-xs">
                      <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur">{(() => { const I = STAGE_ICONS[stage]; return <I size={26} />; })()}</span>
                      <p className="mt-3 font-extrabold text-[16px]">{attempt > 1 ? `ระบบคิวเต็ม กำลังลองใหม่ (${attempt}/3)…` : STAGES[stage].t}</p>
                      <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full rounded-full bg-leaf-400 transition-all duration-1000" style={{ width: `${((stage + 1) / STAGES.length) * 92}%` }} />
                      </div>
                      <p className="text-[12.5px] text-leaf-100 mt-2">ใช้เวลาประมาณ 5–20 วินาที</p>
                    </div>
                  </div>
                )}

                {showBoxes && !loading && allBoxes.map((f, i) => {
                  const idx = (result?.findings ?? []).indexOf(f);
                  const on = active === null || active === idx;
                  return (
                    <div
                      key={i}
                      className={`absolute rounded-xl ring-2 transition ${on ? 'ring-corn-300 bg-corn-300/15' : 'ring-white/40 opacity-40'} ${active === idx ? 'ring-4 animate-pulse' : ''}`}
                      style={{ top: `${f.box!.top}%`, left: `${f.box!.left}%`, width: `${f.box!.width}%`, height: `${f.box!.height}%` }}
                    >
                      <span className="absolute -top-1 left-0 -translate-y-full whitespace-nowrap rounded-full bg-corn-400 px-2 py-0.5 text-[10.5px] font-extrabold text-leaf-900 shadow">
                        {f.nameTh} {f.confidence}%
                      </span>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={reset}
                  className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-2xl bg-black/50 text-white backdrop-blur hover:bg-black/70 transition focus-ring"
                  aria-label="ลบรูป"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={analyze}
                  disabled={loading}
                  className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-600 px-5 py-3.5 font-bold text-white  hover:bg-leaf-700 disabled:opacity-60 transition focus-ring"
                >
                  {loading ? <Loader2 size={19} className="animate-spin" /> : <Sparkles size={19} />}
                  {loading ? 'กำลังวิเคราะห์…' : result ? 'วิเคราะห์ซ้ำ' : 'เริ่มวิเคราะห์'}
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3.5 font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
                >
                  <RefreshCw size={17} /> เปลี่ยนรูป
                </button>
                {allBoxes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBoxes((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3.5 font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
                  >
                    <Target size={17} /> {showBoxes ? 'ซ่อนกรอบ' : 'แสดงกรอบ'}
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4">
              <Callout tone="danger" title="วิเคราะห์ไม่สำเร็จ">{error}</Callout>
            </div>
          )}

          {/* ---------- บอก AI เพิ่มอีกนิด (ไม่บังคับ) ---------- */}
          <div className="mt-5 rounded-3xl bg-leaf-50/70 p-4 sm:p-5">
            <p className="font-extrabold text-[14.5px] text-leaf-900">ถ่ายส่วนไหนของต้น? <span className="font-normal text-leaf-600 text-[12.5px]">(ไม่บังคับ)</span></p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {PARTS.map((p) => (
                <button key={p.v} type="button" aria-pressed={part === p.v} onClick={() => setPart(part === p.v ? '' : p.v)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-semibold focus-ring ${part === p.v ? 'bg-leaf-900 text-white' : 'bg-white text-leaf-800 ring-1 ring-leaf-200'}`}>
                  {p.v}
                </button>
              ))}
            </div>
            <p className="mt-4 font-extrabold text-[14.5px] text-leaf-900">เห็นอะไรผิดปกติบ้าง? <span className="font-normal text-leaf-600 text-[12.5px]">(เลือกได้หลายอย่าง)</span></p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {SYMPTOMS.map((p) => {
                const on = symptoms.includes(p.v);
                return (
                  <button key={p.v} type="button" aria-pressed={on} onClick={() => setSymptoms(on ? symptoms.filter((x) => x !== p.v) : [...symptoms, p.v])}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-semibold focus-ring ${on ? 'bg-leaf-900 text-white' : 'bg-white text-leaf-800 ring-1 ring-leaf-200'}`}>
                    {p.v}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-corn-50 ring-1 ring-corn-200 p-4">
            <p className="font-extrabold text-[14px] text-corn-900 mb-2">ถ่ายยังไงให้ AI ดูแม่นขึ้น</p>
            <ul className="space-y-1.5 text-[13.5px] text-corn-900/90">
              {[
                'เข้าใกล้จุดที่เป็น ให้เห็นรอยแผล รูเจาะ หรือตัวแมลงเต็มกรอบ',
                'ถ่ายกลางแจ้งตอนเช้าหรือเย็น เลี่ยงแดดจัดจนเกิดเงาทับ และเลี่ยงย้อนแสง',
                'ถ่ายทั้งด้านบนใบและใต้ใบ เพราะบางโรคเห็นอาการชัดเฉพาะใต้ใบ',
                'ถ้าสงสัยราน้ำค้าง ให้ถ่ายตอนเช้าตรู่ที่ยังมีน้ำค้าง จะเห็นผงสีขาวชัด',
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 size={15} className="mt-[3px] shrink-0 text-corn-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* ---------- ฝั่งขวา: ผลวิเคราะห์ ---------- */}
        <div ref={resultRef} className="space-y-5" aria-live="polite" aria-busy={loading}>
          {!result && !loading && (
            <Card className="text-center py-12">
              <span className="mx-auto mb-3 grid place-items-center w-14 h-14 rounded-3xl bg-leaf-50 text-leaf-400">
                <ScanLine size={26} />
              </span>
              <p className="font-extrabold text-leaf-900">ผลจะขึ้นตรงนี้</p>
              <p className="mt-1.5 text-[13.5px] text-leaf-600 max-w-sm mx-auto">
                ยังไม่แน่ใจว่าเป็นอะไร และไม่มีรูปถ่าย? ลองใช้{' '}
                <Link href="/diseases#advisor" className="font-bold text-leaf-700 underline">
                  การวินิจฉัยจากอาการ
                </Link>{' '}
                แทนได้
              </p>
            </Card>
          )}

          {result && (
            <>
              {result.isCorn === false && (
                <Callout tone="warn" title="ภาพนี้อาจไม่ใช่ข้าวโพด">
                  ระบบนี้ออกแบบมาสำหรับข้าวโพดโดยเฉพาะ ผลวิเคราะห์ด้านล่างอาจไม่ถูกต้อง
                </Callout>
              )}
              {result.needBetterPhoto && (
                <Callout tone="warn" title={`คุณภาพภาพ: ${qualityLabel[result.imageQuality ?? ''] ?? result.imageQuality}`}>
                  {result.photoTip || 'ควรถ่ายรูปใหม่ให้ชัดขึ้นเพื่อให้ผลแม่นยำกว่านี้'}
                </Callout>
              )}

              {result.findings?.[0]?.type === 'healthy' && (
                <div className="rounded-4xl bg-gradient-to-r from-leaf-200 to-corn-100 border border-soil-200 p-5 flex items-center gap-4 animate-rise">
                  <div>
                    <p className="font-extrabold text-[17px] text-leaf-900 flex items-center gap-1.5"><PartyPopper size={18} /> ต้นข้าวโพดดูสมบูรณ์ดีเลย!</p>
                    <p className="text-[13.5px] text-leaf-800">ในภาพนี้ยังไม่เจอความผิดปกติชัด ๆ ลองเดินสำรวจซ้ำทุก 5–7 วันก็พอ</p>
                  </div>
                </div>
              )}

              {result.summary && (
                <Card>
                  <div className="flex items-start gap-3">
                    <span className="grid place-items-center w-10 h-10 rounded-2xl bg-leaf-100 text-leaf-700 shrink-0">
                      <Sparkles size={19} />
                    </span>
                    <div className="min-w-0">
                      <p className="mono-label text-[11px] uppercase text-leaf-600 mb-1">สรุปผล</p>
                      <p className="text-[15px] leading-relaxed text-leaf-900">{result.summary}</p>
                      <ResultActions result={result} />
                      <p className="mt-2.5 text-[12px] text-leaf-500">
                        ส่วนที่วิเคราะห์: {result.plantPart}
                        {result.growthStageGuess ? ` · คาดว่าเป็นระยะ ${result.growthStageGuess}` : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {(result.findings ?? []).map((f, i) => (
                <FindingCard key={i} finding={f} rank={i} active={active === i} onSelect={() => f.box && setActive(active === i ? null : i)} />
              ))}

              {(result.yolo?.extra ?? []).length > 0 && (
                <Card>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-leaf-600 mb-2">
                    โมเดล YOLO ที่เทรนเองตรวจพบเพิ่มเติม
                  </p>
                  <ul className="space-y-2">
                    {result.yolo!.extra.map((f, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-leaf-50 px-4 py-2.5">
                        <span className="font-bold text-[14px] text-leaf-900">{f.nameTh}</span>
                        <span className="text-[13px] font-bold text-leaf-600">{f.confidence}%</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {(result.nextSteps ?? []).length > 0 && (
                <Card className="bg-leaf-900! text-white border-0!">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-corn-300 mb-3">
                    แล้วต้องทำอะไรต่อ (ภายใน 1–7 วัน)
                  </p>
                  <ol className="space-y-2.5">
                    {result.nextSteps!.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="grid place-items-center w-6 h-6 rounded-lg bg-white/15 text-[12px] font-extrabold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-[14.5px] leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              <div className="rounded-3xl bg-soil-50 ring-1 ring-soil-200 p-4 flex gap-3">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-soil-600" />
                <div className="text-[13px] text-soil-800 leading-relaxed">
                  <p>{result.disclaimer}</p>
                  <p className="mt-1.5 text-[11.5px] text-soil-600">
                    วิเคราะห์โดยโมเดล {result.model}{result.cached ? ' · ผลเดิมของภาพนี้ (กด "วิเคราะห์ซ้ำ" เพื่อประมวลผลใหม่)' : ''}
                    {result.yolo?.available === false && result.yolo.error ? ` · โมเดล YOLO ไม่พร้อมใช้งาน (${result.yolo.error})` : ''}
                    {result.yolo?.available ? ` · YOLO ตรวจพบ ${result.yolo.count} จุด` : ''}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SiteShell>
  );
}


/** คัดลอกสรุปผลไปแปะในไลน์ หรือพิมพ์เก็บไว้ */
function ResultActions({ result }: { result: DetectResponse }) {
  const [copied, setCopied] = useState(false);
  const text = () => {
    const lines = [
      'ผลวิเคราะห์ข้าวโพดด้วย AI',
      ...(result.findings ?? []).map((f, i) => `${i + 1}. ${f.nameTh} (${f.confidence}%)`),
      result.summary ? `สรุป: ${result.summary}` : '',
      ...(result.nextSteps ?? []).map((t) => `- ${t}`),
      'ผลจาก AI เป็นข้อมูลประกอบ ควรปรึกษาเจ้าหน้าที่เกษตรก่อนใช้สารเคมี',
    ];
    return lines.filter(Boolean).join('\n');
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* เบราว์เซอร์ไม่อนุญาต */ }
  };
  return (
    <div className="mt-3 flex flex-wrap gap-2 no-print">
      <button type="button" onClick={() => speakResult(describeResult({ title: 'ผลการวิเคราะห์', findings: result.findings ?? [], summary: result.summary, nextSteps: result.nextSteps, needBetterPhoto: result.needBetterPhoto, photoTip: result.photoTip }), true)} className="chip-soft inline-flex items-center gap-1.5 rounded-full bg-corn-200 px-3.5 py-1.5 text-[13px] font-medium text-leaf-950 focus-ring">
        <Volume2 size={14} /> ฟังผล
      </button>
      <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3.5 py-1.5 text-[13px] font-bold text-leaf-800 focus-ring">
        {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copied ? 'คัดลอกแล้ว' : 'คัดลอกสรุป'}
      </button>
      <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3.5 py-1.5 text-[13px] font-bold text-leaf-800 focus-ring">
        <Printer size={14} /> พิมพ์ผล
      </button>
    </div>
  );
}

function FindingCard({ finding, rank, active, onSelect }: { finding: Finding; rank: number; active?: boolean; onSelect?: () => void }) {
  const meta = typeMeta[finding.type] ?? typeMeta.unknown;
  const IconC = meta.icon;

  return (
    <div onClick={onSelect} className={`rounded-4xl transition ${finding.box ? 'cursor-pointer' : ''} ${active ? 'ring-4 ring-corn-300' : ''}`}>
    <Card className="animate-rise">
      <div className="flex items-start gap-3.5">
        <span className={`grid place-items-center w-11 h-11 rounded-2xl shrink-0 ${meta.cls}`}>
          <IconC size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-extrabold ${meta.cls}`}>{meta.label}</span>
            {finding.type !== 'healthy' && <SeverityBadge level={finding.severity} />}
            {finding.source === 'both' && (
              <span className="rounded-full bg-corn-200 px-2.5 py-0.5 text-[11.5px] font-extrabold text-corn-900">AI 2 ระบบยืนยันตรงกัน</span>
            )}
            {rank === 0 && (
              <span className="rounded-full bg-leaf-900 px-2.5 py-0.5 text-[11.5px] font-extrabold text-white">
                น่าจะเป็นมากที่สุด
              </span>
            )}
          </div>

          <h2 className="text-[18px] font-extrabold text-leaf-900">{finding.nameTh}</h2>
          {finding.nameEn && finding.nameEn !== finding.nameTh && (
            <p className="text-[12.5px] text-leaf-500 italic">{finding.nameEn}</p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <ConfidenceRing value={finding.confidence} />
            <p className="text-[12.5px] text-leaf-600">ความมั่นใจของ AI{finding.box ? ' · แตะการ์ดเพื่อดูตำแหน่งบนรูป' : ''}</p>
          </div>
          {finding.confidence < 50 && (
            <p className="mt-1.5 text-[12px] text-corn-700 font-semibold">
              AI ยังไม่ค่อยมั่นใจ — ลองถ่ายเพิ่มอีกสักรูป หรือให้เจ้าหน้าที่ช่วยดูอีกที
            </p>
          )}

          {finding.evidence && (
            <p className="mt-3 rounded-2xl bg-leaf-50 px-4 py-3 text-[14px] leading-relaxed text-leaf-800">
              <span className="font-bold">สิ่งที่เห็นในภาพ: </span>
              {finding.evidence}
            </p>
          )}

          {(finding.quickActions ?? []).length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {finding.quickActions!.map((a, i) => (
                <li key={i} className="flex gap-2 text-[13.5px] text-leaf-800">
                  <CheckCircle2 size={15} className="mt-[3px] shrink-0 text-leaf-500" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}

          {finding.link && (
            <Link
              href={finding.link.href}
              className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-leaf-900 px-4 py-2.5 text-[14px] font-bold text-white hover:bg-leaf-800 transition focus-ring"
            >
              {finding.link.label}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </Card>
    </div>
  );
}

/** บันทึกผลลงเครื่องผู้ใช้ เพื่อดูย้อนหลังในหน้าประวัติ */
function saveHistory(data: DetectResponse, fileName: string) {
  try {
    const top = data.findings?.[0];
    const entry = {
      id: `${Date.now()}`,
      at: data.analyzedAt ?? new Date().toISOString(),
      fileName,
      topName: top?.nameTh ?? 'ไม่พบความผิดปกติชัดเจน',
      topType: top?.type ?? 'unknown',
      confidence: top?.confidence ?? 0,
      severity: top?.severity ?? 'low',
      summary: data.summary ?? '',
      findings: (data.findings ?? []).map((f) => ({ nameTh: f.nameTh, type: f.type, confidence: f.confidence })),
      nextSteps: data.nextSteps ?? [],
    };
    const raw = localStorage.getItem('maize_scan_history');
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    localStorage.setItem('maize_scan_history', JSON.stringify([entry, ...list].slice(0, 100)));
  } catch {
    /* ถ้าเบราว์เซอร์ปิด localStorage ไว้ ก็ข้ามการบันทึกไป */
  }
}
