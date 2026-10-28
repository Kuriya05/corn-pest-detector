'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, Shield, FlaskConical, Eye, Thermometer, Sprout, X, Bookmark, Shuffle,
  LayoutGrid, Rows3, ArrowUpRight, Microscope, Virus, Dna, BookOpen, Stethoscope, type LucideIcon,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { ImageGallery, toImages } from '@/components/image-gallery';
import { Callout, BulletList, SourceList, ChemicalTable, EmptyState, LoadState } from '@/components/ui';
import { SymptomAdvisor } from '@/components/symptom-advisor';
import { useCollection } from '@/lib/use-collection';
import { normSeverity } from '@/lib/normalize';
import type { Disease, Severity } from '@/lib/data/types';

type KindId = 'เชื้อรา' | 'แบคทีเรีย' | 'ไวรัส';
const KINDS: { id: KindId; label: string; Icon: LucideIcon }[] = [
  { id: 'เชื้อรา', label: 'เชื้อรา', Icon: Microscope },
  { id: 'แบคทีเรีย', label: 'แบคทีเรีย', Icon: Dna },
  { id: 'ไวรัส', label: 'ไวรัส', Icon: Virus },
];
const kindMeta = (k: string) => KINDS.find((x) => x.id === k) ?? KINDS[0];

const LEVELS: Record<Severity, { label: string; dot: string; band: string; text: string }> = {
  critical: { label: 'รุนแรงที่สุด', dot: 'bg-rose-600', band: 'bg-rose-600', text: 'text-rose-700' },
  high: { label: 'รุนแรง', dot: 'bg-orange-500', band: 'bg-orange-500', text: 'text-orange-700' },
  medium: { label: 'ปานกลาง', dot: 'bg-amber-400', band: 'bg-amber-400', text: 'text-amber-700' },
  low: { label: 'เฝ้าระวัง', dot: 'bg-sky-400', band: 'bg-sky-400', text: 'text-sky-700' },
};
const RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function Level({ level }: { level: Severity }) {
  const m = LEVELS[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold ${m.text}`}>
      <span className={`w-2 h-2 rounded-full ${m.dot}`} aria-hidden />
      {m.label}
    </span>
  );
}

const FAV_KEY = 'maize_disease_favs';
const no = (i: number) => String(i + 1).padStart(2, '0');

export default function DiseasesPage() {
  const { items: diseases, loading, error, reload } = useCollection<Disease>('diseases');
  const [tab, setTab] = useState<'library' | 'advisor'>('library');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | KindId>('all');
  const [level, setLevel] = useState<'all' | Severity>('all');
  const [sort, setSort] = useState<'danger' | 'name'>('danger');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFavs(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
    } catch { /* ใช้ต่อได้โดยไม่มีที่เก็บ */ }
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    if (hash === 'advisor') setTab('advisor');
    else if (hash) setOpenId(hash); // ลิงก์มาจากหน้าสแกน
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavs((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ข้าม */ }
      return next;
    });
  }, []);

  const regNo = useMemo(() => new Map(diseases.map((d, i) => [d.id, no(i)])), [diseases]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = diseases.filter((d) => {
      if (kind !== 'all' && d.kind !== kind) return false;
      if (level !== 'all' && normSeverity(d.severity) !== level) return false;
      if (favOnly && !favs.includes(d.id)) return false;
      if (!q) return true;
      return [d.nameTh, d.nameEn, d.pathogen, d.summary, ...(d.symptoms ?? [])].join(' ').toLowerCase().includes(q);
    });
    return out.sort((a, b) =>
      sort === 'name'
        ? (a.nameTh ?? '').localeCompare(b.nameTh ?? '', 'th')
        : RANK[normSeverity(a.severity)] - RANK[normSeverity(b.severity)] || (a.nameTh ?? '').localeCompare(b.nameTh ?? '', 'th'),
    );
  }, [diseases, query, kind, level, sort, favOnly, favs]);

  const kindCount = (id: KindId) => diseases.filter((d) => d.kind === id).length;
  const severeCount = diseases.filter((d) => ['critical', 'high'].includes(normSeverity(d.severity))).length;
  const opened = diseases.find((d) => d.id === openId) ?? null;

  const surprise = () => {
    const pool = list.length ? list : diseases;
    if (!pool.length) return;
    setOpenId(pool[Math.floor(Math.random() * pool.length)].id);
  };

  return (
    <SiteShell>
      {/* ---------- หัวเรื่อง ---------- */}
      <header className="mb-8 animate-rise">
        <p className="mono-label text-[11px] uppercase text-leaf-600 mb-3">รู้จักโรคข้าวโพด</p>
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12">
          <div className="flex-1 min-w-0">
            <h1 className="text-[34px] sm:text-[46px] text-leaf-950 leading-[1.12]">คลังโรคข้าวโพด</h1>
            <p className="mt-3 text-[15.5px] text-leaf-700 max-w-xl leading-relaxed">
              รวมโรคที่เจอบ่อยในไร่ข้าวโพดไทย ดูวิธีแยกโรคที่หน้าตาคล้ายกัน ว่าเกิดจากอะไร และป้องกันได้ยังไง
            </p>
          </div>
          <dl className="flex divide-x divide-soil-200 rounded-3xl bg-white border border-soil-200 px-2 py-4 self-start">
            {[
              { k: 'โรคที่รวมไว้', v: diseases.length },
              { k: 'ที่ต้องระวังมาก', v: severeCount },
              { k: 'บันทึกไว้', v: favs.length },
            ].map((s) => (
              <div key={s.k} className="px-5 sm:px-7 text-center">
                <dd className="text-[28px] font-semibold text-leaf-900 tabular-nums leading-none">{s.v}</dd>
                <dt className="mt-1.5 text-[12px] text-leaf-600">{s.k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ---------- สลับระหว่างคลัง / ประเมินจากอาการ ---------- */}
      <div className="inline-flex rounded-2xl bg-soil-100 p-1 mb-7" role="tablist" aria-label="โหมด">
        {([
          { id: 'library' as const, label: 'คลังโรค', Icon: BookOpen },
          { id: 'advisor' as const, label: 'ประเมินจากอาการ (ไม่ต้องใช้รูป)', Icon: Stethoscope },
        ]).map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-[14.5px] font-medium transition focus-ring ${tab === t.id ? 'bg-white text-leaf-900 shadow-sm' : 'text-soil-600 hover:text-leaf-900'}`}>
            <t.Icon size={16} /> <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'advisor' ? (
        <SymptomAdvisor />
      ) : (
        <>
          <Callout tone="warn" title="โรคส่วนใหญ่ป้องกันง่ายกว่ารักษา">
            ลองเริ่มจากพันธุ์ต้านทาน การระบายน้ำ และการหมุนเวียนพืชก่อน ถ้าจำเป็นต้องใช้สาร อย่าลืมเช็ก % บนฉลาก และถามเจ้าหน้าที่เกษตรในพื้นที่ด้วยนะครับ
          </Callout>

          {/* ---------- ค้นหา + ตัวกรอง ---------- */}
          <div className="mt-7 space-y-4">
            <div className="flex gap-2.5">
              <label className="relative block flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="พิมพ์ชื่อโรคหรืออาการที่เห็น เช่น แผลยาว ผงสีขาว ตุ่มสนิม"
                  className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-11 pr-4 py-3.5 text-[15px] placeholder:text-leaf-400 focus-ring"
                />
              </label>
              <button type="button" onClick={surprise} className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-leaf-900 px-5 text-[14px] font-semibold text-white hover:bg-leaf-800 transition focus-ring" aria-label="สุ่มเปิดโรค">
                <Shuffle size={16} /> <span className="hidden sm:inline">สุ่มเปิดดู</span>
              </button>
            </div>

            <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-leaf-200">
              {[{ id: 'all' as const, label: 'ทั้งหมด', Icon: null, count: diseases.length }, ...KINDS.filter((k) => kindCount(k.id) > 0).map((k) => ({ id: k.id, label: k.label, Icon: k.Icon, count: kindCount(k.id) }))].map((t) => {
                const on = kind === t.id;
                return (
                  <button key={t.id} type="button" aria-pressed={on} onClick={() => setKind(t.id)}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 -mb-px border-b-2 text-[14px] font-semibold transition focus-ring ${on ? 'border-leaf-700 text-leaf-900' : 'border-transparent text-leaf-600 hover:text-leaf-900'}`}>
                    {t.Icon && <t.Icon size={16} />} {t.label}
                    <span className={`text-[12px] tabular-nums ${on ? 'text-leaf-600' : 'text-leaf-400'}`}>{t.count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13px]">
              <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-1.5">
                <span className="text-leaf-500">ความรุนแรง</span>
                <div className="flex max-w-full overflow-x-auto no-scrollbar rounded-xl bg-white ring-1 ring-leaf-200 p-0.5">
                  {(['all', 'critical', 'high', 'medium', 'low'] as const).map((l) => (
                    <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)}
                      className={`rounded-[10px] px-3 py-2 sm:py-1.5 font-semibold whitespace-nowrap shrink-0 transition focus-ring ${level === l ? 'bg-leaf-900 text-white' : 'text-leaf-700 hover:bg-leaf-50'}`}>
                      {l === 'all' ? 'ทั้งหมด' : LEVELS[l].label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" aria-pressed={favOnly} onClick={() => setFavOnly((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 sm:py-2 font-semibold ring-1 transition focus-ring ${favOnly ? 'bg-leaf-900 text-white ring-leaf-900' : 'bg-white text-leaf-700 ring-leaf-200'}`}>
                <Bookmark size={14} fill={favOnly ? 'currentColor' : 'none'} /> ที่บันทึกไว้
              </button>
              <button type="button" onClick={() => setSort(sort === 'danger' ? 'name' : 'danger')}
                className="rounded-xl bg-white px-3.5 py-2.5 sm:py-2 font-semibold text-leaf-700 ring-1 ring-leaf-200 focus-ring">
                เรียงตาม: {sort === 'danger' ? 'ความรุนแรง' : 'ชื่อ ก–ฮ'}
              </button>
              <div className="ml-auto flex rounded-xl bg-white ring-1 ring-leaf-200 p-0.5" role="group" aria-label="รูปแบบการแสดงผล">
                <button type="button" aria-label="แบบการ์ด" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={`grid place-items-center w-11 h-10 sm:w-9 sm:h-8 rounded-[10px] focus-ring ${view === 'grid' ? 'bg-leaf-900 text-white' : 'text-leaf-600'}`}><LayoutGrid size={15} /></button>
                <button type="button" aria-label="แบบรายการ" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`grid place-items-center w-11 h-10 sm:w-9 sm:h-8 rounded-[10px] focus-ring ${view === 'list' ? 'bg-leaf-900 text-white' : 'text-leaf-600'}`}><Rows3 size={15} /></button>
              </div>
            </div>
          </div>

          {/* ---------- รายการ ---------- */}
          <p className="mt-6 mb-3 text-[13px] text-leaf-600">แสดง {list.length} จาก {diseases.length} โรค</p>
          {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} label="ข้อมูลโรค" />
      ) : list.length === 0 ? (
            <EmptyState icon={<Search size={24} />} title="ยังไม่เจอที่ตรงกับที่ค้นหา" hint="ลองล้างตัวกรอง หรือพิมพ์ลักษณะแผลที่เห็น เช่น แผลยาว จุดกลม ตุ่มนูน ใบด่าง" />
          ) : view === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((d) => (
                <DiseaseCard key={d.id} d={d} reg={regNo.get(d.id) ?? ''} fav={favs.includes(d.id)} onFav={() => toggleFav(d.id)} onOpen={() => setOpenId(d.id)} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-soil-200 overflow-hidden divide-y divide-leaf-100">
              {list.map((d) => (
                <DiseaseRow key={d.id} d={d} reg={regNo.get(d.id) ?? ''} fav={favs.includes(d.id)} onFav={() => toggleFav(d.id)} onOpen={() => setOpenId(d.id)} />
              ))}
            </div>
          )}
        </>
      )}

      {opened && <DetailSheet d={opened} reg={regNo.get(opened.id) ?? ''} fav={favs.includes(opened.id)} onFav={() => toggleFav(opened.id)} onClose={() => setOpenId(null)} />}
    </SiteShell>
  );
}

type CardProps = { d: Disease; reg: string; fav: boolean; onFav: () => void; onOpen: () => void };

function FavButton({ fav, onFav, className = '' }: { fav: boolean; onFav: () => void; className?: string }) {
  return (
    <button type="button" onClick={onFav} aria-pressed={fav} aria-label={fav ? 'เลิกบันทึก' : 'บันทึกไว้'}
      className={`grid place-items-center w-9 h-9 rounded-full transition focus-ring ${fav ? 'bg-leaf-900 text-white' : 'bg-white text-leaf-500 hover:text-leaf-900'} ${className}`}>
      <Bookmark size={15} fill={fav ? 'currentColor' : 'none'} />
    </button>
  );
}

function DiseaseCard({ d, reg, fav, onFav, onOpen }: CardProps) {
  const level = normSeverity(d.severity);
  const k = kindMeta(d.kind);
  const img = toImages(d)[0];
  return (
    <article id={d.id} className="relative scroll-mt-24">
      <button type="button" onClick={onOpen} className="group w-full text-left rounded-3xl bg-white border border-soil-200 overflow-hidden transition hover:border-leaf-300 focus-ring">
        <div className="relative h-32 bg-leaf-50 overflow-hidden">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={d.nameTh ?? d.id} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <k.Icon size={84} strokeWidth={1} className="absolute -right-3 -bottom-4 text-leaf-300/70 rotate-[-12deg]" aria-hidden />
          )}
          <span className="absolute left-4 top-3.5 mono-label text-[11px] text-leaf-700/80">No.{reg}</span>
          <span className={`absolute left-0 bottom-0 h-1 w-full ${LEVELS[level].band}`} aria-hidden />
        </div>
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-leaf-600"><k.Icon size={14} /> {d.kind}</p>
          <h2 className="mt-1.5 text-[18px] font-bold text-leaf-950 leading-snug">{d.nameTh}</h2>
          <p className="text-[12.5px] text-leaf-500 italic truncate">{d.pathogen}</p>
          <p className="mt-3 text-[13.5px] text-leaf-700 leading-relaxed line-clamp-2">{d.summary}</p>
          <div className="mt-4 pt-3.5 border-t border-leaf-100 flex items-center justify-between">
            <Level level={level} />
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-leaf-700 group-hover:text-leaf-950">รายละเอียด <ArrowUpRight size={14} /></span>
          </div>
        </div>
      </button>
      <FavButton fav={fav} onFav={onFav} className="absolute top-3 right-3 z-10 shadow-sm ring-1 ring-soil-200" />
    </article>
  );
}

function DiseaseRow({ d, reg, fav, onFav, onOpen }: CardProps) {
  const level = normSeverity(d.severity);
  const k = kindMeta(d.kind);
  return (
    <div id={d.id} className="relative flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-leaf-50/60 transition scroll-mt-24">
      <button type="button" onClick={onOpen} className="flex-1 min-w-0 flex items-center gap-4 text-left focus-ring rounded-xl">
        <span className="mono-label text-[12px] text-leaf-400 w-6 shrink-0">{reg}</span>
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-100 text-leaf-700 shrink-0"><k.Icon size={19} /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-[15.5px] text-leaf-950 truncate">{d.nameTh}</span>
          <span className="block text-[12.5px] italic text-leaf-500 truncate">{d.pathogen}</span>
        </span>
        <span className="hidden md:block w-28 text-[13px] text-leaf-600">{d.kind}</span>
        <span className="hidden sm:block w-32"><Level level={level} /></span>
        <ArrowUpRight size={16} className="text-leaf-400 shrink-0" />
      </button>
      <FavButton fav={fav} onFav={onFav} className="ring-1 ring-leaf-100" />
    </div>
  );
}

function DetailSheet({ d, reg, fav, onFav, onClose }: { d: Disease; reg: string; fav: boolean; onFav: () => void; onClose: () => void }) {
  const level = normSeverity(d.severity);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end no-print" role="dialog" aria-modal="true" aria-label={d.nameTh}>
      <button type="button" aria-label="ปิด" className="absolute inset-0 bg-leaf-950/35" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full overflow-y-auto bg-white shadow-2xl animate-rise">
        <div className={`h-1.5 ${LEVELS[level].band}`} aria-hidden />
        <div className="px-6 sm:px-8 pt-6 pb-6 border-b border-leaf-100">
          <div className="flex items-start gap-3">
            <p className="mono-label text-[11px] uppercase text-leaf-500 flex-1 pt-2">No.{reg} · {d.kind}</p>
            <FavButton fav={fav} onFav={onFav} className="ring-1 ring-leaf-200" />
            <button type="button" onClick={onClose} aria-label="ปิด" className="grid place-items-center w-9 h-9 rounded-full bg-white text-leaf-800 ring-1 ring-leaf-200 focus-ring"><X size={17} /></button>
          </div>
          <h2 className="mt-2 text-[28px] sm:text-[32px] text-leaf-950 leading-tight">{d.nameTh}</h2>
          <p className="mt-1 text-[14px] text-leaf-600"><span className="italic">{d.pathogen}</span> · {d.nameEn}</p>
          <div className="mt-4"><Level level={level} /></div>
          <p className="mt-4 text-[15px] text-leaf-800 leading-relaxed">{d.summary}</p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <ImageGallery images={toImages(d)} alt={d.nameTh ?? d.id ?? ''} showPlaceholder />

          <Section icon={<Eye size={16} />} title="อาการที่มองเห็น"><BulletList items={d.symptoms ?? []} /></Section>

          {d.distinguish && <Callout tone="info" title="วิธีแยกจากโรคที่อาการคล้ายกัน">{d.distinguish}</Callout>}

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBox icon={<Thermometer size={15} />} title="สภาพแวดล้อมที่ทำให้เกิดโรค" text={d.conditions} />
            <InfoBox icon={<Sprout size={15} />} title="ระยะที่พบ" text={d.stage} />
          </div>

          {d.lossImpact && <Callout tone="warn" title="ความเสียหายต่อผลผลิต">{d.lossImpact}</Callout>}

          {d.resistantVarieties?.length ? (
            <Section icon={<Shield size={16} />} title="พันธุ์ต้านทานที่แนะนำ">
              <div className="flex flex-wrap gap-2">
                {d.resistantVarieties.map((v) => <span key={v} className="rounded-full bg-leaf-50 ring-1 ring-leaf-200 px-3 py-1 text-[13px] font-medium text-leaf-800">{v}</span>)}
              </div>
            </Section>
          ) : null}

          <Section icon={<Shield size={16} />} title="วิธีเขตกรรมและการป้องกัน"><BulletList items={d.cultural ?? []} marker="check" /></Section>

          <Section icon={<FlaskConical size={16} />} title="สารป้องกันกำจัดที่แนะนำ"><ChemicalTable rows={d.chemicals ?? []} /></Section>

          {d.warnings?.length ? <Callout tone="danger" title="ข้อควรระวัง"><BulletList items={d.warnings} marker="warn" /></Callout> : null}

          <SourceList sources={d.sources ?? []} />
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 pb-2 mb-3 border-b border-leaf-100 font-bold text-[15.5px] text-leaf-950">
        <span className="text-leaf-500">{icon}</span>
        {title}
      </h3>
      <div className="text-leaf-800">{children}</div>
    </section>
  );
}

function InfoBox({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-leaf-100 p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-leaf-500 mb-1.5">{icon} {title}</p>
      <p className="text-[14px] leading-relaxed text-leaf-900">{text}</p>
    </div>
  );
}

