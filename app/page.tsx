'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ScanLine, Bug, Leaf, FlaskConical, CalendarDays, ArrowRight, Sparkles,
  AlertTriangle, Info, TrendingUp, Stethoscope, BookOpen, Clock, ChevronRight,
  Sprout, Wheat, ShieldCheck, Search, SprayCan,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { Card } from '@/components/ui';
import { alertsForMonth, thaiMonths } from '@/lib/data/alerts';
import { deficiencies } from '@/lib/data/fertilizer';
import { economics } from '@/lib/data/calendar';

export default function HomePage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const alerts = useMemo(() => alertsForMonth(month), [month]);

  const topPrice = economics.prices.filter((p) => p.moisture === '14.5%');
  const priceRange = `${Math.min(...topPrice.map((p) => p.price)).toFixed(2)} – ${Math.max(...topPrice.map((p) => p.price)).toFixed(2)}`;

  return (
    <SiteShell>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden rounded-5xl bg-leaf-800 text-white px-6 py-10 sm:px-10 sm:py-14 animate-rise">
        <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-corn-400/25 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-24 w-80 h-80 rounded-full bg-leaf-400/25 blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold backdrop-blur">
            <Sparkles size={13} className="text-corn-300" />
            มหาวิทยาลัยแม่โจ้ · สำหรับเกษตรกรผู้ปลูกข้าวโพด
          </span>

          <h1 className="mt-4 text-[28px] sm:text-[38px] font-extrabold leading-tight">
            ถ่ายรูปใบข้าวโพด
            <br className="hidden sm:block" />
            รู้เลยว่าเป็นโรคอะไร ต้องทำยังไง
          </h1>
          <p className="mt-3.5 text-[15px] sm:text-[16px] text-leaf-100 leading-relaxed">
            ระบบ AI ช่วยวินิจฉัยโรคและแมลงศัตรูข้าวโพดจากภาพถ่าย พร้อมคำแนะนำการป้องกันกำจัด
            อัตราการใช้สาร สูตรปุ๋ย และปฏิทินดูแลแปลง อ้างอิงคำแนะนำกรมวิชาการเกษตร
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/detect"
              className="inline-flex items-center gap-2 rounded-2xl bg-corn-400 px-6 py-3.5 font-extrabold text-leaf-900 shadow-lg hover:bg-corn-300 transition focus-ring"
            >
              <ScanLine size={20} /> เริ่มสแกนวินิจฉัย
            </Link>
            <Link
              href="/diseases#advisor"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-6 py-3.5 font-bold text-white backdrop-blur hover:bg-white/25 transition focus-ring"
            >
              <Stethoscope size={19} /> ไม่มีรูป? วินิจฉัยจากอาการ
            </Link>
          </div>

        </div>
      </section>

      {/* ---------- เตือนภัยประจำเดือน ---------- */}
      {alerts.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-[20px] font-extrabold text-leaf-900 mb-1">
            <AlertTriangle size={21} className="text-corn-600" />
            เฝ้าระวังในเดือน{thaiMonths[month - 1]}
          </h2>
          <p className="text-[13.5px] text-leaf-600 mb-4">
            อ้างอิงช่วงระบาดที่ระบุในเอกสารกรมวิชาการเกษตร — ให้เดินสำรวจแปลงจริงประกอบด้วยทุกครั้ง
          </p>

          <div className="grid gap-3.5 md:grid-cols-2">
            {alerts.map((a) => {
              const tone = {
                danger: 'bg-rose-50 ring-rose-200 text-rose-900',
                warn: 'bg-corn-50 ring-corn-200 text-corn-900',
                info: 'bg-leaf-50 ring-leaf-200 text-leaf-900',
              }[a.tone];
              const iconTone = { danger: 'text-rose-600', warn: 'text-corn-600', info: 'text-leaf-600' }[a.tone];

              return (
                <Link
                  key={a.title}
                  href={a.href}
                  className={`group rounded-4xl ring-1 p-5 transition hover:-translate-y-0.5 focus-ring ${tone}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 mt-0.5 ${iconTone}`}>
                      {a.tone === 'info' ? <Info size={19} /> : <AlertTriangle size={19} />}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-[15.5px] mb-1 flex items-center gap-1.5">
                        {a.title}
                        <ChevronRight size={16} className="opacity-50 group-hover:translate-x-0.5 transition" />
                      </h3>
                      <p className="text-[13.5px] leading-relaxed opacity-90">{a.detail}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- เมนูหลัก ---------- */}
      <section className="mt-10">
        <h2 className="text-[20px] font-extrabold text-leaf-900 mb-4">เลือกสิ่งที่ต้องการ</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            href="/detect"
            icon={<ScanLine size={24} />}
            title="สแกนวินิจฉัยจากภาพ"
            desc="ถ่ายรูปใบ ลำต้น หรือฝักที่มีอาการ ให้ AI วิเคราะห์ว่าเป็นโรค แมลง หรือขาดธาตุอาหาร พร้อมตีกรอบจุดที่พบบนภาพ"
            primary
          />
          <FeatureCard
            href="/pests"
            icon={<Bug size={22} />}
            title="คลังแมลงศัตรูข้าวโพด"
            desc={`แมลงศัตรูที่พบในไทย พร้อมจุดสังเกต เกณฑ์ตัดสินใจพ่นสาร และอัตราใช้ตามกรมวิชาการเกษตร`}
          />
          <FeatureCard
            href="/diseases"
            icon={<Leaf size={22} />}
            title="คลังโรคข้าวโพด"
            desc={`โรคสำคัญ พร้อมวิธีแยกโรคที่อาการคล้ายกัน และระบบวินิจฉัยจากอาการโดยไม่ต้องใช้รูป`}
          />
          <FeatureCard
            href="/fertilizer"
            icon={<FlaskConical size={22} />}
            title="สูตรปุ๋ย & คำนวณอัตราใส่"
            desc="คำนวณปุ๋ยจากค่าวิเคราะห์ดินหรือชนิดดิน บอกเป็นกิโลกรัมต่อไร่ พร้อมคู่มือสังเกตอาการขาดธาตุอาหาร"
          />
          <FeatureCard
            href="/calendar"
            icon={<CalendarDays size={22} />}
            title="ปฏิทินดูแลไร่"
            desc="ทำอะไรวันไหน ตั้งแต่เตรียมดินถึงเก็บเกี่ยว ช่วงวิกฤตน้ำ วัชพืช และข้อมูลต้นทุน–ราคารับซื้อ"
          />
          <FeatureCard
            href="/weeds"
            icon={<Sprout size={22} />}
            title="คลังวัชพืชในไร่"
            desc={`วัชพืชที่พบจริงในแปลงข้าวโพดไทย พร้อมวิธีจำแนก ช่วงวิกฤตที่ต้องปลอดวัชพืช และสารกำจัดที่ได้ผล`}
          />
          <FeatureCard
            href="/varieties"
            icon={<Wheat size={22} />}
            title="พันธุ์ข้าวโพดแนะนำ"
            desc={`พันธุ์รับรอง พร้อมผลผลิต อายุเก็บเกี่ยว ความต้านทานโรค และตารางเลือกพันธุ์ให้ตรงกับปัญหาในไร่`}
          />
          <FeatureCard
            href="/biologicals"
            icon={<ShieldCheck size={22} />}
            title="ชีวภัณฑ์ & ศัตรูธรรมชาติ"
            desc={`ชีวภัณฑ์ควบคุมศัตรูพืชแบบปลอดภัยต่อคน ผึ้ง และแมลงดี พร้อมอัตราใช้ตามคำแนะนำทางราชการ`}
          />
          <FeatureCard
            href="/chemicals"
            icon={<SprayCan size={22} />}
            title="คลังสารป้องกันกำจัด"
            desc={`สารออกฤทธิ์ ค้นจากชื่อสารหรือชื่อศัตรูพืช พร้อมอัตราใช้ กลุ่มสลับสาร และสารที่กฎหมายห้ามใช้แล้ว`}
          />
          <FeatureCard
            href="/knowledge"
            icon={<Search size={22} />}
            title="ค้นหาข้ามทุกคลัง"
            desc="พิมพ์อาการที่เห็นครั้งเดียว ค้นได้ทั้งแมลง โรค วัชพืช พันธุ์ ชีวภัณฑ์ และสารป้องกันกำจัดพร้อมกัน"
          />
          <FeatureCard
            href="/history"
            icon={<Clock size={22} />}
            title="ประวัติการสแกน"
            desc="ดูผลตรวจย้อนหลังที่บันทึกไว้ในเครื่องนี้ เพื่อติดตามว่าอาการในแปลงดีขึ้นหรือแย่ลง"
          />
        </div>
      </section>

      {/* ---------- ราคา ---------- */}
      <section className="mt-10">
        <Card className="bg-leaf-800/95! ring-0 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-white/15 text-corn-300 shrink-0">
                <TrendingUp size={21} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-corn-300">ราคารับซื้อข้าวโพดเลี้ยงสัตว์</p>
                <p className="text-[13px] text-leaf-100">สำนักงานเศรษฐกิจการเกษตร · {economics.priceAsOf}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:ml-auto">
              <div className="rounded-2xl bg-white/12 px-4 py-2.5">
                <p className="text-[11.5px] text-leaf-100">ความชื้นไม่เกิน 14.5%</p>
                <p className="text-[17px] font-extrabold tabular-nums text-corn-300">{priceRange} บาท/กก.</p>
              </div>
              <div className="rounded-2xl bg-white/12 px-4 py-2.5">
                <p className="text-[11.5px] text-leaf-100">ต้นทุน (สศก. 2569)</p>
                <p className="text-[17px] font-extrabold tabular-nums">7.03 บาท/กก.</p>
              </div>
            </div>
          </div>

          <Link
            href="/calendar#"
            className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-corn-300 hover:text-corn-200 focus-ring rounded"
          >
            ดูราคาทุกจุดรับซื้อและข้อมูลต้นทุน <ArrowRight size={15} />
          </Link>
        </Card>
      </section>

      {/* ---------- ความรู้เพิ่มเติม ---------- */}
      <section className="mt-10">
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/help"
            className="group rounded-4xl card-glass p-6 transition hover:-translate-y-0.5 focus-ring"
          >
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-corn-100 text-corn-800 mb-3">
              <BookOpen size={21} />
            </span>
            <h3 className="font-extrabold text-[16.5px] text-leaf-900 mb-1.5 flex items-center gap-1.5">
              คู่มือการใช้งาน
              <ChevronRight size={16} className="text-leaf-400 group-hover:translate-x-0.5 transition" />
            </h3>
            <p className="text-[13.5px] text-leaf-700">
              วิธีถ่ายรูปให้ AI วิเคราะห์แม่น ข้อจำกัดของระบบ และควรเชื่อผลวิเคราะห์แค่ไหน
            </p>
          </Link>

          <div className="rounded-4xl bg-soil-50 ring-1 ring-soil-200 p-6">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-soil-200 text-soil-800 mb-3">
              <AlertTriangle size={21} />
            </span>
            <h3 className="font-extrabold text-[16.5px] text-soil-900 mb-1.5">ระบบนี้ไม่ได้แทนเจ้าหน้าที่เกษตร</h3>
            <p className="text-[13.5px] text-soil-800 leading-relaxed">
              AI ช่วยคัดกรองและให้ข้อมูลเบื้องต้นได้เร็ว แต่การตัดสินใจใช้สารเคมีควรยืนยันกับเจ้าหน้าที่ส่งเสริมการเกษตรในพื้นที่
              และอ่านฉลากผลิตภัณฑ์ทุกครั้ง เพราะเปอร์เซ็นต์สูตรในท้องตลาดอาจต่างจากที่ระบุในคำแนะนำ
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function FeatureCard({
  href, icon, title, desc, primary,
}: {
  href: string; icon: React.ReactNode; title: string; desc: string; primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-4xl p-6 transition hover:-translate-y-0.5 focus-ring ${
        primary ? 'md:col-span-2 bg-leaf-700 text-white shadow-lg' : 'card-glass'
      }`}
    >
      <span
        className={`grid place-items-center w-12 h-12 rounded-2xl mb-3.5 ${
          primary ? 'bg-corn-400 text-leaf-900' : 'bg-leaf-100 text-leaf-700'
        }`}
      >
        {icon}
      </span>
      <h3 className={`font-extrabold mb-1.5 flex items-center gap-1.5 ${primary ? 'text-[20px]' : 'text-[16.5px] text-leaf-900'}`}>
        {title}
        <ChevronRight size={17} className="opacity-50 group-hover:translate-x-0.5 transition" />
      </h3>
      <p className={`text-[13.5px] leading-relaxed ${primary ? 'text-leaf-100 max-w-lg' : 'text-leaf-700'}`}>{desc}</p>
    </Link>
  );
}
