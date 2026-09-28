'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  SprayCan, Search, ChevronDown, Ban, Layers, Target, AlertTriangle, ShieldAlert, Info,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { ImageGallery, toImages } from '@/components/image-gallery';
import { PageHeader, Card, Chip, Callout, BulletList, SourceList, EmptyState } from '@/components/ui';
import { allChemicals as seedChemicals, chemicalCategories, chemicalGuide } from '@/lib/data/chemicals';
import { useCollection } from '@/lib/use-collection';
import type { ChemicalEntry } from '@/lib/data/chemicals';

const CAT = '#be123c';

const categoryTone: Record<string, string> = {
  'สารกำจัดแมลง': 'bg-orange-100 text-orange-900 ring-orange-200',
  'สารป้องกันกำจัดโรคพืช': 'bg-amber-100 text-amber-900 ring-amber-200',
  'สารกำจัดวัชพืช': 'bg-lime-100 text-lime-900 ring-lime-200',
  'สารกำจัดสัตว์ศัตรูพืช': 'bg-stone-200 text-stone-800 ring-stone-300',
  'สารรมโรงเก็บ': 'bg-sky-100 text-sky-900 ring-sky-200',
  'ชีวภัณฑ์': 'bg-teal-100 text-teal-900 ring-teal-200',
};

/** ลิงก์กลับไปยังคลังต้นทางของศัตรูพืชเป้าหมาย */
const targetHref: Record<string, string> = {
  'แมลงศัตรูพืช': '/pests',
  'สัตว์ศัตรูพืช': '/pests',
  'โรคพืช': '/diseases',
  'วัชพืช': '/weeds',
};

export default function ChemicalsPage() {
  const { items } = useCollection<ChemicalEntry>('chemicals', seedChemicals);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');
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
    return items.filter((c) => {
      if (cat !== 'all' && c.category !== cat) return false;
      if (!q) return true;
      const hay = [
        c.nameTh, c.nameEn, c.chemClass ?? '', c.group ?? '', c.mode ?? '',
        ...(c.formulations ?? []),
        ...(c.uses ?? []).map((u) => `${u.target} ${u.rate} ${u.method}`),
        ...(c.matchKeywords ?? []),
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, cat]);

  const bannedCount = items.filter((c) => c.restricted).length;

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Pesticide Library"
        title="คลังสารป้องกันกำจัด"
        description={`รวมสารออกฤทธิ์ ${items.length} ชนิดจากคำแนะนำของกรมวิชาการเกษตรและงานวิจัยไทย ค้นได้ทั้งชื่อสาร ชื่อศัตรูพืช และกลุ่มกลไกการออกฤทธิ์`}
        icon={<SprayCan size={26} strokeWidth={2.3} />}
      />

      <Callout tone="danger" title="ยึดฉลากผลิตภัณฑ์เป็นหลักเสมอ">
        {chemicalGuide.label}
      </Callout>

      <div className="mt-6 mb-5 space-y-3">
        <label className="relative block">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
          <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="พิมพ์ชื่อสาร ชื่อศัตรูพืช หรือกลุ่ม เช่น อีมาเมกติน หนอนกระทู้ IRAC 28"
            className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-12 pr-4 py-3.5 text-[15px] placeholder:text-leaf-400 focus-ring"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <Chip active={cat === 'all'} onClick={() => setCat('all')} count={items.length}>ทั้งหมด</Chip>
          {chemicalCategories.map((k) => (
            <Chip key={k} active={cat === k} onClick={() => setCat(k)} count={items.filter((c) => c.category === k).length}>
              {k}
            </Chip>
          ))}
        </div>
      </div>

      {bannedCount > 0 && (
        <div className="mb-5">
          <Callout tone="danger" title={`มีสารที่ห้ามใช้อยู่ในคลังนี้ ${bannedCount} รายการ`}>
            {chemicalGuide.banned}
          </Callout>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={<Search size={24} />} title="ไม่พบสารที่ตรงกับคำค้น" hint="ลองพิมพ์ชื่อศัตรูพืชแทน เช่น หนอนเจาะลำต้น หรือ ราน้ำค้าง" />
      ) : (
        <div className="space-y-3.5">
          {list.map((c) => {
            const open = openId === c.id;
            return (
              <article key={c.id} id={c.id} className="scroll-mt-24">
                <Card className="cat-bar">
                  <button type="button" onClick={() => setOpenId(open ? null : c.id)} aria-expanded={open} className="w-full text-left focus-ring rounded-2xl">
                    <div className="flex items-start gap-3.5">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.nameTh} className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-1 ring-leaf-200" />
                      ) : (
                        <span
                          className="grid place-items-center w-11 h-11 rounded-2xl shrink-0 text-white"
                          style={{ backgroundColor: c.restricted ? '#57534e' : CAT }}
                        >
                          {c.restricted ? <Ban size={21} /> : <SprayCan size={21} />}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-extrabold ring-1 ${categoryTone[c.category] ?? 'bg-leaf-100 text-leaf-900 ring-leaf-200'}`}>
                            {c.category}
                          </span>
                          {c.group && (
                            <span className="rounded-full bg-leaf-900 px-2.5 py-0.5 text-[11.5px] font-extrabold text-white">{c.group}</span>
                          )}
                          {c.restricted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-700 px-2.5 py-0.5 text-[11.5px] font-extrabold text-white">
                              <Ban size={12} /> ห้ามใช้
                            </span>
                          )}
                        </div>
                        <h3 className="text-[18px] font-extrabold text-leaf-900">{c.nameTh}</h3>
                        <p className="text-[12.5px] text-leaf-500">
                          {c.nameEn}
                          {c.chemClass ? ` · ${c.chemClass}` : ''}
                        </p>
                        {c.mode && <p className="mt-2 text-[14px] text-leaf-700">{c.mode}</p>}
                        {c.uses.length > 0 && (
                          <p className="mt-2 text-[12.5px] font-semibold text-leaf-600">
                            ใช้กับ {c.uses.length} กรณี · {c.uses.slice(0, 3).map((u) => u.target).join(' • ')}
                            {c.uses.length > 3 ? ' …' : ''}
                          </p>
                        )}
                      </div>
                      <ChevronDown size={20} className={`shrink-0 text-leaf-500 transition ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {open && (
                    <div className="mt-5 space-y-5 border-t border-leaf-100 pt-5 animate-rise">
                      <ImageGallery images={toImages(c)} alt={c.nameTh ?? c.id ?? ''} showPlaceholder />
                      {c.restricted && c.restrictedReason && (
                        <Callout tone="danger" title="สถานะทางกฎหมาย / ข้อห้าม">
                          {c.restrictedReason}
                        </Callout>
                      )}

                      {c.formulations.filter((f) => f && f !== '—').length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 font-extrabold text-[15px] text-leaf-900 mb-2.5">
                            <Layers size={17} style={{ color: CAT }} /> สูตรที่พบในคำแนะนำ
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {c.formulations.filter((f) => f && f !== '—').map((f) => (
                              <span key={f} className="rounded-full bg-rose-50 px-3 py-1 text-[13px] font-semibold text-rose-900 ring-1 ring-rose-200">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {c.uses.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 font-extrabold text-[15px] text-leaf-900 mb-2.5">
                            <Target size={17} style={{ color: CAT }} /> ใช้กับอะไร อัตราเท่าไร
                          </h4>
                          <div className="space-y-2.5">
                            {c.uses.map((u, i) => (
                              <div key={i} className="rounded-2xl bg-leaf-50 ring-1 ring-leaf-100 px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  {u.targetId && targetHref[u.targetType] ? (
                                    <Link
                                      href={`${targetHref[u.targetType]}#${u.targetId}`}
                                      className="text-[14.5px] font-extrabold text-leaf-900 underline decoration-leaf-300 underline-offset-4"
                                    >
                                      {u.target}
                                    </Link>
                                  ) : (
                                    <span className="text-[14.5px] font-extrabold text-leaf-900">{u.target}</span>
                                  )}
                                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11.5px] font-bold text-leaf-700 ring-1 ring-leaf-200">{u.method}</span>
                                  {u.formulation && (
                                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[11.5px] font-bold text-leaf-700 ring-1 ring-leaf-200">{u.formulation}</span>
                                  )}
                                </div>
                                <p className="text-[14px] font-semibold text-leaf-800">{u.rate}</p>
                                {u.note && <p className="mt-1 text-[13px] text-soil-700">{u.note}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {c.timing && (
                        <p className="flex gap-2 text-[13.5px] text-leaf-700">
                          <Info size={15} className="shrink-0 mt-0.5" style={{ color: CAT }} />
                          <span><span className="font-bold">จังหวะการใช้:</span> {c.timing}</span>
                        </p>
                      )}

                      {c.warnings && c.warnings.length > 0 && (
                        <Callout tone="warn" title="ข้อควรระวัง">
                          <BulletList items={c.warnings} marker="warn" />
                        </Callout>
                      )}

                      <SourceList sources={c.sources} />
                    </div>
                  )}
                </Card>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8 space-y-4">
        <Callout tone="warn" title="สลับกลุ่มสารเพื่อไม่ให้ศัตรูพืชดื้อยา">
          {chemicalGuide.rotation}
        </Callout>
        <Card>
          <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-leaf-900 mb-3">
            <ShieldAlert size={18} style={{ color: CAT }} /> หลักการใช้สารให้คุ้มและปลอดภัย
          </h3>
          <BulletList
            items={[chemicalGuide.threshold, chemicalGuide.timing, chemicalGuide.mixing, chemicalGuide.ppe, chemicalGuide.bees]}
            marker="check"
          />
        </Card>
        <p className="flex gap-2 text-[13px] text-soil-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          ก่อนใช้สารทุกครั้ง ให้พิจารณาวิธีเขตกรรมและชีวภัณฑ์ก่อน — ดูทางเลือกได้ที่หน้า{' '}
          <Link href="/biologicals" className="font-bold underline underline-offset-4">ชีวภัณฑ์และศัตรูธรรมชาติ</Link>
        </p>
        <SourceList sources={chemicalGuide.sources} />
      </div>
    </SiteShell>
  );
}
