'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock, Trash2, Search, ScanLine, Bug, Leaf, FlaskConical, Info, Download } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Callout, EmptyState, SeverityBadge } from '@/components/ui';
import type { Severity } from '@/lib/data/types';

type Entry = {
  id: string;
  at: string;
  fileName: string;
  topName: string;
  topType: string;
  confidence: number;
  severity: Severity;
  summary: string;
  findings: { nameTh: string; type: string; confidence: number }[];
  nextSteps: string[];
};

const typeIcon: Record<string, typeof Bug> = {
  pest: Bug, disease: Leaf, deficiency: FlaskConical, healthy: Info, unknown: Info, damage: Bug,
};

const typeLabel: Record<string, string> = {
  pest: 'แมลงศัตรูพืช', disease: 'โรคพืช', deficiency: 'ขาดธาตุอาหาร',
  healthy: 'ต้นสมบูรณ์', damage: 'ร่องรอยความเสียหาย', unknown: 'ยังระบุไม่ได้',
};

export default function HistoryPage() {
  const [list, setList] = useState<Entry[]>([]);
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('maize_scan_history');
      setList(raw ? (JSON.parse(raw) as Entry[]) : []);
    } catch {
      setList([]);
    }
    setReady(true);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((e) =>
      [e.topName, e.summary, ...e.findings.map((f) => f.nameTh)].join(' ').toLowerCase().includes(q),
    );
  }, [list, query]);

  const stats = useMemo(() => {
    const byName = new Map<string, number>();
    list.forEach((e) => byName.set(e.topName, (byName.get(e.topName) ?? 0) + 1));
    return [...byName.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [list]);

  function clearAll() {
    if (!window.confirm('ลบประวัติการสแกนทั้งหมดในเครื่องนี้ใช่หรือไม่? การลบนี้ย้อนกลับไม่ได้')) return;
    localStorage.removeItem('maize_scan_history');
    setList([]);
  }

  function removeOne(id: string) {
    const next = list.filter((e) => e.id !== id);
    setList(next);
    try { localStorage.setItem('maize_scan_history', JSON.stringify(next)); } catch { /* ข้ามไป */ }
  }

  function exportCsv() {
    const header = ['วันที่', 'ผลที่พบ', 'ประเภท', 'ความมั่นใจ (%)', 'สรุป'];
    const rows = list.map((e) => [
      new Date(e.at).toLocaleString('th-TH'),
      e.topName,
      typeLabel[e.topType] ?? e.topType,
      String(e.confidence),
      (e.summary || '').replace(/"/g, '""'),
    ]);
    const csv = '﻿' + [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ประวัติการสแกนข้าวโพด-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Scan History"
        title="ประวัติการสแกน"
        description="ผลวิเคราะห์ที่บันทึกไว้ในเครื่องนี้ ใช้ติดตามว่าอาการในแปลงดีขึ้นหรือแย่ลง"
        icon={<Clock size={26} strokeWidth={2.3} />}
        action={
          list.length > 0 ? (
            <div className="flex gap-2">
              <button
                type="button" onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[14px] font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
              >
                <Download size={16} /> ดาวน์โหลด CSV
              </button>
              <button
                type="button" onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[14px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 transition focus-ring"
              >
                <Trash2 size={16} /> ล้างทั้งหมด
              </button>
            </div>
          ) : undefined
        }
      />

      <Callout tone="info" title="ข้อมูลนี้เก็บไว้ในเครื่องของคุณเท่านั้น">
        ประวัติถูกบันทึกในเบราว์เซอร์เครื่องนี้ ไม่ได้ส่งขึ้นเซิร์ฟเวอร์ ถ้าเปลี่ยนเครื่องหรือล้างข้อมูลเบราว์เซอร์ ประวัติจะหายไป
        แนะนำให้ดาวน์โหลดเป็นไฟล์ CSV เก็บไว้ถ้าต้องใช้อ้างอิง
      </Callout>

      {ready && list.length > 0 && (
        <>
          {stats.length > 0 && (
            <Card className="mt-6">
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-3">
                พบบ่อยที่สุดจากทั้งหมด {list.length} ครั้ง
              </p>
              <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(([name, count]) => (
                  <li key={name} className="rounded-2xl bg-leaf-50 px-4 py-3">
                    <p className="text-[21px] font-extrabold tabular-nums text-leaf-900 leading-none">{count}</p>
                    <p className="mt-1.5 text-[13px] font-semibold text-leaf-700 line-clamp-2">{name}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <label className="relative block mt-5 mb-4">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
            <input
              type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาในประวัติ เช่น หนอนกระทู้ ราน้ำค้าง"
              className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-12 pr-4 py-3.5 text-[15px] placeholder:text-leaf-400 focus-ring"
            />
          </label>
        </>
      )}

      {ready && list.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={<ScanLine size={24} />}
            title="ยังไม่มีประวัติการสแกน"
            hint="เมื่อคุณสแกนรูปข้าวโพด ผลวิเคราะห์จะถูกบันทึกไว้ที่นี่โดยอัตโนมัติ"
          />
          <div className="text-center mt-5">
            <Link
              href="/detect"
              className="inline-flex items-center gap-2 rounded-2xl bg-leaf-700 px-6 py-3.5 font-bold text-white hover:bg-leaf-800 transition focus-ring"
            >
              <ScanLine size={19} /> ไปหน้าสแกน
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((e) => {
          const IconC = typeIcon[e.topType] ?? Info;
          return (
            <Card key={e.id}>
              <div className="flex items-start gap-3.5">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-leaf-100 text-leaf-700 shrink-0">
                  <IconC size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-[11.5px] font-bold text-leaf-700">
                      {typeLabel[e.topType] ?? e.topType}
                    </span>
                    {e.topType !== 'healthy' && <SeverityBadge level={e.severity} />}
                    <span className="text-[12px] text-leaf-500">
                      {new Date(e.at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <h2 className="text-[17px] font-extrabold text-leaf-900">{e.topName}</h2>
                  <p className="text-[12.5px] text-leaf-500">ความมั่นใจ {e.confidence}% · ไฟล์ {e.fileName}</p>

                  {e.summary && <p className="mt-2 text-[14px] text-leaf-700 leading-relaxed">{e.summary}</p>}

                  {e.findings.length > 1 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {e.findings.slice(1).map((f, i) => (
                        <span key={i} className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-[12px] text-leaf-700">
                          {f.nameTh} {f.confidence}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button" onClick={() => removeOne(e.id)} aria-label="ลบรายการนี้"
                  className="shrink-0 grid place-items-center w-9 h-9 rounded-xl text-leaf-400 hover:bg-rose-50 hover:text-rose-600 transition focus-ring"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </SiteShell>
  );
}
