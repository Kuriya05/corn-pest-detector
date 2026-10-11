'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, NotebookPen, Sprout, CalendarDays, Wallet, Download, Upload, MapPin, Ruler, ScanLine, X,
  AlertTriangle, CheckCircle2, Pencil,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import {
  useFarm, ageDays, stageForAge, STAGES, LOG_KINDS, todayStr, type LogKind, type Plot, type FarmData,
} from '@/lib/farm';

const fmtDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
const money = (n: number) => n.toLocaleString('th-TH', { maximumFractionDigits: 0 });

const KIND_STYLE: Record<LogKind, string> = {
  scan: 'bg-sky-100 text-sky-700', disease: 'bg-amber-100 text-amber-700', pest: 'bg-orange-100 text-orange-700',
  fertilizer: 'bg-blue-100 text-blue-700', spray: 'bg-rose-100 text-rose-700', weed: 'bg-lime-100 text-lime-700',
  water: 'bg-cyan-100 text-cyan-700', harvest: 'bg-corn-200 text-corn-800', cost: 'bg-violet-100 text-violet-700', note: 'bg-soil-100 text-soil-700',
};

export default function FarmPage() {
  const farm = useFarm();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [editing, setEditing] = useState<Plot | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const plot = farm.plots.find((p) => p.id === selectedId) ?? farm.plots[0] ?? null;

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ plots: farm.plots, logs: farm.logs }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `สมุดไร่-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('บันทึกไฟล์สำรองแล้ว');
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as FarmData;
      if (!Array.isArray(data.plots) || !Array.isArray(data.logs)) throw new Error('bad');
      if (!window.confirm(`นำเข้า ${data.plots.length} แปลง และ ${data.logs.length} รายการ? ข้อมูลปัจจุบันในเครื่องนี้จะถูกแทนที่`)) return;
      farm.replaceAll(data);
      setMsg('นำเข้าข้อมูลแล้ว');
    } catch { setMsg('ไฟล์นี้ไม่ใช่ไฟล์สำรองของสมุดไร่'); }
  };

  return (
    <SiteShell>
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-leaf-200 via-leaf-100 to-corn-100 px-6 py-9 sm:px-12 sm:py-12 animate-rise">
        <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-white/40" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13.5px] font-medium text-leaf-800"><NotebookPen size={15} className="text-leaf-600" /> สมุดไร่</p>
            <h1 className="mt-4 text-[34px] sm:text-[46px] leading-[1.12] text-leaf-950">จดแปลง ติดตามอายุ<br />รู้ว่าตอนนี้ต้องทำอะไร</h1>
            <p className="mt-3 text-[16px] text-soil-700 max-w-xl leading-relaxed">ใส่วันปลูกครั้งเดียว ระบบนับอายุข้าวโพดและบอกงานของช่วงนี้ให้ พร้อมจดโรค แมลง ปุ๋ย และค่าใช้จ่ายไว้ดูย้อนหลัง</p>
          </div>
          <button type="button" onClick={() => { setEditing(null); setShowPlotForm(true); }} className="inline-flex items-center justify-center gap-2 rounded-full bg-leaf-700 px-6 py-3.5 font-medium text-white hover:bg-leaf-800 transition focus-ring">
            <Plus size={18} /> เพิ่มแปลง
          </button>
        </div>
      </header>

      <p className="mt-4 flex items-start gap-2 text-[13px] text-soil-600">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-corn-600" />
        ข้อมูลเก็บไว้ในเครื่อง/เบราว์เซอร์นี้เท่านั้น ไม่ขึ้นเซิร์ฟเวอร์ — ถ้าล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนเครื่องข้อมูลจะหาย แนะนำกด “สำรองข้อมูล” เก็บไว้เป็นระยะ
      </p>

      {!farm.ready ? (
        <div className="mt-8 h-48 rounded-3xl bg-white/60 animate-pulse" />
      ) : farm.plots.length === 0 ? (
        <EmptyStart onAdd={() => setShowPlotForm(true)} onImport={() => fileRef.current?.click()} />
      ) : (
        <>
          {/* เลือกแปลง */}
          <div className="mt-8 flex gap-3 overflow-x-auto no-scrollbar pb-2" role="tablist" aria-label="เลือกแปลง">
            {farm.plots.map((p) => {
              const age = ageDays(p.plantedOn);
              const on = plot?.id === p.id;
              return (
                <button key={p.id} type="button" role="tab" aria-selected={on} onClick={() => setSelectedId(p.id)}
                  className={`shrink-0 text-left rounded-3xl px-5 py-3.5 transition focus-ring ${on ? 'bg-leaf-800 text-white shadow-lg' : 'bg-white border border-[#f1e7d3] text-leaf-900 hover:-translate-y-0.5'}`}>
                  <span className="block font-medium text-[16px]">{p.name}</span>
                  <span className={`block text-[13px] ${on ? 'text-leaf-200' : 'text-soil-500'}`}>{p.areaRai} ไร่ · {age >= 0 ? `อายุ ${age} วัน` : `ปลูกในอีก ${-age} วัน`}</span>
                </button>
              );
            })}
          </div>

          {plot && (
            <PlotView
              plot={plot}
              onEdit={() => { setEditing(plot); setShowPlotForm(true); }}
              onDelete={() => { if (window.confirm(`ลบแปลง “${plot.name}” และบันทึกทั้งหมดของแปลงนี้?`)) { farm.removePlot(plot.id); setSelectedId(null); } }}
            />
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button type="button" onClick={exportData} className="inline-flex items-center gap-2 rounded-full bg-white border border-[#f1e7d3] px-5 py-2.5 text-[14px] font-medium text-leaf-900 hover:bg-soil-50 focus-ring"><Download size={16} /> สำรองข้อมูล</button>
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-white border border-[#f1e7d3] px-5 py-2.5 text-[14px] font-medium text-leaf-900 hover:bg-soil-50 focus-ring"><Upload size={16} /> นำเข้าข้อมูล</button>
            {msg && <span role="status" className="text-[13.5px] text-leaf-700">{msg}</span>}
          </div>
        </>
      )}

      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = ''; }} />

      {showPlotForm && (
        <PlotForm
          initial={editing}
          onClose={() => setShowPlotForm(false)}
          onSave={(v) => {
            if (editing) farm.updatePlot(editing.id, v);
            else { const p = farm.addPlot(v); setSelectedId(p.id); }
            setShowPlotForm(false);
          }}
        />
      )}
    </SiteShell>
  );
}

function EmptyStart({ onAdd, onImport }: { onAdd: () => void; onImport: () => void }) {
  return (
    <div className="mt-8 rounded-[2rem] bg-white border border-dashed border-soil-300 px-6 py-14 text-center">
      <span className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-leaf-100 text-leaf-700"><Sprout size={30} /></span>
      <h2 className="mt-4 text-[24px] text-leaf-950">ยังไม่มีแปลงในสมุด</h2>
      <p className="mt-1.5 text-[15px] text-soil-600 max-w-md mx-auto">เริ่มจากเพิ่มแปลงแรก ใส่ชื่อ ขนาด และวันปลูก ระบบจะนับอายุและบอกงานที่ควรทำให้เอง</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-full bg-leaf-700 px-6 py-3.5 font-medium text-white hover:bg-leaf-800 focus-ring"><Plus size={18} /> เพิ่มแปลงแรก</button>
        <button type="button" onClick={onImport} className="inline-flex items-center gap-2 rounded-full bg-soil-100 px-6 py-3.5 font-medium text-leaf-900 hover:bg-soil-200 focus-ring"><Upload size={17} /> นำเข้าจากไฟล์สำรอง</button>
      </div>
    </div>
  );
}

function PlotView({ plot, onEdit, onDelete }: { plot: Plot; onEdit: () => void; onDelete: () => void }) {
  const farm = useFarm();
  const age = ageDays(plot.plantedOn);
  const stage = stageForAge(age);
  const next = stage ? STAGES[STAGES.indexOf(stage) + 1] : STAGES[0];
  const logs = useMemo(() => farm.logs.filter((l) => l.plotId === plot.id).sort((a, b) => b.date.localeCompare(a.date)), [farm.logs, plot.id]);
  const totalCost = logs.reduce((s, l) => s + (l.cost ?? 0), 0);
  const totalIncome = logs.reduce((s, l) => s + (l.income ?? 0), 0);
  const progress = Math.max(0, Math.min(100, (age / 110) * 100));

  return (
    <section className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
      <div className="space-y-6">
        {/* สถานะตอนนี้ */}
        <div className="rounded-[2rem] bg-white border border-[#f1e7d3] shadow-[0_14px_32px_-22px_rgb(122_82_12_/_0.35)] p-6 sm:p-7">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-[26px] text-leaf-950">{plot.name}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-soil-600">
                <span className="inline-flex items-center gap-1.5"><Ruler size={14} /> {plot.areaRai} ไร่</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> ปลูก {fmtDate(plot.plantedOn)}</span>
                {plot.province && <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {plot.province}</span>}
                {plot.variety && <span>พันธุ์ {plot.variety}</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onEdit} aria-label="แก้ไขแปลง" className="grid place-items-center w-10 h-10 rounded-full bg-soil-100 text-leaf-900 hover:bg-soil-200 focus-ring"><Pencil size={16} /></button>
              <button type="button" onClick={onDelete} aria-label="ลบแปลง" className="grid place-items-center w-10 h-10 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 focus-ring"><Trash2 size={16} /></button>
            </div>
          </div>

          {age < 0 ? (
            <p className="mt-5 rounded-2xl bg-corn-50 border border-corn-200 px-4 py-3 text-[15px] text-corn-900">ยังไม่ถึงวันปลูก — อีก {-age} วัน ช่วงนี้เตรียมดิน ไถดะ ไถแปร และวางแผนปุ๋ยไว้ได้เลย</p>
          ) : (
            <>
              <div className="mt-6 flex items-end gap-4">
                <div>
                  <p className="text-[13px] text-soil-500">อายุข้าวโพด</p>
                  <p className="font-display text-[44px] leading-none text-leaf-900 tabular-nums">{age}<span className="text-[18px] text-soil-500 ml-1">วัน</span></p>
                </div>
                {stage && (
                  <div className="pb-1">
                    <p className="text-[13px] text-soil-500">ตอนนี้อยู่ช่วง</p>
                    <p className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[15px] font-medium ${stage.critical ? 'bg-corn-200 text-corn-900' : 'bg-leaf-100 text-leaf-800'}`}>
                      {stage.critical && <AlertTriangle size={14} />} {stage.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5" aria-label="ความคืบหน้าของรุ่น">
                <div className="relative h-3 rounded-full bg-soil-100 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-leaf-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[12px] text-soil-500"><span>ปลูก</span><span>ออกไหม ~50 วัน</span><span>เก็บเกี่ยว ~110 วัน</span></div>
              </div>

              {stage && (
                <div className="mt-6">
                  <h3 className="text-[17px] text-leaf-950">งานของช่วงนี้</h3>
                  <ul className="mt-2.5 space-y-2">
                    {stage.tasks.map((t) => (
                      <li key={t} className="flex gap-3 rounded-2xl bg-leaf-50 px-4 py-3 text-[15px] text-leaf-900 leading-snug"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-leaf-600" /> {t}</li>
                    ))}
                  </ul>
                  {next && <p className="mt-3 text-[13.5px] text-soil-600">ช่วงถัดไป: <span className="font-medium text-leaf-900">{next.name}</span> เริ่มวันที่ {next.from} (อีก {Math.max(next.from - age, 0)} วัน)</p>}
                </div>
              )}
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/detect" className="inline-flex items-center gap-2 rounded-full bg-corn-400 px-5 py-2.5 text-[14.5px] font-medium text-leaf-950 hover:bg-corn-300 focus-ring"><ScanLine size={16} /> สแกนใบวันนี้</Link>
            <Link href="/weather" className="inline-flex items-center gap-2 rounded-full bg-soil-100 px-5 py-2.5 text-[14.5px] font-medium text-leaf-900 hover:bg-soil-200 focus-ring">ดูอากาศ 7 วัน</Link>
            <Link href="/calendar" className="inline-flex items-center gap-2 rounded-full bg-soil-100 px-5 py-2.5 text-[14.5px] font-medium text-leaf-900 hover:bg-soil-200 focus-ring">ปฏิทินดูแลไร่</Link>
          </div>
        </div>

        {/* รายการที่จดไว้ */}
        <div className="rounded-[2rem] bg-white border border-[#f1e7d3] p-6 sm:p-7">
          <h3 className="text-[20px] text-leaf-950">ที่จดไว้ ({logs.length})</h3>
          {logs.length === 0 ? (
            <p className="mt-3 text-[14.5px] text-soil-500">ยังไม่มีรายการ — จดจากแบบฟอร์มด้านขวาได้เลย</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {logs.map((l) => (
                <li key={l.id} className="flex gap-3 rounded-2xl border border-soil-100 p-3.5">
                  <span className={`shrink-0 self-start rounded-full px-3 py-1 text-[12.5px] font-medium ${KIND_STYLE[l.kind]}`}>{LOG_KINDS[l.kind].label}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[15.5px] text-leaf-950">{l.title}</p>
                    {l.note && <p className="text-[14px] text-soil-600 leading-snug whitespace-pre-wrap">{l.note}</p>}
                    <p className="mt-1 text-[12.5px] text-soil-500">
                      {fmtDate(l.date)} · อายุ {Math.max(ageDays(plot.plantedOn, l.date), 0)} วัน
                      {l.cost ? ` · จ่าย ${money(l.cost)} บาท` : ''}{l.income ? ` · รับ ${money(l.income)} บาท` : ''}
                    </p>
                  </div>
                  <button type="button" onClick={() => farm.removeLog(l.id)} aria-label="ลบรายการนี้" className="grid place-items-center w-9 h-9 rounded-full text-soil-400 hover:bg-rose-50 hover:text-rose-600 focus-ring shrink-0"><X size={16} /></button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="space-y-6 lg:sticky lg:top-24">
        <LogForm plotId={plot.id} />
        <div className="rounded-[2rem] bg-leaf-800 text-white p-6">
          <h3 className="flex items-center gap-2 text-[18px]"><Wallet size={18} className="text-corn-300" /> สรุปเงินของแปลงนี้</h3>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div><dt className="text-[12.5px] text-leaf-200">จ่ายไปแล้ว</dt><dd className="text-[22px] font-display tabular-nums">{money(totalCost)}</dd></div>
            <div><dt className="text-[12.5px] text-leaf-200">รับมาแล้ว</dt><dd className="text-[22px] font-display tabular-nums text-corn-300">{money(totalIncome)}</dd></div>
            <div><dt className="text-[12.5px] text-leaf-200">ต่อไร่ (จ่าย)</dt><dd className="text-[18px] tabular-nums">{plot.areaRai ? money(totalCost / plot.areaRai) : '—'}</dd></div>
            <div><dt className="text-[12.5px] text-leaf-200">คงเหลือสุทธิ</dt><dd className={`text-[18px] tabular-nums ${totalIncome - totalCost < 0 ? 'text-rose-200' : ''}`}>{money(totalIncome - totalCost)}</dd></div>
          </dl>
          <Link href="/profit" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-[13.5px] hover:bg-white/20 focus-ring">คำนวณต้นทุน–กำไรแบบละเอียด</Link>
        </div>
      </div>
    </section>
  );
}

function LogForm({ plotId }: { plotId: string }) {
  const farm = useFarm();
  const [kind, setKind] = useState<LogKind>('note');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayStr());
  const [amount, setAmount] = useState('');

  const isIncome = kind === 'harvest';
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim() || LOG_KINDS[kind].label;
    const n = Number(amount);
    farm.addLog({
      plotId, date, kind, title: t, note: note.trim() || undefined,
      ...(amount && n > 0 ? (isIncome ? { income: n } : { cost: n }) : {}),
    });
    setTitle(''); setNote(''); setAmount('');
  };

  return (
    <form onSubmit={submit} className="rounded-[2rem] bg-white border border-[#f1e7d3] shadow-[0_14px_32px_-22px_rgb(122_82_12_/_0.35)] p-6">
      <h3 className="text-[20px] text-leaf-950">จดอะไรสักอย่าง</h3>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="ประเภทรายการ">
        {(Object.keys(LOG_KINDS) as LogKind[]).filter((k) => k !== 'scan').map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}
            className={`rounded-full px-3.5 py-2 text-[13.5px] font-medium transition focus-ring ${kind === k ? 'bg-leaf-800 text-white' : 'bg-soil-100 text-soil-700 hover:bg-soil-200'}`}>{LOG_KINDS[k].label}</button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="block text-[13px] text-soil-600 mb-1">เรื่องอะไร <span className="text-soil-400">({LOG_KINDS[kind].hint})</span></span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={LOG_KINDS[kind].label} className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[15px] focus-ring" />
        </label>
        <label className="block">
          <span className="block text-[13px] text-soil-600 mb-1">รายละเอียด (ไม่บังคับ)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[15px] focus-ring resize-y" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-[13px] text-soil-600 mb-1">วันที่</span>
            <input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-3 py-3 text-[15px] focus-ring" />
          </label>
          <label className="block">
            <span className="block text-[13px] text-soil-600 mb-1">{isIncome ? 'ขายได้ (บาท)' : 'ค่าใช้จ่าย (บาท)'}</span>
            <input type="number" min={0} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[15px] focus-ring" />
          </label>
        </div>
      </div>
      <button type="submit" className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-corn-400 px-5 py-3.5 font-medium text-leaf-950 hover:bg-corn-300 shadow-[0_8px_18px_-8px_rgb(245_174_11_/_0.8)] focus-ring"><Plus size={18} /> บันทึก</button>
    </form>
  );
}

function PlotForm({ initial, onClose, onSave }: { initial: Plot | null; onClose: () => void; onSave: (v: Omit<Plot, 'id' | 'createdAt'>) => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [area, setArea] = useState(initial ? String(initial.areaRai) : '');
  const [planted, setPlanted] = useState(initial?.plantedOn ?? todayStr());
  const [variety, setVariety] = useState(initial?.variety ?? '');
  const [province, setProvince] = useState(initial?.province ?? '');
  const [err, setErr] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(area);
    if (!name.trim()) return setErr('ใส่ชื่อแปลงด้วยนะครับ เช่น แปลงหลังบ้าน');
    if (!(a > 0)) return setErr('ใส่ขนาดแปลงเป็นไร่ (มากกว่า 0)');
    if (!planted) return setErr('เลือกวันปลูก (ถ้ายังไม่ปลูก ใส่วันที่คาดว่าจะปลูกได้)');
    onSave({ name: name.trim(), areaRai: a, plantedOn: planted, variety: variety.trim() || undefined, province: province.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center no-print" role="dialog" aria-modal="true" aria-label={initial ? 'แก้ไขแปลง' : 'เพิ่มแปลง'}>
      <button type="button" aria-label="ปิด" className="absolute inset-0 bg-leaf-950/40" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-[#fffaf0] p-6 sm:p-8 animate-rise">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] text-leaf-950">{initial ? 'แก้ไขแปลง' : 'เพิ่มแปลงใหม่'}</h2>
          <button type="button" onClick={onClose} aria-label="ปิด" className="grid place-items-center w-10 h-10 rounded-full bg-soil-100 hover:bg-soil-200 focus-ring"><X size={18} /></button>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block"><span className="block text-[14px] text-soil-700 mb-1">ชื่อแปลง *</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น แปลงหลังบ้าน" className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[16px] focus-ring" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="block text-[14px] text-soil-700 mb-1">ขนาด (ไร่) *</span>
              <input type="number" min={0} step="0.25" inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} placeholder="เช่น 5" className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[16px] focus-ring" /></label>
            <label className="block"><span className="block text-[14px] text-soil-700 mb-1">วันปลูก *</span>
              <input type="date" value={planted} onChange={(e) => setPlanted(e.target.value)} className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-3 py-3 text-[16px] focus-ring" /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="block text-[14px] text-soil-700 mb-1">พันธุ์ (ถ้ามี)</span>
              <input value={variety} onChange={(e) => setVariety(e.target.value)} className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[16px] focus-ring" /></label>
            <label className="block"><span className="block text-[14px] text-soil-700 mb-1">จังหวัด (ถ้ามี)</span>
              <input value={province} onChange={(e) => setProvince(e.target.value)} className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[16px] focus-ring" /></label>
          </div>
        </div>
        {err && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-[14px] text-rose-700">{err}</p>}
        <div className="mt-6 flex gap-3">
          <button type="submit" className="flex-1 rounded-full bg-leaf-700 px-6 py-3.5 font-medium text-white hover:bg-leaf-800 focus-ring">บันทึกแปลง</button>
          <button type="button" onClick={onClose} className="rounded-full bg-soil-100 px-6 py-3.5 font-medium text-leaf-900 hover:bg-soil-200 focus-ring">ยกเลิก</button>
        </div>
      </form>
    </div>
  );
}
