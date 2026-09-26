'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Bug, Leaf, FlaskConical, ArrowRight, Sprout, Wheat, ShieldCheck, SprayCan } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Chip, EmptyState, SeverityBadge } from '@/components/ui';
import { pests as seedPests } from '@/lib/data/pests';
import { diseases as seedDiseases } from '@/lib/data/diseases';
import { deficiencies as seedDeficiencies } from '@/lib/data/fertilizer';
import { weeds as seedWeeds } from '@/lib/data/weeds';
import { varieties as seedVarieties } from '@/lib/data/varieties';
import { biologicals as seedBio } from '@/lib/data/biologicals';
import { allChemicals as seedChemicals, type ChemicalEntry } from '@/lib/data/chemicals';
import { useCollection } from '@/lib/use-collection';
import type { Severity, Pest, Disease, Weed, Variety, Biological } from '@/lib/data/types';
import type { Deficiency } from '@/lib/data/fertilizer';

type Row = {
  id: string;
  kind: 'pest' | 'disease' | 'deficiency' | 'weed' | 'variety' | 'biological' | 'chemical';
  title: string;
  subtitle: string;
  summary: string;
  href: string;
  severity?: Severity;
  haystack: string;
};

const kindMeta = {
  pest: { label: 'แมลงศัตรูพืช', icon: Bug, cls: 'bg-orange-100 text-orange-800' },
  disease: { label: 'โรคพืช', icon: Leaf, cls: 'bg-amber-100 text-amber-900' },
  deficiency: { label: 'ขาดธาตุอาหาร', icon: FlaskConical, cls: 'bg-sky-100 text-sky-800' },
  weed: { label: 'วัชพืช', icon: Sprout, cls: 'bg-lime-100 text-lime-900' },
  variety: { label: 'พันธุ์ข้าวโพด', icon: Wheat, cls: 'bg-violet-100 text-violet-900' },
  biological: { label: 'ชีวภัณฑ์', icon: ShieldCheck, cls: 'bg-teal-100 text-teal-900' },
  chemical: { label: 'สารป้องกันกำจัด', icon: SprayCan, cls: 'bg-rose-100 text-rose-900' },
} as const;

export default function KnowledgePage() {
  const { items: pests } = useCollection<Pest>('pests', seedPests);
  const { items: diseases } = useCollection<Disease>('diseases', seedDiseases);
  const { items: deficiencies } = useCollection<Deficiency>('deficiencies', seedDeficiencies);
  const { items: weeds } = useCollection<Weed>('weeds', seedWeeds);
  const { items: varieties } = useCollection<Variety>('varieties', seedVarieties);
  const { items: biologicals } = useCollection<Biological>('biologicals', seedBio);
  const { items: chemicals } = useCollection<ChemicalEntry>('chemicals', seedChemicals);
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
    ...weeds.map((w) => ({
      id: w.id, kind: 'weed' as const, title: w.nameTh,
      subtitle: `${w.nameEn} · ${w.group} · ${w.lifeCycle}`, summary: w.summary,
      href: `/weeds#${w.id}`,
      haystack: [w.nameTh, w.nameEn, w.scientific, w.summary, ...(w.localNames ?? []), ...w.identify, w.impact].join(' ').toLowerCase(),
    })),
    ...varieties.map((v) => ({
      id: v.id, kind: 'variety' as const, title: v.nameTh,
      subtitle: `ข้าวโพด${v.cropType} · ${v.hybridType} · ${v.org}`,
      summary: v.yield ? `ผลผลิต ${v.yield}` : v.recommendedFor,
      href: `/varieties#${v.id}`,
      haystack: [v.nameTh, v.code ?? '', v.org, v.recommendedFor, ...v.strengths, ...v.resistance.map((r) => `${r.disease} ${r.level}`)].join(' ').toLowerCase(),
    })),
    ...biologicals.map((b) => ({
      id: b.id, kind: 'biological' as const, title: b.nameTh,
      subtitle: `${b.nameEn} · ${b.kind}`, summary: b.summary,
      href: `/biologicals#${b.id}`,
      haystack: [b.nameTh, b.nameEn, b.scientific ?? '', b.summary, ...b.controls, b.rate].join(' ').toLowerCase(),
    })),
    ...chemicals.map((c) => ({
      id: c.id, kind: 'chemical' as const, title: c.nameTh,
      subtitle: `${c.nameEn} · ${c.category}${c.group ? ` · ${c.group}` : ''}`,
      summary: c.restricted ? (c.restrictedReason ?? 'สารที่ห้ามใช้') : (c.mode ?? ''),
      href: `/chemicals#${c.id}`,
      haystack: [c.nameTh, c.nameEn, c.chemClass ?? '', c.group ?? '', c.mode ?? '', ...(c.matchKeywords ?? []), ...c.uses.map((u) => `${u.target} ${u.rate}`)].join(' ').toLowerCase(),
    })),
  ], [pests, diseases, deficiencies, weeds, varieties, biologicals, chemicals]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => (kind === 'all' || r.kind === kind) && (!q || r.haystack.includes(q)));
  }, [rows, query, kind]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Knowledge Base"
        title={`คลังความรู้รวม ${rows.length} รายการ`}
        description="พิมพ์อาการที่เห็นครั้งเดียว ค้นได้ทั้งแมลง โรค วัชพืช พันธุ์ข้าวโพด ชีวภัณฑ์ สารป้องกันกำจัด และอาการขาดธาตุอาหาร"
        icon={<BookOpen size={26} strokeWidth={2.3} />}
      />

      <label className="relative block mb-4">
        <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus
          placeholder="พิมพ์สิ่งที่เห็น เช่น ใบเหลือง แผลยาว ยอดกุด ยางขาว ทนแล้ง หนอนกระทู้"
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
