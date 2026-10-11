'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ScanLine, Bug, Leaf, FlaskConical, CalendarDays, ArrowRight, ArrowUpRight,
  AlertTriangle, Info, TrendingUp, Stethoscope, BookOpen, Clock, Sprout, Wheat,
  ShieldCheck, Search, SprayCan, Check, Store, Sparkles, NotebookPen, MessageCircle, CloudSun, Calculator, type LucideIcon,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { TodayTip, FieldChecklist, RecentScans } from '@/components/home-widgets';
import { alertsForMonth, thaiMonths } from '@/lib/data/alerts';
import { economics } from '@/lib/data/calendar';

type Tool = { href: string; icon: LucideIcon; title: string; desc: string; tint: string };

const GROUPS: { title: string; desc: string; accent: string; items: Tool[] }[] = [
  {
    title: 'วินิจฉัยและป้องกัน',
    desc: 'รู้ว่าเป็นอะไร และจัดการให้ถูกวิธี',
    accent: 'bg-corn-100',
    items: [
      { href: '/diseases#advisor', icon: Stethoscope, title: 'ประเมินจากอาการ', desc: 'ไม่มีรูปก็ใช้ได้ เลือกอาการทีละขั้น', tint: 'bg-sky-100 text-sky-700' },
      { href: '/pests', icon: Bug, title: 'คลังแมลงศัตรู', desc: 'จุดสังเกต เกณฑ์พ่นสาร อัตราใช้', tint: 'bg-orange-100 text-orange-700' },
      { href: '/diseases', icon: Leaf, title: 'คลังโรคข้าวโพด', desc: 'แยกโรคที่อาการคล้ายกัน', tint: 'bg-amber-100 text-amber-700' },
      { href: '/biologicals', icon: ShieldCheck, title: 'ชีวภัณฑ์และศัตรูธรรมชาติ', desc: 'ทางเลือกปลอดภัยต่อคนและผึ้ง', tint: 'bg-teal-100 text-teal-700' },
      { href: '/chemicals', icon: SprayCan, title: 'คลังสารป้องกันกำจัด', desc: 'กลุ่มสลับสาร และสารที่ห้ามใช้', tint: 'bg-rose-100 text-rose-700' },
    ],
  },
  {
    title: 'ดูแลแปลงให้ได้ผลผลิต',
    desc: 'วางแผนตั้งแต่เตรียมดินถึงเก็บเกี่ยว',
    accent: 'bg-leaf-100',
    items: [
      { href: '/farm', icon: NotebookPen, title: 'สมุดไร่', desc: 'จดแปลง นับอายุ ดูงานของช่วงนี้', tint: 'bg-leaf-100 text-leaf-700' },
      { href: '/weather', icon: CloudSun, title: 'อากาศและเตือนโรค', desc: 'พยากรณ์ 7 วัน เสี่ยงโรค/แมลง', tint: 'bg-sky-100 text-sky-700' },
      { href: '/fertilizer', icon: FlaskConical, title: 'ปุ๋ยและเครื่องคำนวณ', desc: 'กิโลกรัมต่อไร่ ตามดินและระยะ', tint: 'bg-blue-100 text-blue-700' },
      { href: '/calendar', icon: CalendarDays, title: 'ปฏิทินดูแลไร่', desc: 'ทำอะไรวันไหน พร้อมต้นทุน', tint: 'bg-emerald-100 text-emerald-700' },
      { href: '/weeds', icon: Sprout, title: 'คลังวัชพืช', desc: 'ช่วงวิกฤตที่ต้องปลอดวัชพืช', tint: 'bg-lime-100 text-lime-700' },
      { href: '/varieties', icon: Wheat, title: 'พันธุ์ข้าวโพดแนะนำ', desc: 'ผลผลิต อายุ ความต้านทานโรค', tint: 'bg-violet-100 text-violet-700' },
    ],
  },
  {
    title: 'ซื้อ ขาย และค้นข้อมูล',
    desc: 'หาของใช้ในไร่ ขายผลผลิต และค้นเร็ว',
    accent: 'bg-sky-100',
    items: [
      { href: '/chat', icon: MessageCircle, title: 'ถามน้องข้าวโพด (AI)', desc: 'พิมพ์หรือพูดถามได้เลย', tint: 'bg-pink-100 text-pink-700' },
      { href: '/profit', icon: Calculator, title: 'คำนวณต้นทุน–กำไร', desc: 'คุ้มไหม จุดคุ้มทุนเท่าไร', tint: 'bg-violet-100 text-violet-700' },
      { href: '/shop', icon: Store, title: 'ซื้อ–ขาย', desc: 'ทางลัดไป Shopee และช่องทางขายผลผลิต', tint: 'bg-orange-100 text-orange-700' },
      { href: '/knowledge', icon: Search, title: 'ค้นหาข้ามทุกคลัง', desc: 'พิมพ์อาการครั้งเดียว ค้นทุกหมวด', tint: 'bg-indigo-100 text-indigo-700' },
      { href: '/history', icon: Clock, title: 'ประวัติการสแกน', desc: 'ติดตามอาการที่ผ่านมา', tint: 'bg-slate-100 text-slate-700' },
      { href: '/help', icon: BookOpen, title: 'คู่มือการใช้งาน', desc: 'ถ่ายรูปยังไงให้แม่น', tint: 'bg-pink-100 text-pink-700' },
    ],
  },
];

/** ภาพวาดฝักข้าวโพดสไตล์แบน — วาดด้วย SVG ไม่ต้องใช้ไฟล์ภาพ */
function CornIllustration() {
  return (
    <svg viewBox="0 0 260 340" className="w-full h-full" role="img" aria-label="ภาพวาดฝักข้าวโพด">
      <defs>
        <pattern id="kernels" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect x="2" y="2" width="18" height="18" rx="7" fill="#ffd43b" />
          <rect x="5" y="4" width="7" height="5" rx="2.5" fill="#ffe680" opacity=".9" />
        </pattern>
        <clipPath id="cob"><path d="M130 22 C 186 22 204 120 204 196 C 204 262 172 312 130 312 C 88 312 56 262 56 196 C 56 120 74 22 130 22 Z" /></clipPath>
      </defs>
      {/* กาบใบด้านหลัง */}
      <path d="M130 318 C 30 300 6 210 24 120 C 60 170 96 220 130 300 Z" fill="#6cc05a" />
      <path d="M130 318 C 230 300 254 210 236 120 C 200 170 164 220 130 300 Z" fill="#3aa648" />
      {/* ฝัก */}
      <g clipPath="url(#cob)">
        <rect x="40" y="10" width="180" height="320" fill="#fcc419" />
        <rect x="40" y="10" width="180" height="320" fill="url(#kernels)" />
        <path d="M130 10 C 130 90 130 250 130 330" stroke="#f5ae0b" strokeWidth="2" opacity=".35" fill="none" />
      </g>
      {/* กาบใบด้านหน้า */}
      <path d="M130 322 C 76 316 46 262 52 196 C 84 232 110 262 130 322 Z" fill="#98d583" />
      <path d="M130 322 C 184 316 214 262 208 196 C 176 232 150 262 130 322 Z" fill="#6cc05a" />
      {/* ไหม */}
      <g stroke="#f5ae0b" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M130 24 C 126 6 112 -2 100 -4" /><path d="M130 24 C 134 6 150 -2 162 -4" /><path d="M130 24 C 130 8 130 -2 130 -8" />
      </g>
    </svg>
  );
}

export default function HomePage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const alerts = useMemo(() => alertsForMonth(month), [month]);

  const topPrice = economics.prices.filter((p) => p.moisture === '14.5%');
  const priceRange = `${Math.min(...topPrice.map((p) => p.price)).toFixed(2)} – ${Math.max(...topPrice.map((p) => p.price)).toFixed(2)}`;

  return (
    <SiteShell>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-corn-200 via-corn-100 to-leaf-100 px-6 py-10 sm:px-12 sm:py-14 animate-rise">
        <div className="absolute -right-24 -bottom-28 w-96 h-96 rounded-full bg-white/40" aria-hidden />
        <div className="absolute right-40 -top-16 w-44 h-44 rounded-full bg-leaf-200/50" aria-hidden />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13.5px] font-medium text-leaf-800">
              <Sprout size={15} className="text-leaf-600" /> ผู้ช่วยดูแลไร่ข้าวโพดของคุณ · ม.แม่โจ้
            </p>
            <h1 className="mt-5 text-[40px] sm:text-[60px] leading-[1.1] text-leaf-950">
              ถ่ายรูปใบข้าวโพด
              <br />
              <span className="relative inline-block">
                แล้วรู้เลยว่าเป็นอะไร
                <span className="absolute left-0 right-0 bottom-1 h-3.5 -z-10 rounded-full bg-corn-300/70" aria-hidden />
              </span>
            </h1>
            <p className="mt-5 text-[17px] text-soil-700 max-w-xl leading-relaxed">
              ใบเป็นจุด ต้นเหลือง หรือเจอตัวหนอน? ถ่ายรูปส่งมาได้เลย เดี๋ยวช่วยดูให้ว่าเป็นอะไร
              แล้วต้องทำยังไงต่อ พร้อมข้อมูลอ้างอิงจากกรมวิชาการเกษตร
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/detect" className="inline-flex items-center gap-2.5 rounded-full bg-leaf-700 px-7 py-4 font-medium text-white shadow-[0_12px_24px_-10px_rgb(34_111_51_/_0.7)] hover:bg-leaf-800 transition focus-ring">
                <ScanLine size={19} /> เริ่มสแกนเลย
              </Link>
              <Link href="/diseases#advisor" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-medium text-leaf-900 hover:bg-white/80 transition focus-ring">
                <Stethoscope size={18} /> ไม่มีรูป? เล่าอาการแทนก็ได้
              </Link>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-soil-700">
              {['ใช้ฟรี ไม่ต้องสมัคร', 'รู้ผลในไม่กี่วินาที', 'มีข้อมูลอ้างอิงให้เช็ก'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5"><Check size={16} className="text-leaf-600" /> {t}</li>
              ))}
            </ul>
          </div>

          {/* ภาพวาด + การ์ดผลตัวอย่างลอย */}
          <div className="relative mx-auto w-full max-w-sm h-[320px] sm:h-[380px]" aria-hidden>
            <div className="absolute inset-x-10 inset-y-0"><CornIllustration /></div>
            <div className="absolute left-0 top-6 -rotate-3 rounded-2xl bg-white px-4 py-3 shadow-[0_16px_30px_-14px_rgb(122_82_12_/_0.5)]">
              <p className="text-[12px] text-soil-500">AI ตรวจเจอ</p>
              <p className="font-medium text-leaf-900 text-[15px]">หนอนกระทู้ลายจุด</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-soil-200 overflow-hidden"><div className="h-full w-[92%] rounded-full bg-leaf-500" /></div>
                <span className="text-[12px] font-medium text-leaf-700">92%</span>
              </div>
            </div>
            <div className="absolute right-0 bottom-10 rotate-2 rounded-2xl bg-white px-4 py-3 shadow-[0_16px_30px_-14px_rgb(122_82_12_/_0.5)]">
              <p className="flex items-center gap-1.5 text-[12px] text-leaf-600"><Sparkles size={13} /> แนะนำ</p>
              <p className="font-medium text-leaf-900 text-[15px]">สำรวจยอดอ่อนทุกเช้า</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- เครื่องมือประจำวัน ---------- */}
      <section className="mt-14">
        <h2 className="text-[26px] text-leaf-950 mb-5">ช่วยงานประจำวัน</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <TodayTip />
          <FieldChecklist />
          <RecentScans />
        </div>
      </section>

      {/* ---------- เตือนภัยประจำเดือน ---------- */}
      {alerts.length > 0 && (
        <section className="mt-14">
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h2 className="text-[26px] text-leaf-950">เฝ้าระวังเดือน{thaiMonths[month - 1]}</h2>
            <span className="text-[13px] text-soil-500 hidden sm:block">ช่วงที่มักระบาด ตามข้อมูลกรมวิชาการเกษตร</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {alerts.map((a) => {
              const tone = { danger: 'bg-rose-50 border-rose-100', warn: 'bg-corn-50 border-corn-200', info: 'bg-leaf-50 border-leaf-100' }[a.tone];
              const icon = { danger: 'bg-rose-100 text-rose-600', warn: 'bg-corn-200 text-corn-800', info: 'bg-leaf-200 text-leaf-800' }[a.tone];
              return (
                <Link key={a.title} href={a.href} className={`group flex gap-4 rounded-3xl border p-5 hover:-translate-y-0.5 transition focus-ring ${tone}`}>
                  <span className={`grid place-items-center w-11 h-11 rounded-2xl shrink-0 ${icon}`}>
                    {a.tone === 'info' ? <Info size={20} /> : <AlertTriangle size={20} />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 font-medium text-[17px] text-leaf-950">
                      {a.title}
                      <ArrowUpRight size={15} className="text-soil-400 group-hover:text-leaf-700 transition" />
                    </span>
                    <span className="block mt-1 text-[14px] leading-relaxed text-soil-700">{a.detail}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- คลังความรู้ ---------- */}
      <section className="mt-14">
        <div className="max-w-2xl mb-6">
          <h2 className="text-[28px] text-leaf-950">ความรู้และเครื่องมือสำหรับไร่ข้าวโพด</h2>
          <p className="mt-1.5 text-[15px] text-soil-600">เลือกตามสิ่งที่กำลังทำอยู่ในไร่ได้เลย</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.title} className="rounded-[1.75rem] bg-white border border-[#f1e7d3] shadow-[0_14px_32px_-22px_rgb(122_82_12_/_0.35)] p-2.5 flex flex-col">
              <div className={`rounded-3xl px-5 py-4 ${g.accent}`}>
                <h3 className="text-[20px] text-leaf-950">{g.title}</h3>
                <p className="text-[13.5px] text-soil-700">{g.desc}</p>
              </div>
              <ul className="flex-1 mt-1.5">
                {g.items.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} className="group flex items-center gap-3.5 rounded-2xl px-3.5 py-3 hover:bg-soil-50 transition focus-ring">
                      <span className={`grid place-items-center w-10 h-10 rounded-2xl shrink-0 ${t.tint}`}><t.icon size={19} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15.5px] font-medium text-leaf-950 leading-tight">{t.title}</span>
                        <span className="block text-[13px] text-soil-500 truncate">{t.desc}</span>
                      </span>
                      <ArrowRight size={16} className="text-soil-300 group-hover:text-leaf-700 group-hover:translate-x-0.5 transition shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- ราคา ---------- */}
      <section className="mt-14">
        <div className="rounded-[2rem] bg-leaf-800 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-corn-400 text-leaf-950 shrink-0"><TrendingUp size={22} /></span>
            <div className="min-w-0">
              <p className="font-display text-[19px]">ราคารับซื้อข้าวโพดเลี้ยงสัตว์</p>
              <p className="text-[13px] text-leaf-200">สำนักงานเศรษฐกิจการเกษตร · {economics.priceAsOf}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-8 sm:ml-auto">
            <div>
              <p className="text-[12.5px] text-leaf-200">ความชื้นไม่เกิน 14.5%</p>
              <p className="text-[24px] font-display tabular-nums text-corn-300">{priceRange} <span className="text-[13px] font-sans text-leaf-200">บาท/กก.</span></p>
            </div>
            <div>
              <p className="text-[12.5px] text-leaf-200">ต้นทุน (สศก. 2569)</p>
              <p className="text-[24px] font-display tabular-nums">7.03 <span className="text-[13px] font-sans text-leaf-200">บาท/กก.</span></p>
            </div>
          </div>
          <Link href="/calendar#" className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-5 py-2.5 text-[14px] font-medium hover:bg-white/20 transition focus-ring">
            ดูรายละเอียด <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ---------- ข้อควรรู้ ---------- */}
      <section className="mt-5 grid gap-5 md:grid-cols-2">
        <Link href="/help" className="group rounded-[1.75rem] bg-white border border-[#f1e7d3] p-6 hover:-translate-y-0.5 transition focus-ring">
          <span className="grid place-items-center w-11 h-11 rounded-2xl bg-pink-100 text-pink-700"><BookOpen size={20} /></span>
          <h3 className="mt-4 flex items-center gap-1 text-[19px] text-leaf-950">คู่มือการใช้งาน <ArrowUpRight size={15} className="text-soil-400 group-hover:text-leaf-700 transition" /></h3>
          <p className="mt-1 text-[14px] text-soil-600">ถ่ายรูปยังไงให้ AI ดูแม่น และควรเชื่อผลแค่ไหน</p>
        </Link>
        <div className="rounded-[1.75rem] bg-corn-50 border border-corn-200 p-6">
          <span className="grid place-items-center w-11 h-11 rounded-2xl bg-corn-200 text-corn-800"><AlertTriangle size={20} /></span>
          <h3 className="mt-4 text-[19px] text-leaf-950">AI ช่วยดูเบื้องต้น ไม่ใช่คำตัดสินสุดท้าย</h3>
          <p className="mt-1 text-[14px] text-soil-700 leading-relaxed">
            AI ช่วยดูให้เร็วขึ้นได้ แต่ก่อนใช้สารเคมี ลองถามเจ้าหน้าที่เกษตรในพื้นที่อีกที และอย่าลืมอ่านฉลากให้ครบนะครับ
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
