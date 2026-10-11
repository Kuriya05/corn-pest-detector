'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight, ExternalLink, ShieldCheck, AlertTriangle, Search, Store, TrendingUp, Check, ShoppingBag,
  Droplets, Leaf, Wheat, Bug, SprayCan, HardHat, Gauge, Package, ShieldAlert, X, type LucideIcon,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { shopCategories, shopeeSearchUrl, trustChecklist, sellChannels, verifiedShops } from '@/lib/data/shop';

/** ไอคอนและสีประจำหมวด */
const CAT_STYLE: Record<string, { Icon: LucideIcon; tile: string; top: string }> = {
  fertilizer: { Icon: Droplets, tile: 'bg-blue-100 text-blue-700', top: 'bg-blue-50' },
  organic: { Icon: Leaf, tile: 'bg-emerald-100 text-emerald-700', top: 'bg-emerald-50' },
  seed: { Icon: Wheat, tile: 'bg-corn-200 text-corn-800', top: 'bg-corn-50' },
  bio: { Icon: ShieldCheck, tile: 'bg-teal-100 text-teal-700', top: 'bg-teal-50' },
  trap: { Icon: Bug, tile: 'bg-orange-100 text-orange-700', top: 'bg-orange-50' },
  sprayer: { Icon: SprayCan, tile: 'bg-sky-100 text-sky-700', top: 'bg-sky-50' },
  ppe: { Icon: HardHat, tile: 'bg-rose-100 text-rose-700', top: 'bg-rose-50' },
  meter: { Icon: Gauge, tile: 'bg-violet-100 text-violet-700', top: 'bg-violet-50' },
  storage: { Icon: Package, tile: 'bg-amber-100 text-amber-700', top: 'bg-amber-50' },
};

export default function ShopPage() {
  const [query, setQuery] = useState('');

  const cats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shopCategories;
    return shopCategories.filter((c) => [c.title, c.why, c.keyword, ...c.lookFor].join(' ').toLowerCase().includes(q));
  }, [query]);

  return (
    <SiteShell>
      {/* ---------- ส่วนหัว ---------- */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-corn-200 via-corn-100 to-leaf-100 px-6 py-9 sm:px-12 sm:py-12 animate-rise">
        <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-white/40" aria-hidden />
        <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13.5px] font-medium text-leaf-800">
              <ShoppingBag size={15} className="text-leaf-600" /> ซื้อ–ขาย
            </p>
            <h1 className="mt-4 text-[34px] sm:text-[48px] leading-[1.12] text-leaf-950">ซื้อของใช้ในไร่<br />และขายผลผลิตได้ที่นี่</h1>
            <p className="mt-3 text-[16px] text-soil-700 max-w-xl leading-relaxed">
              รวมทางลัดไปหาของใช้ในไร่บน Shopee พร้อมวิธีเช็กร้านก่อนซื้อ และช่องทางดูราคาตอนจะขายผลผลิต
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#buy" className="inline-flex items-center gap-2 rounded-full bg-leaf-700 px-6 py-3.5 font-medium text-white hover:bg-leaf-800 transition focus-ring"><Store size={18} /> อยากซื้อของ</a>
              <a href="#sell" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-medium text-leaf-900 hover:bg-white/80 transition focus-ring"><TrendingUp size={18} /> อยากขายผลผลิต</a>
            </div>
          </div>
          <ul className="grid gap-3" aria-label="ข้อควรรู้โดยย่อ">
            {[
              { i: ShoppingBag, t: 'ปุ่มทุกปุ่มพาไปหน้าค้นหาของ Shopee' },
              { i: ShieldCheck, t: 'ไม่ได้รับค่าคอมมิชชั่น ไม่รับรองร้านไหน' },
              { i: ShieldAlert, t: 'สารเคมีกำจัดศัตรูพืช ไม่มีลิงก์ขาย (วัตถุอันตราย)' },
            ].map((x) => (
              <li key={x.t} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-[14px] text-leaf-900">
                <x.i size={18} className="text-leaf-600 shrink-0" /> {x.t}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ---------- ซื้อ ---------- */}
      <section id="buy" className="mt-14 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-[28px] text-leaf-950">ซื้อของใช้ในไร่</h2>
            <p className="text-[14.5px] text-soil-600 mt-1">เลือกหมวดที่ต้องการ แล้วกด “ค้นบน Shopee” ได้เลย</p>
          </div>
          <label className="relative block sm:w-80">
            <span className="sr-only">ค้นหาหมวดสินค้า</span>
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-soil-400 pointer-events-none" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาหมวด เช่น ปุ๋ย ชุดป้องกัน"
              className="w-full rounded-full bg-white ring-1 ring-soil-300 pl-11 pr-10 py-3 text-[15px] placeholder:text-soil-400 focus-ring" />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="ล้างคำค้น" className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full text-soil-500 hover:bg-soil-100 focus-ring"><X size={15} /></button>
            )}
          </label>
        </div>

        {cats.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-soil-300 py-12 text-center text-soil-500">ยังไม่เจอหมวดที่ตรงกับที่ค้นหา ลองคำอื่นดูนะครับ</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c) => {
              const st = CAT_STYLE[c.id] ?? CAT_STYLE.storage;
              return (
                <article key={c.id} className="flex flex-col rounded-[1.75rem] bg-white border border-[#f1e7d3] shadow-[0_14px_32px_-22px_rgb(122_82_12_/_0.35)] p-2.5">
                  <div className={`flex items-center gap-4 rounded-3xl px-5 py-4 ${st.top}`}>
                    <span className={`grid place-items-center w-12 h-12 rounded-2xl shrink-0 ${st.tile}`}><st.Icon size={24} /></span>
                    <h3 className="text-[19px] text-leaf-950 leading-snug">{c.title}</h3>
                  </div>
                  <div className="flex-1 px-4 pt-4 pb-3">
                    <p className="text-[14.5px] text-soil-700 leading-relaxed">{c.why}</p>
                    <p className="mt-4 text-[13px] font-medium text-leaf-700">เช็กก่อนซื้อ</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {c.lookFor.map((t) => (
                        <li key={t} className="flex gap-2 text-[14px] text-soil-700 leading-snug">
                          <Check size={16} className="mt-0.5 shrink-0 text-leaf-600" /> {t}
                        </li>
                      ))}
                    </ul>
                    {c.caution && (
                      <p className="mt-3 flex gap-2 rounded-2xl bg-corn-50 px-3.5 py-2.5 text-[13px] text-corn-900"><AlertTriangle size={15} className="mt-0.5 shrink-0" /> {c.caution}</p>
                    )}
                  </div>
                  <a
                    href={shopeeSearchUrl(c.keyword)}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label={`ค้น ${c.title} บน Shopee (เปิดในแท็บใหม่)`}
                    className="m-1.5 inline-flex items-center justify-center gap-2 rounded-full bg-corn-400 px-5 py-3.5 font-medium text-leaf-950 hover:bg-corn-300 shadow-[0_8px_18px_-8px_rgb(245_174_11_/_0.8)] transition focus-ring"
                  >
                    ค้นบน Shopee <ExternalLink size={16} />
                  </a>
                </article>
              );
            })}
          </div>
        )}

        {verifiedShops.length > 0 && (
          <div className="mt-8">
            <h3 className="text-[19px] text-leaf-950 mb-3">ร้านที่ตรวจสอบแล้ว</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {verifiedShops.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-white border border-[#f1e7d3] p-4 hover:-translate-y-0.5 transition focus-ring">
                    <ShieldCheck size={22} className="text-leaf-600 shrink-0" />
                    <span className="min-w-0"><span className="block font-medium text-leaf-900">{s.name}</span>{s.note && <span className="block text-[13px] text-soil-500">{s.note}</span>}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------- วัตถุอันตราย ---------- */}
      <section className="mt-12">
        <div className="rounded-[2rem] border border-corn-200 bg-corn-50 p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-5">
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-corn-200 text-corn-800 shrink-0"><ShieldAlert size={26} /></span>
          <div className="flex-1">
            <h2 className="text-[21px] text-corn-900">สารกำจัดแมลง เชื้อรา และวัชพืช ซื้อออนไลน์ต้องระวังเป็นพิเศษ</h2>
            <p className="mt-1.5 text-[14.5px] text-corn-900/90 leading-relaxed max-w-3xl">
              สารกลุ่มนี้เป็นวัตถุอันตราย ควรซื้อจากร้านที่มีใบอนุญาต และให้เจ้าหน้าที่ช่วยแนะนำชนิดกับอัตราใช้ เราเลยไม่ได้ใส่ปุ่มค้นสารเคมีบน Shopee ไว้
              — ดูข้อมูลสารและสารที่ห้ามใช้แล้วได้ที่คลังสารป้องกันกำจัด
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/chemicals" className="inline-flex items-center gap-1.5 rounded-full bg-corn-900 px-5 py-3 text-[14.5px] font-medium text-white hover:bg-corn-800 focus-ring">คลังสารป้องกันกำจัด <ArrowUpRight size={15} /></Link>
            <Link href="/biologicals" className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-3 text-[14.5px] font-medium text-corn-900 hover:bg-corn-100 focus-ring">ทางเลือกชีวภัณฑ์ <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </section>

      {/* ---------- เช็กร้าน ---------- */}
      <section className="mt-14">
        <h2 className="text-[28px] text-leaf-950">เช็กร้านให้มั่นใจก่อนสั่ง</h2>
        <p className="text-[14.5px] text-soil-600 mt-1">5 ข้อนี้ช่วยกันของปลอมและร้านไม่น่าไว้ใจได้เยอะ</p>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {trustChecklist.map((c, i) => (
            <li key={c.t} className="flex gap-4 rounded-3xl bg-white border border-[#f1e7d3] p-5">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-leaf-100 text-leaf-800 font-display text-[17px] shrink-0">{i + 1}</span>
              <span>
                <span className="block font-medium text-[16.5px] text-leaf-950">{c.t}</span>
                <span className="block mt-0.5 text-[14px] text-soil-600 leading-relaxed">{c.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- ขาย ---------- */}
      <section id="sell" className="mt-14 scroll-mt-28">
        <div className="rounded-[2rem] bg-leaf-800 text-white p-6 sm:p-9">
          <h2 className="flex items-center gap-3 text-[28px]"><span className="grid place-items-center w-11 h-11 rounded-2xl bg-corn-400 text-leaf-950"><TrendingUp size={22} /></span> ขายผลผลิต</h2>
          <p className="mt-2 text-[15px] text-leaf-100">ดูราคาและติดต่อหน่วยงานที่ช่วยหาตลาดให้ได้</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {sellChannels.map((s) => {
              const body = (
                <>
                  <span className="flex items-center gap-1 text-[17px] font-medium">{s.name} <ArrowUpRight size={16} className="text-corn-300" /></span>
                  <span className="block mt-1 text-[14px] text-leaf-100 leading-relaxed">{s.desc}</span>
                </>
              );
              const cls = 'block rounded-3xl bg-white/10 hover:bg-white/15 p-5 transition focus-ring';
              return s.internal ? (
                <Link key={s.name} href={s.href} className={cls}>{body}</Link>
              ) : (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
              );
            })}
          </div>
          <ul className="mt-6 space-y-2 text-[14.5px] text-leaf-50">
            {['ลดความชื้นเมล็ดให้ไม่เกิน 14.5% ก่อนขาย จะได้ราคาเต็มและลดความเสี่ยงอะฟลาทอกซิน', 'เปรียบเทียบราคาอย่างน้อย 2–3 จุดรับซื้อ รวมค่าขนส่งก่อนตัดสินใจ', 'ขอใบชั่งน้ำหนักและบันทึกความชื้นทุกครั้งที่ขาย'].map((t) => (
              <li key={t} className="flex gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-corn-300" /> {t}</li>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
