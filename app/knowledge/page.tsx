'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Bug, Leaf, FlaskConical, ArrowRight } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Chip, EmptyState, SeverityBadge } from '@/components/ui';
import { pests } from '@/lib/data/pests';
import { diseases } from '@/lib/data/diseases';
import { deficiencies } from '@/lib/data/fertilizer';
import type { Severity } from '@/lib/data/types';

type Row = {
  id: string;
  kind: 'pest' | 'disease' | 'deficiency';
  title: string;
  subtitle: string;
  summary: string;
  href: string;
  severity?: Severity;
  haystack: string;
};

const kindMeta = {
  pest: { label: 'แมลงศัตรูพืช', icon: Bug, cls: 'bg-rose-100 text-rose-700' },
  disease: { label: 'โรคพืช', icon: Leaf, cls: 'bg-orange-100 text-orange-800' },
  deficiency: { label: 'ขาดธาตุอาหาร', icon: FlaskConical, cls: 'bg-sky-100 text-sky-800' },
} as const;

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | Row['kind']>('all');

  const rows = useMemo<Row[]>(() => [
    ...pests.map((p) => ({
      id: p.id, kind: 'pest' as const, title: p.nameTh,
      subtitle: `${p.nameEn} · ${p.scientific}`, summary: p.summary,
      href: `/pests#${p.id}`, severity: p.severity,
      haystack: [p.nameTh, p.nameEn, p.scientific, p.summary, ...(p.aliases ?? []), ...p.identify, ...p.damage, p.season].join(' ').toLowerCase(),
    })),
    ...diseases.map((d) => ({
      id: d.id, kind: 'disease' as const, title: d.nameTh,
      subtitle: `${d.nameEn} · ${d.pathogen}`, summary: d.summary,
      href: `/diseases#${d.id}`, severity: d.severity,
      haystack: [d.nameTh, d.nameEn, d.pathogen, d.summary, ...d.symptoms, d.conditions, d.distinguish ?? ''].join(' ').toLowerCase(),
    })),
    ...deficiencies.map((x) => ({
      id: x.id, kind: 'deficiency' as const, title: `ขาด${x.nutrient} (${x.symbol})`,
      subtitle: x.quickSign, summary: x.fix,
      href: `/fertilizer#deficiency-${x.id}`,
      haystack: [x.nutrient, x.symbol, x.quickSign, x.cause, x.fix, ...x.symptoms].join(' ').toLowerCase(),
    })),
  ], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => (kind === 'all' || r.kind === kind) && (!q || r.haystack.includes(q)));
  }, [rows, query, kind]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Knowledge Base"
        title="คลังความรู้รวม"
        description="ค้นหาข้ามทุกหมวดพร้อมกัน — แมลงศัตรูพืช โรคข้าวโพด และอาการขาดธาตุอาหาร"
        icon={<BookOpen size={26} strokeWidth={2.3} />}
      />

      <label className="relative block mb-4">
        <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus
          placeholder="พิมพ์อาการที่เห็น เช่น ใบเหลือง แผลยาว ยอดกุด ผงสีขาว ฝักเน่า"
          className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-12 pr-4 py-4 text-[16px] placeholder:text-leaf-400 focus-ring"
        />
      </label>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
        <Chip active={kind === 'all'} onClick={() => setKind('all')} count={rows.length}>ทั้งหมด</Chip>
        {(Object.keys(kindMeta) as Row['kind'][]).map((k) => (
          <Chip key={k} active={kind === k} onClick={() => setKind(k)} count={rows.filter((r) => r.kind === k).length}>
            {kindMeta[k].label}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title="ไม่พบข้อมูลที่ตรงกับคำค้น"
          hint="ลองพิมพ์สั้นลง เช่น ใบเหลือง รูเจาะ ตุ่มนูน หรือดูทีละหมวดจากเมนูด้านบน"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((r) => {
            const meta = kindMeta[r.kind];
            const IconC = meta.icon;
            return (
              <Link key={`${r.kind}-${r.id}`} href={r.href} className="group focus-ring rounded-4xl">
                <Card className="h-full transition group-hover:-translate-y-0.5">
                  <div className="flex items-start gap-3.5">
                    <span className={`grid place-items-center w-11 h-11 rounded-2xl shrink-0 ${meta.cls}`}>
                      <IconC size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-extrabold ${meta.cls}`}>
                          {meta.label}
                        </span>
                        {r.severity && <SeverityBadge level={r.severity} />}
                      </div>
                      <h2 className="text-[16.5px] font-extrabold text-leaf-900 flex items-center gap-1.5">
                        {r.title}
                        <ArrowRight size={15} className="text-leaf-400 group-hover:translate-x-0.5 transition" />
                      </h2>
                      <p className="text-[12px] text-leaf-500 truncate">{r.subtitle}</p>
                      <p className="mt-2 text-[13.5px] text-leaf-700 leading-relaxed">{r.summary}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </SiteShell>
  );
}
