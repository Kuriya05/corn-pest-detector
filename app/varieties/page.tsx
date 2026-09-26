'use client';

import { useEffect, useMemo, useState } from 'react';
import { Wheat, Search, ChevronDown, ShieldCheck, AlertTriangle, Sparkles, ShoppingBag, Target } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Chip, Callout, BulletList, SourceList, EmptyState } from '@/components/ui';
import { varieties as seedVarieties, varietyGuide } from '@/lib/data/varieties';
import { useCollection } from '@/lib/use-collection';
import type { Variety } from '@/lib/data/types';

const CAT = '#7c3aed';

const cropTypes = ['all', 'เลี้ยงสัตว์', 'หวาน', 'ข้าวเหนียว', 'เทียน', 'ฝักอ่อน'] as const;

const levelStyle: Record<string, string> = {
  ต้านทาน: 'bg-leaf-100 text-leaf-800 ring-leaf-200',
  ต้านทานปานกลาง: 'bg-corn-100 text-corn-900 ring-corn-200',
  อ่อนแอ: 'bg-rose-100 text-rose-800 ring-rose-200',
  ไม่ระบุ: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function VarietiesPage() {
  const { items } = useCollection<Variety>('varieties', seedVarieties);
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState<(typeof cropTypes)[number]>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    if (hash) {
      setOpenId(hash);
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((v) => {
      if (crop !== 'all' && v.cropType !== crop) return false;
      if (!q) return true;
      return [v.nameTh, v.code ?? '', v.org, v.recommendedFor, ...(v.strengths ?? [])].join(' ').toLowerCase().includes(q);
    });
  }, [items, query, crop]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Variety Guide"
        title="พันธุ์ข้าวโพดแนะนำ"
        description="พันธุ์รับรองของกรมวิชาการเกษตรและมหาวิทยาลัยเกษตรศาสตร์ พร้อมผลผลิต อายุเก็บเกี่ยว และความต้านทานโรครายพันธุ์"
        icon={<Wheat size={26} strokeWidth={2.3} />}
      />

      <Callout tone="danger" title="เรื่องที่ต้องรู้ก่อนซื้อเมล็ดพันธุ์">{varietyGuide.hybridWarning}</Callout>

      <Card className="cat-bar mt-6 mb-7" >
        <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-4">
          <Target size={19} style={{ color: CAT }} /> เลือกพันธุ์ให้ตรงกับปัญหาในไร่
        </h2>
        <div className="grid gap-2.5 md:grid-cols-2">
          {varietyGuide.matchTable.map((m) => (
            <div key={m.situation} className="rounded-3xl ring-1 ring-leaf-100 bg-white/70 p-4">
              <p className="text-[12px] font-black uppercase tracking-[0.1em] text-leaf-600 mb-1">{m.situation}</p>
              <p className="text-[16px] font-extrabold" style={{ color: CAT }}>{m.variety}</p>
              <p className="mt-1 text-[13px] text-leaf-700">{m.why}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-5 space-y-3">
        <h2 className="text-[20px] font-extrabold text-leaf-900">ค้นหาพันธุ์ ({items.length} พันธุ์)</h2>
        <label className="relative block">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
          <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อพันธุ์ เช่น นครสวรรค์ สุวรรณ ชัยนาท หรือพิมพ์คุณสมบัติ เช่น ทนแล้ง อายุสั้น"
            className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-12 pr-4 py-3.5 text-[15px] placeholder:text-leaf-400 focus-ring"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {cropTypes.map((c) => (
            <Chip
              key={c} active={crop === c} onClick={() => setCrop(c)}
              count={c === 'all' ? items.length : items.filter((v) => v.cropType === c).length}
            >
              {c === 'all' ? 'ทั้งหมด' : `ข้าวโพด${c}`}
            </Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Search size={24} />} title="ไม่พบพันธุ์ที่ตรงกับคำค้น" hint="ลองพิมพ์ชื่อศูนย์วิจัย เช่น นครสวรรค์ สุวรรณ ชัยนาท" />
      ) : (
        <div className="space-y-3.5">
          {list.map((v) => {
            const open = openId === v.id;
            return (
              <article key={v.id} id={v.id} className="scroll-mt-24">
                <Card className="cat-bar" >
                  <button type="button" onClick={() => setOpenId(open ? null : v.id)} aria-expanded={open} className="w-full text-left focus-ring rounded-2xl">
                    <div className="flex items-start gap-3.5">
                      <span className="grid place-items-center w-11 h-11 rounded-2xl shrink-0 text-white" style={{ backgroundColor: CAT }}>
                        <Wheat size={21} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11.5px] font-extrabold text-violet-900">
                            ข้าวโพด{v.cropType}
                          </span>
                          <span className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-[11.5px] font-bold text-leaf-700">{v.hybridType}</span>
                          {v.certifiedYear && <span className="text-[11.5px] text-leaf-500">รับรอง {v.certifiedYear}</span>}
                        </div>
                        <h3 className="text-[18px] font-extrabold text-leaf-900">{v.nameTh}</h3>
                        <p className="text-[12.5px] text-leaf-500">{v.org}</p>
                        {v.yield && <p className="mt-2 text-[14px] font-semibold text-leaf-800">ผลผลิต {v.yield}</p>}
                      </div>
                      <ChevronDown size={20} className={`shrink-0 text-leaf-500 transition ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {open && (
                    <div className="mt-5 space-y-5 border-t border-leaf-100 pt-5 animate-rise">
                      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          { k: 'ผลผลิตสภาพปกติ', v: v.yield },
                          { k: 'ผลผลิตสภาพแล้ง', v: v.yieldDrought },
                          { k: 'อายุเก็บเกี่ยว', v: v.maturityDays },
                          { k: 'อายุออกไหม', v: v.silkingDays },
                          { k: 'ความสูงต้น', v: v.plantHeight },
                          { k: 'ความสูงฝัก', v: v.earHeight },
                        ]
                          .filter((x) => x.v)
                          .map((x) => (
                            <div key={x.k} className="rounded-2xl bg-leaf-50 px-4 py-3">
                              <p className="text-[11.5px] font-black uppercase tracking-[0.1em] text-leaf-600">{x.k}</p>
                              <p className="text-[14px] font-semibold text-leaf-900 mt-0.5">{x.v}</p>
                            </div>
                          ))}
                      </div>

                      <div>
                        <h4 className="flex items-center gap-2 font-extrabold text-[15px] text-leaf-900 mb-2.5">
                          <ShieldCheck size={17} style={{ color: CAT }} /> ความต้านทานโรค
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {v.resistance.map((r) => (
                            <span
                              key={r.disease}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold ring-1 ${levelStyle[r.level]}`}
                            >
                              {r.disease}: {r.level}
                            </span>
                          ))}
                        </div>
                      </div>

                      {v.strengths.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 font-extrabold text-[15px] text-leaf-900 mb-2.5">
                            <Sparkles size={17} style={{ color: CAT }} /> ลักษณะเด่น
                          </h4>
                          <BulletList items={v.strengths} marker="check" />
                        </div>
                      )}

                      <div className="rounded-3xl bg-leaf-50 p-4">
                        <p className="text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-1.5">พื้นที่ที่แนะนำ</p>
                        <p className="text-[14px] text-leaf-900">{v.recommendedFor}</p>
                      </div>

                      {v.seedSource && (
                        <div className="rounded-3xl ring-1 ring-leaf-200 bg-white px-4 py-3 flex gap-3">
                          <ShoppingBag size={18} className="shrink-0 mt-0.5" style={{ color: CAT }} />
                          <p className="text-[14px] text-leaf-800">
                            <span className="font-bold">ติดต่อขอเมล็ดพันธุ์: </span>
                            {v.seedSource}
                          </p>
                        </div>
                      )}

                      {v.notes?.length ? (
                        <Callout tone="warn" title="ข้อควรทราบ">
                          <BulletList items={v.notes} marker="warn" />
                        </Callout>
                      ) : null}

                      <SourceList sources={v.sources} />
                    </div>
                  )}
                </Card>
              </article>
            );
          })}
        </div>
      )}

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-3">
            <ShieldCheck size={19} style={{ color: CAT }} /> เมล็ดพันธุ์ที่ดีต้องเป็นอย่างไร
          </h2>
          <BulletList items={varietyGuide.seedQuality} marker="check" />
          <p className="mt-4 rounded-2xl bg-leaf-50 px-4 py-3 text-[13.5px] text-leaf-800">{varietyGuide.labelMustHave}</p>
          <p className="mt-3 text-[13.5px] text-leaf-700">{varietyGuide.seedPrice}</p>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-3">
            <AlertTriangle size={19} className="text-rose-600" /> วิธีสังเกตเมล็ดพันธุ์ปลอม
          </h2>
          <BulletList items={varietyGuide.fakeSeedChecks} marker="warn" />
          <p className="mt-4 rounded-2xl ring-1 ring-rose-200 bg-rose-50 px-4 py-3 text-[13.5px] text-rose-900">
            <span className="font-bold">บทลงโทษตามกฎหมาย: </span>
            {varietyGuide.penalty}
          </p>
        </Card>
      </section>

      <div className="mt-6">
        <SourceList sources={varietyGuide.sources} />
      </div>
    </SiteShell>
  );
}
