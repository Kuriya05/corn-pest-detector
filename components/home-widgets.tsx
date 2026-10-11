'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Lightbulb, ListChecks, History, Check, RotateCcw, ScanLine, Camera } from 'lucide-react';

const TIPS = [
  'เดินสำรวจแปลงตอนเช้า แสงนุ่มและแมลงยังไม่หนี จะเห็นรอยกัดกินและไข่หนอนได้ชัดกว่าตอนแดดจัด',
  'หนอนกระทู้ลายจุดมักซ่อนในยอดอ่อน ลองแหวกกาบใบยอดดูมูลสีเข้มที่ค้างอยู่ เป็นสัญญาณที่แน่นอนกว่ารูที่ใบ',
  'ถ่ายรูปให้ AI ทั้งด้านบนและใต้ใบ โรคราน้ำค้างและราสนิมเห็นชัดที่ใต้ใบมากกว่า',
  'สลับกลุ่มสารกำจัดแมลงทุกรอบการพ่น ช่วยชะลอการดื้อสารได้ดีกว่าเพิ่มอัตราใช้',
  'ข้าวโพดช่วงตั้งแต่งอกถึงอายุราว 30 วันไวต่อวัชพืชที่สุด กำจัดให้ทันในช่วงนี้ผลผลิตจะไม่ตก',
  'ใบเหลืองจากปลายใบเข้ามาเป็นรูปตัววี มักเป็นอาการขาดไนโตรเจน ไม่ใช่โรค ลองตรวจดินก่อนพ่นสาร',
  'จดวันที่พบปัญหาและวันที่พ่นสารไว้ทุกครั้ง ใช้ติดตามว่าวิธีที่ทำได้ผลหรือไม่ — ประวัติการสแกนช่วยได้',
];

const CHECKS = [
  'สำรวจยอดและกาบใบ 10 ต้นต่อไร่ (เดินซิกแซก)',
  'ดูใต้ใบหาไข่หนอนหรือเพลี้ย',
  'ตรวจความชื้นในดินและร่องน้ำ',
  'เช็กวัชพืชแย่งน้ำแย่งปุ๋ย',
  'ถ่ายรูปจุดที่สงสัยให้ AI ช่วยดู',
];

const STORE = 'maize_checklist_v1';

/** เคล็ดลับประจำวัน — เปลี่ยนไปเรื่อย ๆ ตามวันที่ */
export function TodayTip() {
  const [idx, setIdx] = useState(0);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIdx(Math.floor(Date.now() / 86_400_000) % TIPS.length), []);
  return (
    <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-corn-100 to-corn-50 border border-soil-200 p-6 h-full">
      <div className="soft-blob w-32 h-32 bg-corn-300/50 -right-8 -top-8" />
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-corn-100 text-corn-700 mb-3">
        <Lightbulb size={21} />
      </span>
      <p className="text-[13px] font-medium text-corn-800 mb-1.5">เคล็ดลับวันนี้</p>
      <p className="text-[15px] leading-relaxed text-corn-900">{TIPS[idx]}</p>
    </div>
  );
}

/** เช็กลิสต์เดินสำรวจแปลง — ติ๊กแล้วจำไว้ในเครื่อง รีเซ็ตเองทุกวัน */
export function FieldChecklist() {
  const today = new Date().toISOString().slice(0, 10);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || 'null');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw?.day === today) setDone(raw.done ?? []);
    } catch { /* ไม่มี localStorage ก็ใช้ต่อได้ */ }
  }, [today]);

  const save = (next: number[]) => {
    setDone(next);
    try { localStorage.setItem(STORE, JSON.stringify({ day: today, done: next })); } catch { /* ข้าม */ }
  };
  const toggle = (i: number) => save(done.includes(i) ? done.filter((x) => x !== i) : [...done, i]);
  const pct = Math.round((done.length / CHECKS.length) * 100);

  return (
    <div className="rounded-[1.75rem] card-glass p-6 h-full">
      <div className="flex items-center gap-3 mb-1">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-50 text-leaf-700"><ListChecks size={21} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-[17px] text-leaf-900">เช็กลิสต์เดินสำรวจแปลง</h3>
          <p className="text-[12.5px] text-leaf-600">{done.length}/{CHECKS.length} ข้อ · รีเซ็ตทุกวัน</p>
        </div>
        {done.length > 0 && (
          <button type="button" onClick={() => save([])} aria-label="ล้างเช็กลิสต์" className="grid place-items-center w-9 h-9 rounded-xl text-leaf-500 hover:bg-leaf-50 focus-ring">
            <RotateCcw size={16} />
          </button>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-leaf-100 overflow-hidden my-3">
        <div className="h-full rounded-full bg-leaf-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-1.5">
        {CHECKS.map((c, i) => {
          const on = done.includes(i);
          return (
            <li key={c}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={on}
                className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[14px] transition focus-ring ${on ? 'bg-leaf-50 text-leaf-500' : 'hover:bg-leaf-50/70 text-leaf-900'}`}
              >
                <span className={`grid place-items-center w-6 h-6 rounded-full border-2 shrink-0 transition ${on ? 'bg-leaf-500 border-leaf-500 text-white' : 'border-leaf-300'}`}>
                  {on && <Check size={14} strokeWidth={3} />}
                </span>
                <span className={on ? 'line-through' : ''}>{c}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type Scan = { id: string; at: string; topName: string; topType: string; confidence: number };

/** ผลสแกนล่าสุดจากประวัติในเครื่อง */
export function RecentScans() {
  const [scans, setScans] = useState<Scan[] | null>(null);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('maize_scan_history') || '[]') as Scan[];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScans(list.slice(0, 3));
    } catch { setScans([]); }
  }, []);

  return (
    <div className="rounded-[1.75rem] card-glass p-6 h-full">
      <div className="flex items-center gap-3 mb-3">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-sky-50 text-sky-700"><History size={21} /></span>
        <h3 className="font-extrabold text-[17px] text-leaf-900 flex-1">สแกนล่าสุดของคุณ</h3>
        <Link href="/history" className="text-[13px] font-bold text-leaf-700 hover:underline focus-ring rounded">ดูทั้งหมด</Link>
      </div>

      {scans === null ? (
        <div className="h-24 rounded-2xl bg-leaf-50 animate-pulse" />
      ) : scans.length === 0 ? (
        <div className="rounded-2xl bg-leaf-50/80 px-4 py-6 text-center">
          <span className="mx-auto mb-2 grid place-items-center w-11 h-11 rounded-full bg-white text-leaf-500"><Camera size={20} /></span>
          <p className="text-[14px] font-bold text-leaf-900">ยังไม่มีประวัติการสแกน</p>
          <Link href="/detect" className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-leaf-700 hover:underline focus-ring rounded">
            <ScanLine size={15} /> ลองสแกนรูปแรก
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {scans.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-leaf-50/70 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[14.5px] text-leaf-900 truncate">{s.topName}</p>
                <p className="text-[12px] text-leaf-600">{new Date(s.at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-extrabold text-leaf-700 tabular-nums">{s.confidence}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
