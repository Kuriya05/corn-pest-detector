'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calculator, TrendingUp, TrendingDown, Save, Trash2, Info, NotebookPen, RotateCcw } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { economics } from '@/lib/data/calendar';
import { useFarm } from '@/lib/farm';

/* ต้นทุนเฉลี่ย สศก. ปี 2569 = 5,662 บาท/ไร่ (ผลผลิตเฉลี่ยประเทศ ~719–805 กก./ไร่)
   การแบ่งตามหมวดด้านล่างเป็น "ค่าประมาณตั้งต้น" ให้ผู้ใช้แก้เป็นตัวเลขจริงของตัวเอง */
const DEFAULT_COSTS = [
  { id: 'seed', label: 'เมล็ดพันธุ์', value: 700 },
  { id: 'fert', label: 'ปุ๋ย', value: 1700 },
  { id: 'chem', label: 'สารป้องกันกำจัดศัตรูพืช/วัชพืช', value: 500 },
  { id: 'labor', label: 'ค่าแรง (ปลูก ดูแล)', value: 900 },
  { id: 'machine', label: 'เครื่องจักร น้ำมัน ไถเตรียมดิน', value: 900 },
  { id: 'rent', label: 'ค่าเช่าที่ดิน/ดอกเบี้ย', value: 600 },
  { id: 'harvest', label: 'เก็บเกี่ยว ขนส่ง ตาก', value: 362 },
];

const SAVE_KEY = 'maize_profit_scenarios_v1';
type Scenario = { id: string; name: string; at: string; area: number; costPerRai: number; yieldKg: number; price: number; profit: number };

const baht = (n: number, d = 0) => n.toLocaleString('th-TH', { maximumFractionDigits: d, minimumFractionDigits: d });
const num = (s: string) => { const n = Number(s); return Number.isFinite(n) && n >= 0 ? n : 0; };

export default function ProfitPage() {
  const farm = useFarm();
  const [area, setArea] = useState('10');
  const [costs, setCosts] = useState<Record<string, string>>(Object.fromEntries(DEFAULT_COSTS.map((c) => [c.id, String(c.value)])));
  const [yieldKg, setYieldKg] = useState('719');
  const [price, setPrice] = useState('9.00');
  const [plotId, setPlotId] = useState('');
  const [useLogged, setUseLogged] = useState(false);
  const [saved, setSaved] = useState<Scenario[]>([]);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaved(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
    } catch { /* ไม่มีที่เก็บ */ }
  }, []);

  const plot = farm.plots.find((p) => p.id === plotId);
  const loggedCost = useMemo(() => (plot ? farm.logs.filter((l) => l.plotId === plot.id).reduce((s, l) => s + (l.cost ?? 0), 0) : 0), [farm.logs, plot]);
  const loggedIncome = useMemo(() => (plot ? farm.logs.filter((l) => l.plotId === plot.id).reduce((s, l) => s + (l.income ?? 0), 0) : 0), [farm.logs, plot]);

  const a = num(area);
  const sumItems = DEFAULT_COSTS.reduce((s, c) => s + num(costs[c.id]), 0);
  const costPerRai = useLogged && plot && plot.areaRai > 0 ? loggedCost / plot.areaRai : sumItems;
  const y = num(yieldKg);
  const p = num(price);

  const r = useMemo(() => {
    const totalCost = costPerRai * a;
    const revenue = y * p * a;
    const profit = revenue - totalCost;
    return {
      totalCost, revenue, profit,
      profitPerRai: a ? profit / a : 0,
      costPerKg: y ? costPerRai / y : 0,
      breakEvenPrice: y ? costPerRai / y : 0,
      breakEvenYield: p ? costPerRai / p : 0,
      margin: revenue ? (profit / revenue) * 100 : 0,
    };
  }, [a, costPerRai, y, p]);

  const refPrices = economics.prices.filter((x) => x.moisture === '14.5%');
  const sensPrices = [p - 1, p - 0.5, p, p + 0.5, p + 1].map((v) => Math.max(+v.toFixed(2), 0));
  const sensYields = [y - 150, y - 75, y, y + 75, y + 150].map((v) => Math.max(Math.round(v), 0));

  const persist = (list: Scenario[]) => { setSaved(list); try { localStorage.setItem(SAVE_KEY, JSON.stringify(list)); } catch { /* ข้าม */ } };
  const saveScenario = () => {
    const s: Scenario = { id: String(Date.now()), name: `${a} ไร่ · ${baht(y)} กก. · ${p} บาท`, at: new Date().toISOString(), area: a, costPerRai, yieldKg: y, price: p, profit: r.profit };
    persist([s, ...saved].slice(0, 6));
  };
  const reset = () => { setCosts(Object.fromEntries(DEFAULT_COSTS.map((c) => [c.id, String(c.value)]))); setYieldKg('719'); setPrice('9.00'); setUseLogged(false); };

  const good = r.profit >= 0;

  return (
    <SiteShell>
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-corn-200 via-corn-100 to-leaf-100 px-6 py-9 sm:px-12 sm:py-12 animate-rise">
        <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-white/40" aria-hidden />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13.5px] font-medium text-leaf-800"><Calculator size={15} className="text-leaf-600" /> คำนวณต้นทุน–กำไร</p>
          <h1 className="mt-4 text-[34px] sm:text-[46px] leading-[1.12] text-leaf-950">ปลูกรอบนี้<br />คุ้มไหม ขายราคาเท่าไรถึงไม่ขาดทุน</h1>
          <p className="mt-3 text-[16px] text-soil-700 max-w-xl leading-relaxed">ใส่ต้นทุนแต่ละหมวด ผลผลิต และราคา ระบบคำนวณกำไรให้ทันที พร้อมบอกจุดคุ้มทุน</p>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-start">
        {/* ----- ฟอร์ม ----- */}
        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white border border-[#f1e7d3] p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[22px] text-leaf-950">1) พื้นที่และผลผลิต</h2>
              <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-full bg-soil-100 px-3.5 py-2 text-[13px] font-medium text-leaf-900 hover:bg-soil-200 focus-ring"><RotateCcw size={14} /> ค่าตั้งต้น</button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="พื้นที่ (ไร่)" value={area} onChange={setArea} step="0.25" />
              <Field label="ผลผลิต (กก./ไร่)" value={yieldKg} onChange={setYieldKg} hint="เฉลี่ยประเทศ ~719" />
              <Field label="ราคาขาย (บาท/กก.)" value={price} onChange={setPrice} step="0.05" hint="ที่ความชื้น 14.5%" />
            </div>
            <div className="mt-4">
              <p className="text-[13px] text-soil-600 mb-2">ใส่ราคาจากจุดรับซื้อล่าสุด ({economics.priceAsOf}) ได้เลย</p>
              <div className="flex flex-wrap gap-2">
                {refPrices.map((x) => (
                  <button key={x.place} type="button" onClick={() => setPrice(String(x.price))}
                    className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition focus-ring ${Number(price) === x.price ? 'bg-leaf-800 text-white' : 'bg-soil-100 text-soil-700 hover:bg-soil-200'}`}>
                    {x.province} {x.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white border border-[#f1e7d3] p-6 sm:p-7">
            <h2 className="text-[22px] text-leaf-950">2) ต้นทุนต่อไร่</h2>
            <p className="mt-1 flex gap-2 text-[13px] text-soil-600"><Info size={15} className="mt-0.5 shrink-0" /> ค่าตั้งต้นรวม 5,662 บาท/ไร่ ตามค่าเฉลี่ย สศก. 2569 แต่การแบ่งหมวดเป็นการประมาณ — แก้เป็นตัวเลขจริงของคุณได้</p>

            {farm.plots.length > 0 && (
              <div className="mt-4 rounded-2xl bg-leaf-50 p-4">
                <label className="block">
                  <span className="flex items-center gap-1.5 text-[14px] font-medium text-leaf-900"><NotebookPen size={15} /> ใช้ข้อมูลจริงจากสมุดไร่</span>
                  <select value={plotId} onChange={(e) => { setPlotId(e.target.value); const pl = farm.plots.find((q) => q.id === e.target.value); if (pl) setArea(String(pl.areaRai)); else setUseLogged(false); }}
                    className="mt-2 w-full rounded-xl bg-white ring-1 ring-soil-300 px-3 py-2.5 text-[15px] focus-ring">
                    <option value="">— ไม่เลือก —</option>
                    {farm.plots.map((q) => <option key={q.id} value={q.id}>{q.name} ({q.areaRai} ไร่)</option>)}
                  </select>
                </label>
                {plot && (
                  <div className="mt-3 text-[14px] text-leaf-900">
                    จดไว้แล้ว จ่าย <b>{baht(loggedCost)}</b> บาท · รับ <b>{baht(loggedIncome)}</b> บาท
                    <label className="mt-2 flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={useLogged} onChange={(e) => setUseLogged(e.target.checked)} className="w-5 h-5 accent-leaf-600" />
                      ใช้ยอดจ่ายจริงนี้เป็นต้นทุน ({baht(plot.areaRai ? loggedCost / plot.areaRai : 0)} บาท/ไร่)
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${useLogged ? 'opacity-40 pointer-events-none' : ''}`} aria-disabled={useLogged}>
              {DEFAULT_COSTS.map((c) => (
                <Field key={c.id} label={c.label} value={costs[c.id]} onChange={(v) => setCosts((cur) => ({ ...cur, [c.id]: v }))} />
              ))}
            </div>
            <p className="mt-4 flex items-center justify-between rounded-2xl bg-soil-50 px-4 py-3 text-[15px]">
              <span className="text-soil-700">ต้นทุนรวมต่อไร่</span>
              <span className="font-display text-[20px] text-leaf-900 tabular-nums">{baht(costPerRai)} บาท</span>
            </p>
          </section>
        </div>

        {/* ----- ผลลัพธ์ ----- */}
        <div className="space-y-6 lg:sticky lg:top-24" aria-live="polite">
          <section className={`rounded-[2rem] p-6 sm:p-7 text-white ${good ? 'bg-leaf-800' : 'bg-rose-700'}`}>
            <p className="flex items-center gap-2 text-[14px] text-white/80">{good ? <TrendingUp size={17} /> : <TrendingDown size={17} />} {good ? 'รอบนี้มีกำไร' : 'รอบนี้ขาดทุน'}</p>
            <p className="mt-1 font-display text-[44px] sm:text-[52px] leading-none tabular-nums">{good ? '+' : '−'}{baht(Math.abs(r.profit))}<span className="text-[18px] ml-1.5 font-sans text-white/80">บาท</span></p>
            <p className="mt-2 text-[14.5px] text-white/85">เฉลี่ย {good ? 'กำไร' : 'ขาดทุน'} {baht(Math.abs(r.profitPerRai))} บาท/ไร่ · อัตรากำไร {r.margin.toFixed(1)}%</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-[14px]">
              <div className="rounded-2xl bg-white/10 p-3.5"><dt className="text-white/70 text-[12.5px]">รายได้รวม</dt><dd className="font-medium tabular-nums">{baht(r.revenue)}</dd></div>
              <div className="rounded-2xl bg-white/10 p-3.5"><dt className="text-white/70 text-[12.5px]">ต้นทุนรวม</dt><dd className="font-medium tabular-nums">{baht(r.totalCost)}</dd></div>
              <div className="rounded-2xl bg-white/10 p-3.5"><dt className="text-white/70 text-[12.5px]">ต้นทุนต่อกก.</dt><dd className="font-medium tabular-nums">{r.costPerKg.toFixed(2)} บาท</dd></div>
              <div className="rounded-2xl bg-white/10 p-3.5"><dt className="text-white/70 text-[12.5px]">จุดคุ้มทุน</dt><dd className="font-medium">ขาย ≥ {r.breakEvenPrice.toFixed(2)} บาท/กก.<br />หรือได้ ≥ {baht(r.breakEvenYield)} กก./ไร่</dd></div>
            </dl>
            <button type="button" onClick={saveScenario} className="mt-5 inline-flex items-center gap-2 rounded-full bg-corn-400 px-5 py-2.5 text-[14px] font-medium text-leaf-950 hover:bg-corn-300 focus-ring"><Save size={16} /> บันทึกผลนี้ไว้เทียบ</button>
          </section>

          <section className="rounded-[2rem] bg-white border border-[#f1e7d3] p-5 sm:p-6">
            <h3 className="text-[19px] text-leaf-950">ถ้าราคา/ผลผลิตเปลี่ยน กำไรต่อไร่จะเป็นเท่าไร</h3>
            <div className="mt-3 overflow-x-auto no-scrollbar">
              <table className="w-full text-[13px] tabular-nums min-w-[420px]">
                <thead>
                  <tr><th className="p-2 text-left font-medium text-soil-500">กก./ไร่ ↓ ราคา →</th>{sensPrices.map((sp) => <th key={sp} className="p-2 font-medium text-soil-700">{sp.toFixed(2)}</th>)}</tr>
                </thead>
                <tbody>
                  {sensYields.map((sy) => (
                    <tr key={sy}>
                      <th className="p-2 text-left font-medium text-soil-700">{baht(sy)}</th>
                      {sensPrices.map((sp) => {
                        const v = sy * sp - costPerRai;
                        const base = sy === y && sp === p;
                        return <td key={sp} className={`p-2 text-center rounded-lg ${v >= 0 ? 'bg-leaf-50 text-leaf-800' : 'bg-rose-50 text-rose-700'} ${base ? 'ring-2 ring-corn-400 font-semibold' : ''}`}>{v >= 0 ? '+' : '−'}{baht(Math.abs(v))}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12.5px] text-soil-500">กรอบเหลือง = ตัวเลขที่กรอกอยู่ · เขียว = กำไร · แดง = ขาดทุน</p>
          </section>

          {saved.length > 0 && (
            <section className="rounded-[2rem] bg-white border border-[#f1e7d3] p-5 sm:p-6">
              <h3 className="text-[19px] text-leaf-950">ที่บันทึกไว้เทียบ</h3>
              <ul className="mt-3 space-y-2">
                {saved.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-soil-50 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-leaf-900 truncate">{s.name}</p>
                      <p className="text-[12.5px] text-soil-500">ต้นทุน {baht(s.costPerRai)}/ไร่ · {new Date(s.at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <span className={`font-display tabular-nums ${s.profit >= 0 ? 'text-leaf-700' : 'text-rose-600'}`}>{s.profit >= 0 ? '+' : '−'}{baht(Math.abs(s.profit))}</span>
                    <button type="button" onClick={() => persist(saved.filter((x) => x.id !== s.id))} aria-label="ลบ" className="grid place-items-center w-8 h-8 rounded-full text-soil-400 hover:bg-rose-50 hover:text-rose-600 focus-ring"><Trash2 size={15} /></button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-[12.5px] text-soil-500 leading-relaxed">
            ต้นทุนอ้างอิง: {economics.costPerRai.value} · {economics.costPerKg.value} ({economics.costPerRai.source}) — {economics.costDispute}
            {' '}เป็นการคำนวณเพื่อวางแผนเบื้องต้น ไม่ใช่คำแนะนำทางการเงิน · <Link href="/calendar" className="underline">ดูราคารับซื้อและต้นทุนทั้งหมด</Link>
          </p>
        </div>
      </div>
    </SiteShell>
  );
}

function Field({ label, value, onChange, hint, step = '1' }: { label: string; value: string; onChange: (v: string) => void; hint?: string; step?: string }) {
  return (
    <label className="block">
      <span className="block text-[13.5px] text-soil-700 mb-1">{label}</span>
      <input type="number" min={0} step={step} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-white ring-1 ring-soil-300 px-4 py-3 text-[16px] tabular-nums focus-ring" />
      {hint && <span className="block mt-1 text-[12px] text-soil-500">{hint}</span>}
    </label>
  );
}
