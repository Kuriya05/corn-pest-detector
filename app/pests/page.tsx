'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bug, Search, ChevronDown, AlertTriangle, Sprout, Shield, FlaskConical, Eye, Clock } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { ImageGallery, toImages } from '@/components/image-gallery';
import { PageHeader, Card, Chip, Callout, SeverityBadge, BulletList, SourceList, ChemicalTable, EmptyState } from '@/components/ui';
import { pests as seedPests } from '@/lib/data/pests';
import { useCollection } from '@/lib/use-collection';
import type { Pest } from '@/lib/data/types';
import type { Severity } from '@/lib/data/types';

const filters: { id: 'all' | Severity; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'critical', label: 'รุนแรงที่สุด' },
  { id: 'high', label: 'รุนแรง' },
  { id: 'medium', label: 'ปานกลาง' },
  { id: 'low', label: 'เฝ้าระวัง' },
];

export default function PestsPage() {
  const { items: pests } = useCollection<Pest>('pests', seedPests);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Severity>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  // เปิดรายการที่ถูกลิงก์มาจากหน้าสแกนโดยอัตโนมัติ
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    if (hash) {
      setOpenId(hash);
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pests.filter((p) => {
      const okFilter = filter === 'all' || p.severity === filter;
      if (!okFilter) return false;
      if (!q) return true;
      return [p.nameTh, p.nameEn, p.scientific, p.summary, ...(p.aliases ?? []), ...p.damage]
        .join(' ').toLowerCase().includes(q);
    });
  }, [pests, query, filter]);

  const counts = useMemo(
    () => Object.fromEntries(filters.map((f) => [f.id, f.id === 'all' ? pests.length : pests.filter((p) => p.severity === f.id).length])),
    [pests],
  );

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Pest Library"
        title={`คลังแมลงศัตรูข้าวโพด (${pests.length} ชนิด)`}
        description="ข้อมูลแมลงศัตรูข้าวโพดที่พบในประเทศไทย พร้อมจุดสังเกต ระยะที่เข้าทำลาย เกณฑ์ตัดสินใจพ่นสาร และอัตราการใช้สารตามคำแนะนำกรมวิชาการเกษตร"
        icon={<Bug size={26} strokeWidth={2.3} />}
      />

      <Callout tone="warn" title="อ่านก่อนใช้สารเคมี">
        เอกสารกรมวิชาการเกษตรเน้นย้ำหลายจุดว่า <strong>ในหลายกรณีไม่จำเป็นต้องใช้สารฆ่าแมลงเลย</strong> เช่น ข้าวโพดฝักอ่อน
        ข้าวโพดเลี้ยงสัตว์หลังติดเมล็ด และหนอนกระทู้หอมหลังข้าวโพดอายุ 2 สัปดาห์ — ให้สำรวจแปลงและเทียบกับเกณฑ์ตัดสินใจก่อนเสมอ
        และตรวจสอบเปอร์เซ็นต์สูตรบนฉลากผลิตภัณฑ์จริง เพราะถ้า % ต่างกัน อัตราใช้ต้องเปลี่ยนตาม
      </Callout>

      <div className="mt-6 mb-5 space-y-3">
        <label className="relative block">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อแมลง หรือพิมพ์อาการ เช่น ยอดกุด ใบเป็นรู ฝักเสียหาย"
            className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-12 pr-4 py-3.5 text-[15px] placeholder:text-leaf-400 focus-ring"
          />
        </label>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} count={counts[f.id] as number}>
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title="ไม่พบแมลงที่ตรงกับคำค้น"
          hint="ลองใช้คำอื่น เช่น หนอน เพลี้ย ด้วง หรือพิมพ์อาการที่พบในแปลง"
        />
      ) : (
        <div className="space-y-3.5">
          {list.map((p) => {
            const open = openId === p.id;
            return (
              <article key={p.id} id={p.id} className="scroll-mt-24">
                <Card className={open ? 'ring-2 ring-leaf-300' : ''}>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : p.id)}
                    aria-expanded={open}
                    className="w-full text-left focus-ring rounded-2xl"
                  >
                    <div className="flex items-start gap-3.5">
                      {toImages(p)[0] ? (
                        <img src={toImages(p)[0]!} alt={p.nameTh ?? p.id} className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-1 ring-leaf-200" />
                      ) : (
                        <span className="grid place-items-center w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 shrink-0"><Bug size={21} /></span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <SeverityBadge level={p.severity} />
                          {p.aliases?.map((a) => (
                            <span key={a} className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-[11.5px] font-bold text-leaf-700">
                              {a}
                            </span>
                          ))}
                        </div>
                        <h2 className="text-[18px] font-extrabold text-leaf-900">{p.nameTh}</h2>
                        <p className="text-[12.5px] text-leaf-500">
                          {p.nameEn} · <i>{p.scientific}</i>
                        </p>
                        <p className="mt-2 text-[14px] text-leaf-700">{p.summary}</p>
                      </div>
                      <ChevronDown size={20} className={`shrink-0 text-leaf-500 transition ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {open && (
                    <div className="mt-5 space-y-5 border-t border-leaf-100 pt-5 animate-rise">
                      <ImageGallery images={toImages(p)} alt={p.nameTh ?? p.id ?? ''} showPlaceholder />
                      <Section icon={<Eye size={17} />} title="จุดสังเกตตัวแมลง">
                        <BulletList items={p.identify} />
                      </Section>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoBox icon={<Clock size={16} />} title="ระยะที่เข้าทำลาย" text={p.stage} />
                        <InfoBox icon={<Sprout size={16} />} title="ฤดู / สภาพอากาศที่ระบาด" text={p.season} />
                      </div>

                      <Section icon={<AlertTriangle size={17} />} title="อาการความเสียหายในแปลง">
                        <BulletList items={p.damage} marker="warn" />
                      </Section>

                      {p.threshold && (
                        <Callout tone="info" title="เกณฑ์ตัดสินใจพ่นสาร (ระดับเศรษฐกิจ)">{p.threshold}</Callout>
                      )}

                      {p.cultural.length > 0 && (
                        <Section icon={<Shield size={17} />} title="วิธีเขตกรรม (ทำก่อนใช้สารเคมี)">
                          <BulletList items={p.cultural} marker="check" />
                        </Section>
                      )}

                      {p.biological.length > 0 && (
                        <Section icon={<Sprout size={17} />} title="ชีววิธี — ปลอดภัยต่อคนและแมลงดี">
                          <BulletList items={p.biological} marker="check" />
                        </Section>
                      )}

                      <Section icon={<FlaskConical size={17} />} title="สารป้องกันกำจัดที่แนะนำ">
                        <ChemicalTable rows={p.chemicals} />
                      </Section>

                      {p.warnings?.length ? (
                        <Callout tone="danger" title="ข้อควรระวัง">
                          <BulletList items={p.warnings} marker="warn" />
                        </Callout>
                      ) : null}

                      <SourceList sources={p.sources} />
                    </div>
                  )}
                </Card>
              </article>
            );
          })}
        </div>
      )}
    </SiteShell>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-extrabold text-[15px] text-leaf-900 mb-2.5">
        <span className="text-leaf-600">{icon}</span>
        {title}
      </h3>
      <div className="text-leaf-800">{children}</div>
    </div>
  );
}

function InfoBox({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-leaf-50 p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-1.5">
        {icon} {title}
      </p>
      <p className="text-[14px] leading-relaxed text-leaf-900">{text}</p>
    </div>
  );
}
