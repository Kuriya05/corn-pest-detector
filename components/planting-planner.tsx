'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, AlertTriangle, CheckCircle2, NotebookPen } from 'lucide-react';
import { STAGES, ageDays, todayStr } from '@/lib/farm';

const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
const icsDate = (d: string) => d.replaceAll('-', '');

/** ไฟล์ .ics — เปิดแล้วเพิ่มทุกช่วงลงปฏิทินในมือถือ (Google Calendar, ปฏิทินของ iPhone) ได้ทีเดียว */
function buildIcs(planted: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const events = STAGES.map((s) => {
    const start = addDays(planted, s.from);
    const end = addDays(planted, s.to >= 9999 ? s.from + 10 : s.to + 1);
    const desc = s.tasks.map((t) => `- ${t}`).join('\\n');
    return [
      'BEGIN:VEVENT',
      `UID:corn-${planted}-${s.id}@corn-pest-detector`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(start)}`,
      `DTEND;VALUE=DATE:${icsDate(end)}`,
      `SUMMARY:ข้าวโพด: ${s.name}${s.critical ? ' (ช่วงวิกฤต)' : ''}`,
      `DESCRIPTION:${desc}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT12H',
      'ACTION:DISPLAY',
      `DESCRIPTION:พรุ่งนี้เริ่มช่วง ${s.name}`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//corn-pest-detector//planner//TH', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n');
}

export default function PlantingPlanner() {
  // ตั้งวันที่หลังโหลดหน้า เพื่อให้ตรงกับเวลาเครื่องผู้ใช้ ไม่ใช่เวลาเซิร์ฟเวอร์
  const [planted, setPlanted] = useState('');
  const [today, setToday] = useState('');
  useEffect(() => {
    const t = todayStr();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(t);
    setPlanted(t);
  }, []);

  const rows = useMemo(() => {
    if (!planted) return [];
    return STAGES.map((s) => ({
      ...s,
      start: addDays(planted, s.from),
      end: s.to >= 9999 ? null : addDays(planted, s.to),
    }));
  }, [planted]);

  const age = planted && today ? ageDays(planted, today) : null;

  const download = () => {
    const blob = new Blob([buildIcs(planted)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corn-plan-${planted}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-4xl bg-white border border-leaf-100 p-5 sm:p-7">
      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="block text-[13px] font-extrabold text-leaf-800 mb-1.5">วันที่ปลูก (หรือวันที่จะปลูก)</span>
          <input
            type="date"
            value={planted}
            onChange={(e) => setPlanted(e.target.value)}
            className="rounded-2xl border-2 border-leaf-200 bg-white px-4 py-2.5 text-[16px] text-leaf-900 focus:border-leaf-500 focus-ring"
          />
        </label>
        {age !== null && (
          <p className="pb-2.5 text-[14.5px] text-leaf-700">
            {age < 0 ? `อีก ${-age} วันถึงวันปลูก` : `วันนี้ข้าวโพดอายุ ${age} วัน`}
            {rows[rows.length - 1] && ` · คาดว่าเก็บเกี่ยวได้ราว ${fmt(rows[rows.length - 1].start)}`}
          </p>
        )}
      </div>

      {rows.length > 0 && (
        <>
          <ol className="mt-5 space-y-2.5">
            {rows.map((r) => {
              const now = age !== null && age >= r.from && age <= r.to;
              const past = age !== null && age > r.to;
              return (
                <li
                  key={r.id}
                  className={`rounded-3xl border p-4 ${now ? 'border-leaf-500 bg-leaf-50 ring-2 ring-leaf-200' : past ? 'border-leaf-100 opacity-60' : 'border-leaf-100'}`}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-extrabold text-[16px] text-leaf-900">{r.name}</span>
                    {r.critical && <span className="inline-flex items-center gap-1 rounded-full bg-corn-200 px-2.5 py-0.5 text-[12px] font-extrabold text-corn-900"><AlertTriangle size={12} /> ช่วงวิกฤต</span>}
                    {now && <span className="rounded-full bg-leaf-600 px-2.5 py-0.5 text-[12px] font-extrabold text-white">ตอนนี้</span>}
                    <span className="ml-auto text-[13.5px] tabular-nums text-leaf-700">
                      {fmt(r.start)}{r.end ? ` – ${fmt(r.end)}` : ' เป็นต้นไป'} · วันที่ {r.from}{r.end ? `–${r.to}` : '+'}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {r.tasks.map((t) => (
                      <li key={t} className="flex gap-2 text-[14px] text-leaf-800 leading-snug"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-leaf-500" /> {t}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-2xl bg-leaf-900 px-5 py-2.5 text-[14.5px] font-medium text-white hover:bg-leaf-800 focus-ring">
              <CalendarPlus size={16} /> เพิ่มลงปฏิทินในมือถือ (.ics)
            </button>
            <Link href="/farm" className="inline-flex items-center gap-2 rounded-2xl bg-soil-100 px-5 py-2.5 text-[14.5px] font-medium text-leaf-900 hover:bg-soil-200 focus-ring">
              <NotebookPen size={16} /> จดเป็นแปลงในสมุดไร่
            </Link>
          </div>
          <p className="mt-2 text-[12.5px] text-leaf-600">ช่วงวันเป็นค่าประมาณของข้าวโพดเลี้ยงสัตว์อายุ 110–120 วัน พันธุ์อายุสั้น/ยาวหรืออากาศที่ต่างไปจะเลื่อนได้ ให้ดูต้นจริงในแปลงประกอบ</p>
        </>
      )}
    </div>
  );
}
