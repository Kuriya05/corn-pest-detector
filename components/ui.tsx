'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ExternalLink, AlertTriangle, Info, BookMarked } from 'lucide-react';
import type { Severity, SourceRef } from '@/lib/data/types';
import { severityLabel, severityStyle } from '@/lib/data/types';

export function PageHeader({
  eyebrow, title, description, icon, action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-7 animate-rise">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {icon && (
            <span className="grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-3xl bg-leaf-700 text-corn-300 shrink-0 shadow-sm">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-leaf-600 mb-1">{eyebrow}</p>
            )}
            <h1 className="text-[24px] sm:text-[30px] font-extrabold text-leaf-900">{title}</h1>
            {description && <p className="mt-1.5 text-[14.5px] text-leaf-700 max-w-2xl">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

export function SeverityBadge({ level }: { level: Severity }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-extrabold ring-1 ${severityStyle[level]}`}>
      {severityLabel[level]}
    </span>
  );
}

export function Chip({
  active, onClick, children, count,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] font-bold transition focus-ring ${
        active ? 'bg-leaf-700 text-white shadow-sm' : 'bg-white text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`ml-1.5 text-[11.5px] ${active ? 'text-leaf-200' : 'text-leaf-500'}`}>({count})</span>
      )}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card-glass rounded-4xl p-5 sm:p-6 ${className}`}>{children}</section>;
}

export function Callout({
  tone = 'info', title, children,
}: {
  tone?: 'info' | 'warn' | 'danger';
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: { box: 'bg-leaf-50 ring-leaf-200 text-leaf-900', icon: <Info size={18} className="text-leaf-600" /> },
    warn: { box: 'bg-corn-50 ring-corn-200 text-corn-900', icon: <AlertTriangle size={18} className="text-corn-600" /> },
    danger: { box: 'bg-rose-50 ring-rose-200 text-rose-900', icon: <AlertTriangle size={18} className="text-rose-600" /> },
  }[tone];

  return (
    <div className={`rounded-3xl ring-1 p-4 sm:p-5 ${styles.box}`}>
      <div className="flex gap-3">
        <span className="shrink-0 mt-0.5">{styles.icon}</span>
        <div className="min-w-0 text-[14px] leading-relaxed">
          {title && <p className="font-extrabold mb-1">{title}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function Disclosure({
  title, children, defaultOpen = false, badge,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl ring-1 ring-leaf-100 bg-white/70 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-leaf-50/70 transition focus-ring"
      >
        <span className="flex-1 font-extrabold text-[15px] text-leaf-900">{title}</span>
        {badge}
        <ChevronDown size={18} className={`shrink-0 text-leaf-600 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 pt-1 text-[14px] leading-relaxed text-leaf-800">{children}</div>}
    </div>
  );
}

export function BulletList({ items, marker = 'dot' }: { items: string[]; marker?: 'dot' | 'check' | 'warn' }) {
  const dot = {
    dot: 'bg-leaf-400',
    check: 'bg-leaf-600',
    warn: 'bg-corn-500',
  }[marker];
  return (
    <ul className="space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5">
          <span className={`mt-[9px] w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
          <span className="text-[14px] leading-relaxed">{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function SourceList({ sources, compact }: { sources: SourceRef[]; compact?: boolean }) {
  if (!sources?.length) return null;
  return (
    <div className={compact ? '' : 'rounded-3xl bg-soil-50 ring-1 ring-soil-200 p-4 sm:p-5'}>
      <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.14em] text-soil-700 mb-2.5">
        <BookMarked size={14} /> แหล่งอ้างอิง
      </p>
      <ul className="space-y-1.5">
        {sources.map((s) => (
          <li key={s.url + s.label}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1.5 text-[13px] text-soil-800 hover:text-soil-950 hover:underline focus-ring rounded"
            >
              <span>{s.label}</span>
              <ExternalLink size={12} className="shrink-0 mt-1" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-4xl border-2 border-dashed border-leaf-200 bg-white/50 py-14 px-6 text-center">
      {icon && <div className="mx-auto mb-3 grid place-items-center w-14 h-14 rounded-3xl bg-leaf-50 text-leaf-500">{icon}</div>}
      <p className="font-extrabold text-leaf-900">{title}</p>
      {hint && <p className="mt-1.5 text-[13.5px] text-leaf-600 max-w-md mx-auto">{hint}</p>}
    </div>
  );
}

/** ตารางสารเคมี — แสดงเป็นการ์ดบนมือถือ ตารางบนจอใหญ่ */
export function ChemicalTable({
  rows,
}: {
  rows: { name: string; formulation?: string; group?: string; rate: string; method: string; note?: string }[];
}) {
  if (!rows.length) {
    return (
      <Callout tone="info">
        ไม่พบคำแนะนำสารเคมีอย่างเป็นทางการสำหรับกรณีนี้ในเอกสารกรมวิชาการเกษตร — ให้เน้นวิธีเขตกรรมและชีววิธีแทน
      </Callout>
    );
  }
  return (
    <div>
      <div className="hidden md:block overflow-x-auto rounded-3xl ring-1 ring-leaf-100">
        <table className="w-full text-[13.5px]">
          <thead className="bg-leaf-50 text-leaf-900">
            <tr>
              <th className="text-left font-extrabold px-4 py-3">สารออกฤทธิ์</th>
              <th className="text-left font-extrabold px-4 py-3">สูตร</th>
              <th className="text-left font-extrabold px-4 py-3">กลุ่ม</th>
              <th className="text-left font-extrabold px-4 py-3">อัตราใช้</th>
              <th className="text-left font-extrabold px-4 py-3">วิธีใช้</th>
            </tr>
          </thead>
          <tbody className="bg-white/70">
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-leaf-50 align-top">
                <td className="px-4 py-3 font-bold text-leaf-900">
                  {r.name}
                  {r.note && <span className="block font-normal text-[12.5px] text-leaf-600 mt-1">{r.note}</span>}
                </td>
                <td className="px-4 py-3 text-leaf-700 whitespace-nowrap">{r.formulation ?? '—'}</td>
                <td className="px-4 py-3 text-leaf-700 whitespace-nowrap">{r.group ?? '—'}</td>
                <td className="px-4 py-3 font-bold text-leaf-800">{r.rate}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-leaf-100 px-2.5 py-0.5 text-[12px] font-bold text-leaf-800 whitespace-nowrap">
                    {r.method}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden space-y-2.5">
        {rows.map((r, i) => (
          <li key={i} className="rounded-3xl ring-1 ring-leaf-100 bg-white/80 p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="font-extrabold text-[14.5px] text-leaf-900">{r.name}</p>
              <span className="shrink-0 rounded-full bg-leaf-100 px-2.5 py-0.5 text-[11.5px] font-bold text-leaf-800">
                {r.method}
              </span>
            </div>
            <p className="text-[13px] text-leaf-600 mb-1">
              {[r.formulation, r.group].filter(Boolean).join(' · ') || '—'}
            </p>
            <p className="text-[14px] font-bold text-leaf-800">{r.rate}</p>
            {r.note && <p className="mt-1.5 text-[12.5px] text-leaf-600">{r.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
