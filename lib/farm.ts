'use client';

import { useCallback, useEffect, useState } from 'react';

/* ------------------------------------------------------------------
   สมุดไร่ — เก็บข้อมูลแปลงและบันทึกในเครื่องผู้ใช้ (localStorage)
   ไม่ต้องสมัครสมาชิก · ข้อมูลไม่ขึ้นเซิร์ฟเวอร์ · เปลี่ยนเครื่องแล้วต้องส่งออก/นำเข้าเอง
------------------------------------------------------------------- */

export type Plot = {
  id: string;
  name: string;
  areaRai: number;
  /** วันปลูก YYYY-MM-DD */
  plantedOn: string;
  variety?: string;
  province?: string;
  note?: string;
  createdAt: string;
};

export type LogKind = 'scan' | 'disease' | 'pest' | 'fertilizer' | 'spray' | 'weed' | 'water' | 'harvest' | 'cost' | 'note';

export type FarmLog = {
  id: string;
  plotId: string;
  /** YYYY-MM-DD */
  date: string;
  kind: LogKind;
  title: string;
  note?: string;
  /** ค่าใช้จ่าย (บาท) ถ้ามี */
  cost?: number;
  /** รายได้ (บาท) ถ้าเป็นการขาย */
  income?: number;
};

export type FarmData = { plots: Plot[]; logs: FarmLog[] };

export const LOG_KINDS: Record<LogKind, { label: string; hint: string }> = {
  scan: { label: 'ผลสแกน', hint: 'บันทึกผลวินิจฉัยจาก AI' },
  disease: { label: 'พบโรค', hint: 'เห็นอาการโรคในแปลง' },
  pest: { label: 'พบแมลง', hint: 'เจอแมลงหรือรอยทำลาย' },
  fertilizer: { label: 'ใส่ปุ๋ย', hint: 'สูตร ปริมาณ วิธีใส่' },
  spray: { label: 'พ่นสาร', hint: 'ชื่อสาร อัตรา เหตุผล' },
  weed: { label: 'กำจัดวัชพืช', hint: 'วิธีและวันที่' },
  water: { label: 'ให้น้ำ', hint: 'ครั้งที่ ปริมาณ' },
  harvest: { label: 'เก็บเกี่ยว/ขาย', hint: 'ผลผลิต ราคา รายได้' },
  cost: { label: 'ค่าใช้จ่าย', hint: 'ค่าแรง ค่าเมล็ด ค่าน้ำมัน' },
  note: { label: 'โน้ต', hint: 'จดอะไรก็ได้' },
};

/** ระยะการเจริญเติบโตตามอายุ (วันหลังปลูก) — อิงช่วงวันในหน้าปฏิทินดูแลไร่ */
export type StageInfo = { id: string; name: string; from: number; to: number; tasks: string[]; critical?: boolean };

export const STAGES: StageInfo[] = [
  { id: 'emergence', name: 'งอกและตั้งต้น', from: 0, to: 10, tasks: ['เช็กความงอก ถ้าหลุมไหนไม่งอกให้ปลูกซ่อมภายใน 7 วัน', 'เฝ้าระวังมอดดินและหนอนกระทู้ในต้นอ่อน', 'ให้น้ำสม่ำเสมอ อย่าให้ดินแห้งแข็ง'] },
  { id: 'weed-critical', name: 'ช่วงวิกฤตวัชพืช', from: 11, to: 25, critical: true, tasks: ['กำจัดวัชพืชให้หมดในช่วงนี้ — ผลผลิตตกมากถ้าปล่อยให้แย่งอาหาร', 'สำรวจยอดอ่อนหาหนอนกระทู้ลายจุด', 'ใส่ปุ๋ยรองพื้น/ครั้งแรกตามสูตรที่วางแผนไว้'] },
  { id: 'v4-v6', name: 'ต้นโตเร็ว', from: 26, to: 40, tasks: ['ใส่ปุ๋ยแต่งหน้า (ไนโตรเจน) ตามคำแนะนำ แล้วพูนโคนกลบปุ๋ย', 'ดูอาการขาดธาตุ ใบเหลืองรูปตัว V', 'เริ่มสำรวจโรคใบ โดยเฉพาะหลังฝนตกติดกัน'] },
  { id: 'pre-flower', name: 'ก่อนออกดอก', from: 41, to: 48, critical: true, tasks: ['น้ำสำคัญมาก — อย่าให้ขาดน้ำก่อนออกไหม', 'ตรวจหนอนเจาะลำต้นและเพลี้ย', 'เตรียมใส่ปุ๋ยครั้งสุดท้ายถ้ายังไม่ได้ใส่'] },
  { id: 'silking', name: 'ออกไหม–ผสมเกสร', from: 49, to: 59, critical: true, tasks: ['ช่วงวิกฤตน้ำและอุณหภูมิ — ห้ามขาดน้ำ', 'เฝ้าระวังหนอนเจาะฝักและหนอนกระทู้กัดไหม', 'งดการพ่นสารที่ไม่จำเป็น เพื่อไม่ทำลายแมลงผสมเกสรและศัตรูธรรมชาติ'] },
  { id: 'grain-fill', name: 'สร้างเมล็ด', from: 60, to: 95, tasks: ['ให้น้ำต่อเนื่องจนเมล็ดเริ่มแข็ง', 'ตรวจโรคฝักเน่า–เมล็ดเน่า และแมลงในฝัก', 'วางแผนหาตลาดและจุดรับซื้อล่วงหน้า'] },
  { id: 'maturity', name: 'ใกล้สุกแก่', from: 96, to: 109, tasks: ['สังเกตจุดดำที่โคนเมล็ด (black layer) = สุกแก่', 'ลดน้ำ เตรียมพื้นที่ตากและเครื่องมือเก็บเกี่ยว', 'ตรวจความชื้นเมล็ดเป็นระยะ'] },
  { id: 'harvest', name: 'เก็บเกี่ยว', from: 110, to: 9999, tasks: ['เก็บเกี่ยวเมื่อความชื้นเหมาะสม ตากให้ลดถึง 14.5% ก่อนขายหรือเก็บ', 'ระวังเชื้อราและอะฟลาทอกซิน — อย่าให้เมล็ดโดนฝนหรือชื้นค้าง', 'จดผลผลิตและรายได้ลงสมุดไร่'] },
];

export const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

export function ageDays(plantedOn: string, onDate = todayStr()): number {
  const a = Date.parse(`${plantedOn}T00:00:00Z`);
  const b = Date.parse(`${onDate}T00:00:00Z`);
  return Math.floor((b - a) / 86_400_000);
}

export function stageForAge(age: number): StageInfo | null {
  if (age < 0) return null;
  return STAGES.find((s) => age >= s.from && age <= s.to) ?? STAGES[STAGES.length - 1];
}

export const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

const KEY = 'maize_farm_v1';
const EVENT = 'maize:farm-changed';
const EMPTY: FarmData = { plots: [], logs: [] };

function read(): FarmData {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && Array.isArray(raw.plots) && Array.isArray(raw.logs)) return raw as FarmData;
  } catch { /* ข้อมูลเสียให้เริ่มใหม่ */ }
  return EMPTY;
}

function write(data: FarmData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* พื้นที่เต็ม/ปิดการเก็บข้อมูล */ }
  window.dispatchEvent(new Event(EVENT));
}

/** อ่าน/แก้ข้อมูลสมุดไร่ — ทุกคอมโพเนนต์ที่ใช้จะอัปเดตพร้อมกัน */
export function useFarm() {
  const [data, setData] = useState<FarmData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => setData(read());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    window.addEventListener(EVENT, load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener(EVENT, load); window.removeEventListener('storage', load); };
  }, []);

  const addPlot = useCallback((p: Omit<Plot, 'id' | 'createdAt'>) => {
    const plot: Plot = { ...p, id: uid(), createdAt: new Date().toISOString() };
    const cur = read();
    write({ ...cur, plots: [...cur.plots, plot] });
    return plot;
  }, []);

  const updatePlot = useCallback((id: string, patch: Partial<Plot>) => {
    const cur = read();
    write({ ...cur, plots: cur.plots.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  }, []);

  const removePlot = useCallback((id: string) => {
    const cur = read();
    write({ plots: cur.plots.filter((p) => p.id !== id), logs: cur.logs.filter((l) => l.plotId !== id) });
  }, []);

  const addLog = useCallback((l: Omit<FarmLog, 'id'>) => {
    const cur = read();
    write({ ...cur, logs: [{ ...l, id: uid() }, ...cur.logs] });
  }, []);

  const removeLog = useCallback((id: string) => {
    const cur = read();
    write({ ...cur, logs: cur.logs.filter((l) => l.id !== id) });
  }, []);

  const replaceAll = useCallback((next: FarmData) => write(next), []);

  return { ...data, ready, addPlot, updatePlot, removePlot, addLog, removeLog, replaceAll };
}
