'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sprout, Leaf, Search, ChevronDown, AlertTriangle, Eye, Shield, FlaskConical, ListChecks, Clock } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { ImageGallery, toImages } from '@/components/image-gallery';
import { PageHeader, Card, Chip, Callout, BulletList, SourceList, EmptyState } from '@/components/ui';
import { weeds as seedWeeds, weedOverview, herbicideInjury } from '@/lib/data/weeds';
import { useCollection } from '@/lib/use-collection';
import type { Weed } from '@/lib/data/types';

const CAT = '#65a30d';

const groups = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'ใบแคบ', label: 'ใบแคบ / ตระกูลหญ้า' },
  { id: 'ใบกว้าง', label: 'ใบกว้าง' },
  { id: 'กก', label: 'กก' },
] as const;

export default function WeedsPage() {
  const { items } = useCollection<Weed>('weeds', seedWeeds);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<(typeof groups)[number]['id']>('all');
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
    return items.filter((w) => {
      if (group !== 'all' && w.group !== group) return false;
      if (!q) return true;
      return [w.nameTh, w.nameEn, w.scientific, w.summary, ...(w.localNames ?? []), ...(w.identify ?? [])]
        .join(' ').toLowerCase().includes(q);
    });
  }, [items, query, group]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Weed Library"
        title="คลังวัชพืชในไร่ข้าวโพด"
        description="จำแนกวัชพืชที่พบจริงในแปลงข้าวโพดไทย พร้อมวิธีกำจัดเชิงเขตกรรมและสารกำจัดวัชพืชตามคำแนะนำกรมวิชาการเกษตร"
        icon={<Sprout size={26} strokeWidth={2.3} />}
      />

      <div className="grid gap-4 lg:grid-cols-3 mb-7">
        <Card className="cat-bar lg:col-span-2" >
          <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-3">
            <Clock size={19} style={{ color: CAT }} /> ช่วงวิกฤตที่ต้องปลอดวัชพืช
          </h2>
          <p className="rounded-2xl bg-leaf-50 px-4 py-3 text-[14.5px] font-semibold text-leaf-900">
            {weedOverview.criticalPeriod}
          </p>
          <p className="mt-3 rounded-2xl ring-1 ring-rose-200 bg-rose-50 px-4 py-3 text-[14px] text-rose-900">
            {weedOverview.yieldLoss}
          </p>
        </Card>

        <Card>
          <h2 className="text-[15px] font-extrabold text-leaf-900 mb-2">พบบ่อยที่สุด 5 อันดับ</h2>
          <ol className="space-y-1.5">
            {weedOverview.topFive.map((n, i) => (
              <li key={n} className="flex items-center gap-2.5 text-[14px] text-leaf-800">
                <span
                  className="grid place-items-center w-6 h-6 rounded-lg text-[12px] font-extrabold text-white shrink-0"
                  style={{ backgroundColor: CAT }}
                >
                  {i + 1}
                </span>
                {n}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[12px] text-leaf-600 leading-relaxed">{weedOverview.surveyNote}</p>
        </Card>
      </div>

      <Card className="mb-7">
        <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-3">
          <ListChecks size={19} style={{ color: CAT }} /> ลำดับการจัดการวัชพืช 5 ขั้นตอน
        </h2>
        <ol className="space-y-2.5">
          {weedOverview.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="grid place-items-center w-7 h-7 rounded-xl text-[13px] font-extrabold text-white shrink-0"
                style={{ backgroundColor: CAT }}
              >
                {i + 1}
              </span>
              <span className="text-[14.5px] leading-relaxed text-leaf-800">{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 space-y-3">
          <Callout tone="info" title="ไม่ใช้สารเคมีก็ได้ผลเท่ากัน">{weedOverview.manualAlternative}</Callout>
          <Callout tone="danger" title="พาราควอตถูกแบนแล้ว">{weedOverview.paraquatBan}</Callout>
        </div>
      </Card>

      <div className="mb-5 space-y-3">
        <h2 className="text-[20px] font-extrabold text-leaf-900">ค้นหาวัชพืช ({items.length} ชนิด)</h2>
        <label className="relative block">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
          <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อวัชพืช หรือพิมพ์ลักษณะที่เห็น เช่น ยางขาว ลำต้นสามเหลี่ยม หัวใต้ดิน"
            className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-12 pr-4 py-3.5 text-[15px] placeholder:text-leaf-400 focus-ring"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {groups.map((g) => (
            <Chip
              key={g.id} active={group === g.id} onClick={() => setGroup(g.id)}
              count={g.id === 'all' ? items.length : items.filter((w) => w.group === g.id).length}
            >
              {g.label}
            </Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Search size={24} />} title="ไม่พบวัชพืชที่ตรงกับคำค้น" hint="ลองพิมพ์ลักษณะที่เห็น เช่น ยางขาว ดอกเหลือง ลำต้นสามเหลี่ยม" />
      ) : (
        <div className="space-y-3.5">
          {list.map((w) => {
            const open = openId === w.id;
            return (
              <article key={w.id} id={w.id} className="scroll-mt-24">
                <Card className={`cat-bar ${open ? 'ring-2' : ''}`} >
                  <button type="button" onClick={() => setOpenId(open ? null : w.id)} aria-expanded={open} className="w-full text-left focus-ring rounded-2xl">
                    <div className="flex items-start gap-3.5">
                      {toImages(w)[0] ? (
                        <img src={toImages(w)[0]!} alt={w.nameTh ?? w.id} className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-1 ring-leaf-200" />
                      ) : (
                        <span className="grid place-items-center w-11 h-11 rounded-2xl bg-lime-100 text-lime-700 shrink-0"><Leaf size={21} /></span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-[11.5px] font-extrabold text-lime-900">{w.group}</span>
                          <span className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-[11.5px] font-bold text-leaf-700">{w.lifeCycle}</span>
                          {w.frequency && <span className="text-[11.5px] text-leaf-500">{w.frequency}</span>}
                        </div>
                        <h3 className="text-[18px] font-extrabold text-leaf-900">{w.nameTh}</h3>
                        <p className="text-[12.5px] text-leaf-500">
                          {w.nameEn} · <i>{w.scientific}</i>
                          {w.localNames?.length ? ` · ชื่ออื่น: ${w.localNames.join(', ')}` : ''}
                        </p>
                        <p className="mt-2 text-[14px] text-leaf-700">{w.summary}</p>
                      </div>
                      <ChevronDown size={20} className={`shrink-0 text-leaf-500 transition ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {open && (
                    <div className="mt-5 space-y-5 border-t border-leaf-100 pt-5 animate-rise">
                      <ImageGallery images={toImages(w)} alt={w.nameTh ?? w.id ?? ''} showPlaceholder />
                      <Section icon={<Eye size={17} />} title="ลักษณะที่ใช้จำแนกในแปลง">
                        <BulletList items={w.identify} />
                      </Section>
                      <div className="rounded-3xl bg-leaf-50 p-4">
                        <p className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-1.5">
                          <AlertTriangle size={15} /> ผลกระทบต่อข้าวโพด
                        </p>
                        <p className="text-[14px] text-leaf-900">{w.impact}</p>
                      </div>
                      <Section icon={<Shield size={17} />} title="วิธีเขตกรรม">
                        <BulletList items={w.cultural} marker="check" />
                      </Section>
                      <Section icon={<FlaskConical size={17} />} title="สารกำจัดวัชพืชที่ได้ผล">
                        <BulletList items={w.herbicides} marker="warn" />
                      </Section>
                      <SourceList sources={w.sources} />
                    </div>
                  )}
                </Card>
              </article>
            );
          })}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-[20px] font-extrabold text-leaf-900 mb-1.5">ข้าวโพดผิดปกติเพราะสารกำจัดวัชพืชหรือเปล่า</h2>
        <p className="text-[14px] text-leaf-700 mb-4">
          อาการเหล่านี้มักถูกเข้าใจผิดว่าเป็นโรค — ถ้าตรงกับตารางนี้ ให้ทบทวนสารที่พ่นไปก่อน
        </p>
        <Card>
          <ul className="space-y-3">
            {herbicideInjury.map((h) => (
              <li key={h.name} className="rounded-3xl ring-1 ring-leaf-100 bg-white/70 p-4">
                <p className="font-extrabold text-[15px] text-leaf-900 mb-1">{h.name}</p>
                <p className="text-[14px] text-leaf-800">{h.symptom}</p>
                <p className="mt-1.5 text-[13px] font-semibold text-corn-800">⚠ {h.caution}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <div className="mt-8 space-y-4">
        <Callout tone="warn" title="เรื่องการดื้อสารกำจัดวัชพืช">{weedOverview.resistanceNote}</Callout>
        <SourceList sources={weedOverview.sources} />
      </div>
    </SiteShell>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="flex items-center gap-2 font-extrabold text-[15px] text-leaf-900 mb-2.5">
        <span style={{ color: CAT }}>{icon}</span>
        {title}
      </h4>
      <div className="text-leaf-800">{children}</div>
    </div>
  );
}
