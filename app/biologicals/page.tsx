'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Search, ChevronDown, Target, ListChecks, AlertTriangle, BadgeCheck } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Chip, Callout, BulletList, SourceList, EmptyState } from '@/components/ui';
import { biologicals as seedBio } from '@/lib/data/biologicals';
import { useCollection } from '@/lib/use-collection';
import type { Biological } from '@/lib/data/types';

const CAT = '#0d9488';

const kinds = ['all', 'เชื้อรา', 'แบคทีเรีย', 'ไวรัส', 'แมลงตัวห้ำ', 'แมลงตัวเบียน', 'ไส้เดือนฝอย', 'โปรโตซัว', 'สารสกัดจากพืช'] as const;

export default function BiologicalsPage() {
  const { items } = useCollection<Biological>('biologicals', seedBio);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<(typeof kinds)[number]>('all');
  const [maizeOnly, setMaizeOnly] = useState(false);
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
    return items.filter((b) => {
      if (kind !== 'all' && b.kind !== kind) return false;
      if (maizeOnly && !b.maizeSpecific) return false;
      if (!q) return true;
      return [b.nameTh, b.nameEn, b.scientific ?? '', b.summary, ...(b.controls ?? [])].join(' ').toLowerCase().includes(q);
    });
  }, [items, query, kind, maizeOnly]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Biological Control"
        title="ชีวภัณฑ์และศัตรูธรรมชาติ"
        description="ทางเลือกควบคุมศัตรูพืชที่ปลอดภัยต่อคน ผึ้ง และแมลงดี พร้อมอัตราใช้ตามคำแนะนำทางราชการ"
        icon={<ShieldCheck size={26} strokeWidth={2.3} />}
      />

      <Callout tone="info" title="อ่านป้าย “มีคำแนะนำสำหรับข้าวโพด” ให้ดี">
        รายการที่ติดป้ายนี้คือชีวภัณฑ์ที่เอกสารราชการระบุอัตราใช้สำหรับข้าวโพดไว้โดยตรง
        ส่วนรายการที่ไม่มีป้าย อัตราที่แสดงเป็นคำแนะนำทั่วไปจากพืชอื่น ต้องตรวจสอบฉลากผลิตภัณฑ์ก่อนใช้กับข้าวโพดเสมอ
      </Callout>

      <div className="mt-6 mb-5 space-y-3">
        <label className="relative block">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
          <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อชีวภัณฑ์ หรือพิมพ์ศัตรูพืชที่ต้องการควบคุม เช่น หนอนกระทู้ เพลี้ยอ่อน หนู"
            className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-12 pr-4 py-3.5 text-[15px] placeholder:text-leaf-400 focus-ring"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {kinds.map((k) => (
            <Chip
              key={k} active={kind === k} onClick={() => setKind(k)}
              count={k === 'all' ? items.length : items.filter((b) => b.kind === k).length}
            >
              {k === 'all' ? 'ทั้งหมด' : k}
            </Chip>
          ))}
        </div>
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={maizeOnly} onChange={(e) => setMaizeOnly(e.target.checked)} className="w-5 h-5 accent-teal-600" />
          <span className="text-[14px] font-semibold text-leaf-800">
            แสดงเฉพาะที่มีคำแนะนำสำหรับข้าวโพดโดยตรง ({items.filter((b) => b.maizeSpecific).length} รายการ)
          </span>
        </label>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Search size={24} />} title="ไม่พบชีวภัณฑ์ที่ตรงกับคำค้น" hint="ลองพิมพ์ชื่อศัตรูพืชที่ต้องการควบคุม" />
      ) : (
        <div className="space-y-3.5">
          {list.map((b) => {
            const open = openId === b.id;
            return (
              <article key={b.id} id={b.id} className="scroll-mt-24">
                <Card className="cat-bar" >
                  <button type="button" onClick={() => setOpenId(open ? null : b.id)} aria-expanded={open} className="w-full text-left focus-ring rounded-2xl">
                    <div className="flex items-start gap-3.5">
                      <span className="grid place-items-center w-11 h-11 rounded-2xl shrink-0 text-white" style={{ backgroundColor: CAT }}>
                        <ShieldCheck size={21} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11.5px] font-extrabold text-teal-900">{b.kind}</span>
                          {b.maizeSpecific && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-leaf-700 px-2.5 py-0.5 text-[11.5px] font-extrabold text-white">
                              <BadgeCheck size={12} /> มีคำแนะนำสำหรับข้าวโพด
                            </span>
                          )}
                        </div>
                        <h3 className="text-[18px] font-extrabold text-leaf-900">{b.nameTh}</h3>
                        <p className="text-[12.5px] text-leaf-500">
                          {b.nameEn}
                          {b.scientific ? ` · ${b.scientific}` : ''}
                        </p>
                        <p className="mt-2 text-[14px] text-leaf-700">{b.summary}</p>
                      </div>
                      <ChevronDown size={20} className={`shrink-0 text-leaf-500 transition ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {open && (
                    <div className="mt-5 space-y-5 border-t border-leaf-100 pt-5 animate-rise">
                      <div>
                        <h4 className="flex items-center gap-2 font-extrabold text-[15px] text-leaf-900 mb-2.5">
                          <Target size={17} style={{ color: CAT }} /> ใช้ควบคุม
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {b.controls.map((c) => (
                            <span key={c} className="rounded-full bg-teal-50 px-3 py-1 text-[13px] font-semibold text-teal-900 ring-1 ring-teal-200">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl px-4 py-3.5 text-white" style={{ backgroundColor: CAT }}>
                        <p className="text-[11.5px] font-black uppercase tracking-[0.12em] opacity-80 mb-1">อัตราใช้</p>
                        <p className="text-[14.5px] font-semibold leading-relaxed">{b.rate}</p>
                      </div>

                      {b.howTo.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 font-extrabold text-[15px] text-leaf-900 mb-2.5">
                            <ListChecks size={17} style={{ color: CAT }} /> วิธีใช้
                          </h4>
                          <BulletList items={b.howTo} marker="check" />
                        </div>
                      )}

                      {b.cautions.length > 0 && (
                        <Callout tone="warn" title="ข้อควรระวัง">
                          <BulletList items={b.cautions} marker="warn" />
                        </Callout>
                      )}

                      <SourceList sources={b.sources} />
                    </div>
                  )}
                </Card>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Callout tone="danger" title="สารเคมีที่ทำลายศัตรูธรรมชาติ">
          <BulletList
            items={[
              'ฟิโพรนิล มีพิษร้ายแรงต่อแมลงหางหนีบ ซึ่งเป็นตัวห้ำสำคัญในไร่ข้าวโพด',
              'คาร์บาริล มีพิษต่อแตนเบียนสูง ไม่ควรใช้ในแหล่งที่มีแตนเบียนจำนวนมาก',
              'สารกลุ่มนีโอนิโคตินอยด์ (อิมิดาโคลพริด ไทอะมีทอกแซม โคลไทอะนิดิน) มีพิษต่อผึ้งสูง',
              'ถ้าสำรวจแล้วพบด้วงเต่าและแมลงหางหนีบในแปลง กรมวิชาการเกษตรแนะนำให้งดพ่นสาร เพราะศัตรูธรรมชาติกำลังทำงานอยู่แล้ว',
            ]}
            marker="warn"
          />
        </Callout>
      </div>

      <div className="mt-6">
        <p className="flex gap-2 text-[13px] text-soil-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          ชีวภัณฑ์ส่วนใหญ่ออกฤทธิ์ช้ากว่าสารเคมี 1–3 วัน และต้องใช้ตั้งแต่ศัตรูพืชยังมีจำนวนน้อย จึงต้องสำรวจแปลงสม่ำเสมอ
        </p>
      </div>
    </SiteShell>
  );
}
