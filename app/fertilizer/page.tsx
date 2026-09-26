'use client';

import { useEffect, useMemo, useState } from 'react';
import { FlaskConical, Calculator, Sprout, Droplets, AlertTriangle, Info, Layers, Scale } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Chip, Callout, BulletList, SourceList } from '@/components/ui';
import {
  soilTypePlans, omLevels, pLevels, kLevels, formulas, buildSoilTestPlan, kgFertilizer,
  deficiencies as seedDeficiencies, nutrientUptake, fertilizerNotes, fertilizerWarnings, fertilizerSources,
} from '@/lib/data/fertilizer';
import { useCollection } from '@/lib/use-collection';
import type { Deficiency } from '@/lib/data/fertilizer';

const nf = (n: number) => (Math.round(n * 10) / 10).toLocaleString('th-TH');

export default function FertilizerPage() {
  const { items: deficiencies } = useCollection<Deficiency>('deficiencies', seedDeficiencies);
  const [tab, setTab] = useState<'soil' | 'test' | 'convert'>('soil');

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    if (hash.startsWith('deficiency-')) {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, []);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Fertilizer & Nutrition"
        title="สูตรปุ๋ยและธาตุอาหารข้าวโพด"
        description="คำแนะนำการใส่ปุ๋ยข้าวโพดเลี้ยงสัตว์ตามกรมวิชาการเกษตร พร้อมเครื่องคำนวณปริมาณปุ๋ยต่อไร่ และคู่มือสังเกตอาการขาดธาตุอาหาร"
        icon={<FlaskConical size={26} strokeWidth={2.3} />}
      />

      <Callout tone="info" title="ทางลัดที่คุ้มที่สุด">
        ส่งดินไปวิเคราะห์ที่ศูนย์วิจัยและพัฒนาการเกษตรจังหวัด สถานีพัฒนาที่ดินจังหวัด หรือศูนย์จัดการดินปุ๋ยชุมชน (ศดปช.)
        แล้วใส่ปุ๋ยตามค่าวิเคราะห์ดิน จะคุ้มค่ากว่าการใส่ตามเนื้อดินอย่างเดียวมาก
      </Callout>

      <div className="mt-6 mb-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <Chip active={tab === 'soil'} onClick={() => setTab('soil')}>ใส่ตามชนิดดิน (ง่ายที่สุด)</Chip>
        <Chip active={tab === 'test'} onClick={() => setTab('test')}>ใส่ตามค่าวิเคราะห์ดิน (แม่นที่สุด)</Chip>
        <Chip active={tab === 'convert'} onClick={() => setTab('convert')}>แปลงสูตรปุ๋ย</Chip>
      </div>

      {tab === 'soil' && <SoilTypeTab />}
      {tab === 'test' && <SoilTestTab />}
      {tab === 'convert' && <ConvertTab />}

      <section className="mt-12">
        <h2 className="text-[22px] font-extrabold text-leaf-900 mb-1.5">สังเกตอาการขาดธาตุอาหาร ({deficiencies.length} ธาตุ)</h2>
        <p className="text-[14px] text-leaf-700 mb-5">
          อาการขาดธาตุหลายอย่างหน้าตาคล้ายโรค ดูจุดสังเกตด้านล่างเพื่อแยกให้ออกก่อนตัดสินใจซื้อสารเคมี
        </p>
        <div className="grid gap-3.5 md:grid-cols-2">
          {deficiencies.map((d) => (
            <article key={d.id} id={`deficiency-${d.id}`} className="scroll-mt-24">
              <Card className="h-full">
                <div className="flex items-start gap-3.5">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-leaf-700 text-corn-300 font-extrabold text-[15px] shrink-0">
                    {d.symbol}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-extrabold text-leaf-900">ขาด{d.nutrient}</h3>
                    <p className="mt-1 text-[13.5px] font-semibold text-corn-800 bg-corn-50 rounded-xl px-3 py-1.5 inline-block">
                      {d.quickSign}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3.5">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-1.5">อาการที่พบ</p>
                    <BulletList items={d.symptoms} />
                  </div>
                  <div className="rounded-2xl bg-leaf-50 px-4 py-3">
                    <p className="text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-1">มักเกิดจาก</p>
                    <p className="text-[13.5px] text-leaf-800">{d.cause}</p>
                  </div>
                  <div className="rounded-2xl bg-leaf-700 text-white px-4 py-3">
                    <p className="text-[12px] font-black uppercase tracking-[0.12em] text-corn-300 mb-1">วิธีแก้</p>
                    <p className="text-[13.5px]">{d.fix}</p>
                  </div>
                </div>
              </Card>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[22px] font-extrabold text-leaf-900 mb-1.5">ข้าวโพดดึงธาตุอาหารไปเท่าไร</h2>
        <p className="text-[14px] text-leaf-700 mb-4">
          ตัวเลขต่อผลผลิต 1 ตัน — ใช้ประเมินว่าต้องคืนธาตุอาหารกลับสู่ดินเท่าไรในฤดูถัดไป
        </p>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead className="text-leaf-900">
                <tr className="border-b border-leaf-100">
                  <th className="text-left font-extrabold py-2.5 pr-4">ธาตุอาหาร</th>
                  <th className="text-right font-extrabold py-2.5 px-3 whitespace-nowrap">ดูดใช้ทั้งต้น</th>
                  <th className="text-right font-extrabold py-2.5 px-3 whitespace-nowrap">สูญไปกับเมล็ด+ซัง</th>
                  <th className="text-left font-extrabold py-2.5 pl-3">เทียบเท่าปุ๋ย</th>
                </tr>
              </thead>
              <tbody>
                {nutrientUptake.map((n) => (
                  <tr key={n.nutrient} className="border-b border-leaf-50 last:border-0">
                    <td className="py-3 pr-4 font-bold text-leaf-900">{n.nutrient}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-leaf-700">{n.uptake} กก.</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-leaf-800">{n.removed} กก.</td>
                    <td className="py-3 pl-3 text-[13px] text-leaf-600">{n.equivalent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13.5px] text-leaf-700 bg-leaf-50 rounded-2xl px-4 py-3">
            <strong>อ่านอย่างไร:</strong> ถ้าเก็บเฉพาะเมล็ดและซังออกจากแปลง แล้วไถกลบต้นกับใบไว้
            โพแทสเซียมที่สูญเสียจริงจะเหลือเพียง 5.5 กก./ตัน แทนที่จะเป็น 17 กก./ตัน — การไถกลบเศษซากจึงช่วยประหยัดค่าปุ๋ยได้มาก
          </p>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-3">
            <Info size={18} className="text-leaf-600" /> หลักสำคัญที่ต้องรู้
          </h2>
          <BulletList items={fertilizerNotes} marker="check" />
        </Card>
        <div className="space-y-4">
          <Callout tone="danger" title="ข้อควรระวัง">
            <BulletList items={fertilizerWarnings} marker="warn" />
          </Callout>
          <SourceList sources={fertilizerSources} />
        </div>
      </section>
    </SiteShell>
  );
}

/* ---------------- แท็บ 1: ตามชนิดดิน ---------------- */
function SoilTypeTab() {
  const [rai, setRai] = useState('1');
  const area = Math.max(Number(rai) || 0, 0);

  return (
    <div className="space-y-5">
      <Card>
        <label className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-[15px] text-leaf-900">พื้นที่ปลูกของคุณ</span>
          <input
            type="number" min={0} step={0.5} inputMode="decimal"
            value={rai} onChange={(e) => setRai(e.target.value)}
            className="w-32 rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-2.5 text-[16px] font-bold tabular-nums focus-ring"
          />
          <span className="font-bold text-[15px] text-leaf-700">ไร่</span>
          <span className="text-[13px] text-leaf-500">— ระบบจะคูณปริมาณปุ๋ยให้อัตโนมัติ</span>
        </label>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {soilTypePlans.map((p) => (
          <Card key={p.id} className="flex flex-col">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="grid place-items-center w-10 h-10 rounded-2xl bg-soil-200 text-soil-800 shrink-0">
                <Layers size={19} />
              </span>
              <h2 className="text-[17px] font-extrabold text-leaf-900">{p.soil}</h2>
            </div>
            <p className="text-[13px] text-leaf-600 mb-4">{p.hint}</p>

            <div className="space-y-2.5 flex-1">
              <Step n={1} label="รองพื้น พร้อมปลูก" text={p.base} area={area} />
              <Step n={2} label="แต่งหน้าครั้งที่ 1" text={p.topdress1} area={area} />
              {p.topdress2 && <Step n={3} label="แต่งหน้าครั้งที่ 2" text={p.topdress2} area={area} />}
            </div>

            {p.extra && (
              <p className="mt-3 rounded-2xl bg-corn-50 ring-1 ring-corn-200 px-4 py-2.5 text-[13px] font-semibold text-corn-900">
                {p.extra}
                {area > 0 && area !== 1 && <span className="block mt-1 text-corn-700">รวม {area} ไร่ = {nf(500 * area)}–{nf(1000 * area)} กก.</span>}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Step({ n, label, text, area }: { n: number; label: string; text: string; area: number }) {
  // ดึงตัวเลข "กก./ไร่" ออกมาคูณกับพื้นที่
  const scaled = area > 0 && area !== 1
    ? text.replace(/(\d+(?:\.\d+)?)\s*กก\.\/ไร่/g, (_m, v) => `${nf(Number(v) * area)} กก. (รวม ${area} ไร่)`)
    : text;

  return (
    <div className="rounded-2xl bg-leaf-50 px-4 py-3">
      <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.1em] text-leaf-600 mb-1">
        <span className="grid place-items-center w-5 h-5 rounded-md bg-leaf-700 text-white text-[11px]">{n}</span>
        {label}
      </p>
      <p className="text-[14px] font-semibold text-leaf-900 leading-relaxed">{scaled}</p>
    </div>
  );
}

/* ---------------- แท็บ 2: ตามค่าวิเคราะห์ดิน ---------------- */
function SoilTestTab() {
  const [om, setOm] = useState('1.2');
  const [p, setP] = useState('12');
  const [k, setK] = useState('70');
  const [rai, setRai] = useState('1');
  const [irrigated, setIrrigated] = useState(false);

  const area = Math.max(Number(rai) || 0, 1);
  const plan = useMemo(
    () => buildSoilTestPlan(Number(om) || 0, Number(p) || 0, Number(k) || 0, irrigated ? 1.5 : 1),
    [om, p, k, irrigated],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start">
      <Card>
        <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-4">
          <Calculator size={19} className="text-leaf-600" /> กรอกค่าจากใบวิเคราะห์ดิน
        </h2>

        <div className="space-y-4">
          <Field
            label="อินทรียวัตถุ (OM)" unit="%" value={om} setValue={setOm} step={0.1}
            levels={omLevels.map((l) => l.label)}
            active={omLevels.findIndex((l) => l.test(Number(om) || 0))}
          />
          <Field
            label="ฟอสฟอรัสที่เป็นประโยชน์" unit="มก./กก." value={p} setValue={setP} step={1}
            levels={pLevels.map((l) => l.label)}
            active={pLevels.findIndex((l) => l.test(Number(p) || 0))}
          />
          <Field
            label="โพแทสเซียมที่แลกเปลี่ยนได้" unit="มก./กก." value={k} setValue={setK} step={1}
            levels={kLevels.map((l) => l.label)}
            active={kLevels.findIndex((l) => l.test(Number(k) || 0))}
          />

          <label className="flex items-center gap-3">
            <span className="font-bold text-[15px] text-leaf-900">พื้นที่</span>
            <input
              type="number" min={0.5} step={0.5} inputMode="decimal"
              value={rai} onChange={(e) => setRai(e.target.value)}
              className="w-28 rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-2.5 text-[16px] font-bold tabular-nums focus-ring"
            />
            <span className="font-bold text-[15px] text-leaf-700">ไร่</span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl bg-corn-50 ring-1 ring-corn-200 px-4 py-3 cursor-pointer">
            <input
              type="checkbox" checked={irrigated} onChange={(e) => setIrrigated(e.target.checked)}
              className="mt-1 w-5 h-5 accent-leaf-700"
            />
            <span className="text-[13.5px] text-corn-900">
              <strong className="block">ปลูกปลายฤดูฝน หรือมีการให้น้ำ</strong>
              กรมวิชาการเกษตรแนะนำให้เพิ่มปุ๋ยไนโตรเจนขึ้น 1.5 เท่าในกรณีนี้
            </span>
          </label>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="bg-leaf-700/95! ring-0 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-corn-300 mb-2">ธาตุอาหารที่ต้องใส่</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: 'ไนโตรเจน (N)', v: plan.target.n },
              { l: 'ฟอสฟอรัส (P₂O₅)', v: plan.target.p },
              { l: 'โพแทสเซียม (K₂O)', v: plan.target.k },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl bg-white/12 px-3 py-3 text-center">
                <p className="text-[24px] font-extrabold tabular-nums leading-none">{nf(x.v)}</p>
                <p className="text-[11px] text-leaf-100 mt-1">กก./ไร่</p>
                <p className="text-[12px] font-bold mt-1.5">{x.l}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-leaf-900 mb-3">
            <Sprout size={18} className="text-leaf-600" /> ครั้งที่ 1 — รองพื้นพร้อมปลูก
          </h3>
          <PlanRows rows={plan.base} area={area} />
          <p className="mt-2.5 text-[12.5px] text-leaf-600">ผสมให้เข้ากันแล้วใส่รองพื้นให้หมดในครั้งเดียว</p>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-leaf-900 mb-3">
            <Droplets size={18} className="text-leaf-600" /> ครั้งที่ 2 — แต่งหน้า อายุ 25–30 วัน
          </h3>
          {plan.topdress.length ? (
            <>
              <PlanRows rows={plan.topdress} area={area} />
              <p className="mt-2.5 text-[12.5px] text-leaf-600">โรยข้างแถวแล้วพรวนกลบ ใส่ขณะดินมีความชื้น</p>
            </>
          ) : (
            <p className="text-[14px] text-leaf-700">ไม่ต้องใส่เพิ่ม — ไนโตรเจนจากปุ๋ยรองพื้นเพียงพอแล้ว</p>
          )}
        </Card>

        <Callout tone="warn" title="อ่านก่อนใช้ตัวเลขนี้">
          <BulletList
            items={[
              'อัตรานี้อ้างอิงตารางคำแนะนำของกรมวิชาการเกษตร ตั้งบนผลผลิตคาดหวัง 1,000 กก./ไร่',
              'ถ้าดิน pH ต่ำกว่า 5.5 ให้ใส่โดโลไมต์หรือหินปูนบด 100 กก./ไร่ ก่อน',
              'ถ้าดิน pH สูงกว่า 7.3 ให้เปลี่ยนจากยูเรีย 46-0-0 เป็น 21-0-0 โดยเพิ่มปริมาณเป็น 2 เท่า',
              'ถ้าอินทรียวัตถุต่ำกว่า 1% ให้ใส่ปุ๋ยอินทรีย์ 500–1,000 กก./ไร่ ร่วมด้วย',
            ]}
            marker="warn"
          />
        </Callout>
      </div>
    </div>
  );
}

function PlanRows({ rows, area }: { rows: { code: string; kg: number }[]; area: number }) {
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.code} className="flex items-center justify-between gap-3 rounded-2xl bg-leaf-50 px-4 py-3">
          <span className="font-extrabold text-[15px] text-leaf-900">ปุ๋ย {r.code}</span>
          <span className="text-right">
            <span className="block text-[17px] font-extrabold tabular-nums text-leaf-900">{nf(r.kg)} กก./ไร่</span>
            {area !== 1 && <span className="block text-[12.5px] text-leaf-600">รวม {area} ไร่ = {nf(r.kg * area)} กก.</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Field({
  label, unit, value, setValue, step, levels, active,
}: {
  label: string; unit: string; value: string; setValue: (v: string) => void;
  step: number; levels: string[]; active: number;
}) {
  return (
    <div>
      <label className="flex items-center justify-between gap-3 mb-2">
        <span className="font-bold text-[14.5px] text-leaf-900">{label}</span>
        <span className="flex items-center gap-2">
          <input
            type="number" min={0} step={step} inputMode="decimal"
            value={value} onChange={(e) => setValue(e.target.value)}
            className="w-24 rounded-xl bg-white ring-1 ring-leaf-200 px-3 py-2 text-[15px] font-bold tabular-nums text-right focus-ring"
          />
          <span className="text-[13px] text-leaf-600 w-16">{unit}</span>
        </span>
      </label>
      <div className="flex gap-1.5">
        {levels.map((l, i) => (
          <span
            key={l}
            className={`flex-1 rounded-lg px-2 py-1.5 text-center text-[11.5px] font-bold transition ${
              i === active ? 'bg-leaf-700 text-white' : 'bg-leaf-50 text-leaf-500'
            }`}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- แท็บ 3: แปลงสูตรปุ๋ย ---------------- */
function ConvertTab() {
  const [nutrient, setNutrient] = useState<'n' | 'p' | 'k'>('n');
  const [amount, setAmount] = useState('20');
  const need = Math.max(Number(amount) || 0, 0);

  const label = { n: 'ไนโตรเจน (N)', p: 'ฟอสฟอรัส (P₂O₅)', k: 'โพแทสเซียม (K₂O)' }[nutrient];
  const usable = formulas.filter((f) => f[nutrient] > 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start">
      <Card>
        <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-4">
          <Scale size={19} className="text-leaf-600" /> อยากได้ธาตุอาหารเท่านี้ ต้องใช้ปุ๋ยกี่กิโล
        </h2>

        <div className="flex gap-2 mb-4">
          {(['n', 'p', 'k'] as const).map((x) => (
            <Chip key={x} active={nutrient === x} onClick={() => setNutrient(x)}>
              {{ n: 'N', p: 'P₂O₅', k: 'K₂O' }[x]}
            </Chip>
          ))}
        </div>

        <label className="flex items-center gap-3">
          <span className="font-bold text-[15px] text-leaf-900">ต้องการ {label}</span>
          <input
            type="number" min={0} step={0.5} inputMode="decimal"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-28 rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-2.5 text-[16px] font-bold tabular-nums focus-ring"
          />
          <span className="font-bold text-[15px] text-leaf-700">กก./ไร่</span>
        </label>

        <div className="mt-5 rounded-3xl bg-leaf-50 px-4 py-4">
          <p className="text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-2">สูตรคำนวณ</p>
          <p className="text-[14.5px] font-bold text-leaf-900 leading-relaxed">
            น้ำหนักปุ๋ย = ปริมาณธาตุอาหารที่ต้องการ × 100 ÷ เปอร์เซ็นต์ธาตุนั้นในปุ๋ย
          </p>
          <p className="mt-2 text-[13.5px] text-leaf-700">
            ตัวอย่าง: ต้องการ N 20 กก./ไร่ จากยูเรีย 46-0-0 → 20 × 100 ÷ 46 = 43.5 กก./ไร่
          </p>
        </div>
      </Card>

      <Card>
        <p className="text-[12px] font-black uppercase tracking-[0.12em] text-leaf-600 mb-3">
          ปริมาณปุ๋ยที่ต้องใช้เพื่อให้ได้ {label} {nf(need)} กก./ไร่
        </p>
        <ul className="space-y-2">
          {usable.map((f) => (
            <li key={f.code} className="flex items-center justify-between gap-3 rounded-2xl bg-white ring-1 ring-leaf-100 px-4 py-3">
              <span className="min-w-0">
                <span className="block font-extrabold text-[15px] text-leaf-900">{f.code}</span>
                <span className="block text-[12.5px] text-leaf-600 truncate">{f.name}</span>
              </span>
              <span className="text-right shrink-0">
                <span className="block text-[18px] font-extrabold tabular-nums text-leaf-900">
                  {nf(kgFertilizer(need, f[nutrient]))}
                </span>
                <span className="block text-[12px] text-leaf-600">กก./ไร่</span>
              </span>
            </li>
          ))}
        </ul>

        <Callout tone="warn" title="อย่าลืมดูธาตุตัวอื่นด้วย">
          ปุ๋ยเชิงประกอบให้ธาตุมากกว่า 1 ตัวพร้อมกัน เช่น ถ้าใช้ 18-46-0 เพื่อเอาฟอสฟอรัส จะได้ไนโตรเจนติดมาด้วย
          ต้องหักออกจากปริมาณไนโตรเจนที่ต้องใส่เพิ่ม — แท็บ &ldquo;ใส่ตามค่าวิเคราะห์ดิน&rdquo; คำนวณส่วนนี้ให้แล้ว
        </Callout>
      </Card>
    </div>
  );
}

export { AlertTriangle };
