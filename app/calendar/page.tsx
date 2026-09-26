'use client';

import { useState } from 'react';
import { CalendarDays, Droplets, Sprout, Leaf, TrendingUp, AlertTriangle, CircleDot, Wheat, Coins } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Chip, Callout, BulletList, SourceList } from '@/components/ui';
import {
  seasons, growthStages, waterCritical, waterNeed, herbicides, sprayTips, economics, calendarSources,
} from '@/lib/data/calendar';

export default function CalendarPage() {
  const [openStage, setOpenStage] = useState<string | null>('planting');
  const [season, setSeason] = useState(seasons[0].id);
  const current = seasons.find((s) => s.id === season)!;

  const maxYield = Math.max(...economics.yieldSeries.map((y) => y.yield));

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Field Management"
        title="ปฏิทินและคู่มือดูแลไร่ข้าวโพด"
        description="ตั้งแต่เตรียมดินจนถึงเก็บเกี่ยว — ทำอะไร เมื่อไหร่ และช่วงไหนที่พลาดไม่ได้ อ้างอิงคำแนะนำกรมวิชาการเกษตร"
        icon={<CalendarDays size={26} strokeWidth={2.3} />}
      />

      {/* ---------- ฤดูปลูก ---------- */}
      <section className="mb-10">
        <h2 className="text-[22px] font-extrabold text-leaf-900 mb-3">เลือกฤดูปลูก</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
          {seasons.map((s) => (
            <Chip key={s.id} active={season === s.id} onClick={() => setSeason(s.id)}>{s.name}</Chip>
          ))}
        </div>

        <Card>
          <div className="grid gap-5 md:grid-cols-[auto_1fr] md:gap-8">
            <div className="flex md:flex-col gap-4 md:gap-3 md:border-r md:border-leaf-100 md:pr-8">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600">เดือนปลูก</p>
                <p className="text-[17px] font-extrabold text-leaf-900 whitespace-nowrap">{current.months}</p>
              </div>
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600">เก็บเกี่ยว</p>
                <p className="text-[17px] font-extrabold text-corn-700 whitespace-nowrap">{current.harvest}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[13px] font-extrabold text-leaf-800 mb-2">ข้อดี</p>
                <BulletList items={current.pros} marker="check" />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-corn-800 mb-2">ข้อควรระวัง</p>
                <BulletList items={current.cons} marker="warn" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ---------- ไทม์ไลน์ ---------- */}
      <section className="mb-10">
        <h2 className="text-[22px] font-extrabold text-leaf-900 mb-1.5">ไทม์ไลน์ตั้งแต่เตรียมดินถึงเก็บเกี่ยว</h2>
        <p className="text-[14px] text-leaf-700 mb-5">
          ข้าวโพดเลี้ยงสัตว์อายุสั้นประมาณ 100–120 วัน · แตะแต่ละระยะเพื่อดูว่าต้องทำอะไร
        </p>

        <ol className="relative space-y-3 before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-0.5 before:bg-leaf-200">
          {growthStages.map((s) => {
            const open = openStage === s.id;
            return (
              <li key={s.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenStage(open ? null : s.id)}
                  aria-expanded={open}
                  className="w-full text-left focus-ring rounded-3xl"
                >
                  <div className={`flex items-start gap-3.5 rounded-3xl p-4 transition ${
                    open ? 'bg-white ring-2 ring-leaf-300 shadow-sm' : 'bg-white/70 ring-1 ring-leaf-100 hover:bg-white'
                  }`}>
                    <span className={`relative z-10 grid place-items-center w-11 h-11 rounded-2xl shrink-0 ${
                      s.critical ? 'bg-corn-400 text-leaf-900' : 'bg-leaf-700 text-corn-300'
                    }`}>
                      {s.critical ? <AlertTriangle size={20} /> : <CircleDot size={20} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-[16.5px] font-extrabold text-leaf-900">{s.stage}</h3>
                        <span className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-[12px] font-bold text-leaf-700 whitespace-nowrap">
                          {s.days}
                        </span>
                        {s.critical && (
                          <span className="rounded-full bg-corn-100 px-2.5 py-0.5 text-[11.5px] font-extrabold text-corn-900">
                            ช่วงวิกฤต
                          </span>
                        )}
                      </div>
                      {open && (
                        <div className="mt-3 animate-rise">
                          <BulletList items={s.what} marker={s.critical ? 'warn' : 'check'} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------- น้ำ ---------- */}
      <section className="mb-10 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-[18px] font-extrabold text-leaf-900 mb-1.5">
            <Droplets size={20} className="text-leaf-600" /> ช่วงที่ขาดน้ำไม่ได้
          </h2>
          <p className="text-[13.5px] text-leaf-600 mb-4">ตัวเลขคือผลผลิตที่ลดลงถ้าขาดน้ำในระยะนั้น</p>
          <ul className="space-y-2.5">
            {waterCritical.map((w) => (
              <li
                key={w.stage}
                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 ${
                  w.highlight ? 'bg-rose-50 ring-1 ring-rose-200' : 'bg-leaf-50'
                }`}
              >
                <span className={`text-[14px] font-semibold ${w.highlight ? 'text-rose-900' : 'text-leaf-800'}`}>
                  {w.stage}
                </span>
                <span className={`text-[20px] font-extrabold tabular-nums shrink-0 ${w.highlight ? 'text-rose-700' : 'text-leaf-700'}`}>
                  −{w.loss}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-leaf-700 text-white px-4 py-3 text-[14px] font-semibold">
            สรุป: ข้าวโพดต้องการน้ำมากที่สุดช่วงออกดอกถึงเริ่มสร้างเมล็ด — ช่วงนี้ห้ามขาดน้ำเด็ดขาด
          </p>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-[18px] font-extrabold text-leaf-900 mb-4">
            <Sprout size={20} className="text-leaf-600" /> ปริมาณน้ำที่ต้องใช้
          </h2>
          <BulletList items={waterNeed} marker="check" />
        </Card>
      </section>

      {/* ---------- วัชพืช ---------- */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-[22px] font-extrabold text-leaf-900 mb-1.5">
          <Leaf size={22} className="text-leaf-600" /> การจัดการวัชพืช
        </h2>
        <p className="text-[14px] text-leaf-700 mb-4">
          ช่วงวิกฤตคือ <strong className="text-leaf-900">13–25 วันหลังงอก</strong> ถ้ามีวัชพืชรบกวนระยะนี้ ผลผลิตจะเสียหายสูงสุด
        </p>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] min-w-[680px]">
              <thead className="bg-leaf-50 text-leaf-900">
                <tr>
                  <th className="text-left font-extrabold px-4 py-3 rounded-l-2xl">สาร</th>
                  <th className="text-left font-extrabold px-4 py-3">สูตร</th>
                  <th className="text-left font-extrabold px-4 py-3">อัตราใช้</th>
                  <th className="text-left font-extrabold px-4 py-3 rounded-r-2xl">ช่วงเวลาพ่น</th>
                </tr>
              </thead>
              <tbody>
                {herbicides.map((h, i) => (
                  <tr key={i} className="border-b border-leaf-50 last:border-0 align-top">
                    <td className="px-4 py-3 font-bold text-leaf-900">
                      {h.name}
                      <span className="block font-normal text-[12px] text-leaf-500">{h.target}</span>
                    </td>
                    <td className="px-4 py-3 text-leaf-700 whitespace-nowrap">{h.formulation}</td>
                    <td className="px-4 py-3 font-bold text-leaf-800">{h.rate}</td>
                    <td className="px-4 py-3 text-leaf-700">
                      {h.timing}
                      {h.caution && <span className="block text-[12px] text-corn-700 font-semibold mt-1">⚠ {h.caution}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5">
            <p className="text-[13px] font-extrabold text-leaf-800 mb-2">พ่นสารอย่างไรให้ได้ผล</p>
            <BulletList items={sprayTips} marker="check" />
          </div>
        </Card>
      </section>

      {/* ---------- เศรษฐกิจ ---------- */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-[22px] font-extrabold text-leaf-900 mb-1.5">
          <Coins size={22} className="text-leaf-600" /> ต้นทุน ผลผลิต และราคา
        </h2>
        <p className="text-[14px] text-leaf-700 mb-4">ข้อมูล ณ {economics.asOf} — ราคาเปลี่ยนแปลงตลอด ควรเช็กกับจุดรับซื้อก่อนขายทุกครั้ง</p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Stat label="ต้นทุนการผลิต" value={economics.costPerRai.value} sub={economics.costPerRai.source} />
              <Stat label="ต้นทุนต่อกิโลกรัม" value={economics.costPerKg.value} sub={economics.costPerKg.source} />
            </div>
            <Callout tone="warn" title="ตัวเลขต้นทุนยังมีข้อโต้แย้ง">{economics.costDispute}</Callout>
          </Card>

          <Card>
            <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-leaf-900 mb-4">
              <TrendingUp size={18} className="text-leaf-600" /> ผลผลิตเฉลี่ยต่อไร่ของไทย
            </h3>
            <ul className="space-y-2">
              {economics.yieldSeries.map((y) => (
                <li key={y.year} className="flex items-center gap-3">
                  <span className="w-[68px] shrink-0 text-[12.5px] font-bold text-leaf-600 tabular-nums">{y.year}</span>
                  <span className="flex-1 h-7 rounded-lg bg-leaf-50 overflow-hidden">
                    <span
                      className="block h-full rounded-lg bg-leaf-600"
                      style={{ width: `${(y.yield / maxYield) * 100}%` }}
                    />
                  </span>
                  <span className="w-20 shrink-0 text-right text-[13.5px] font-extrabold tabular-nums text-leaf-900">
                    {y.yield} กก.
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-2xl bg-corn-50 ring-1 ring-corn-200 px-4 py-3 text-[13.5px] text-corn-900">
              {economics.yieldNote}
            </p>
          </Card>
        </div>

        <Card className="mt-4">
          <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-leaf-900 mb-1">
            <Wheat size={18} className="text-leaf-600" /> ราคารับซื้อ ณ จุดรับซื้อ
          </h3>
          <p className="text-[12.5px] text-leaf-600 mb-4">ข้อมูลสำนักงานเศรษฐกิจการเกษตร วันที่ {economics.priceAsOf}</p>

          <ul className="grid gap-2.5 sm:grid-cols-2">
            {economics.prices.map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-white ring-1 ring-leaf-100 px-4 py-3">
                <span className="min-w-0">
                  <span className="block font-bold text-[14px] text-leaf-900 truncate">{p.place}</span>
                  <span className="block text-[12.5px] text-leaf-600">
                    {p.province} · ความชื้น {p.moisture}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[19px] font-extrabold tabular-nums text-leaf-800">{p.price.toFixed(2)}</span>
                  <span className="block text-[11.5px] text-leaf-600">บาท/กก.</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[13px] text-leaf-700 bg-leaf-50 rounded-2xl px-4 py-3">{economics.priceNote}</p>
        </Card>
      </section>

      <SourceList sources={calendarSources} />
    </SiteShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl bg-leaf-50 px-4 py-4">
      <p className="text-[12px] font-black uppercase tracking-[0.1em] text-leaf-600 mb-1">{label}</p>
      <p className="text-[21px] font-extrabold text-leaf-900 tabular-nums leading-tight">{value}</p>
      <p className="mt-1.5 text-[11.5px] text-leaf-600 leading-snug">{sub}</p>
    </div>
  );
}
