'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CloudRain, Sun, Cloud, CloudLightning, CloudFog, CloudDrizzle, MapPin, LocateFixed, RefreshCw, Droplets, Wind,
  AlertTriangle, CheckCircle2, SprayCan, Loader2, type LucideIcon,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PROVINCES, fetchForecast, assessRisks, sprayWindows, describeCode, type DayForecast, type Risk } from '@/lib/weather';
import { useFarm } from '@/lib/farm';

const PREF_KEY = 'maize_weather_province';
const CACHE_KEY = 'maize_weather_cache_v1';
const CACHE_MS = 30 * 60_000;

const iconFor = (code: number): LucideIcon => (code === 0 ? Sun : code <= 3 ? Cloud : code <= 48 ? CloudFog : code <= 57 ? CloudDrizzle : code <= 82 ? CloudRain : CloudLightning);
const dayName = (d: string, i: number) => (i === 0 ? 'วันนี้' : i === 1 ? 'พรุ่งนี้' : new Date(`${d}T00:00:00`).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' }));

const LEVEL: Record<Risk['level'], { label: string; box: string; chip: string }> = {
  high: { label: 'เสี่ยงสูง', box: 'border-rose-200 bg-rose-50', chip: 'bg-rose-600 text-white' },
  medium: { label: 'ควรระวัง', box: 'border-corn-200 bg-corn-50', chip: 'bg-corn-500 text-leaf-950' },
  low: { label: 'ปกติ', box: 'border-leaf-100 bg-leaf-50', chip: 'bg-leaf-600 text-white' },
};

export default function WeatherPage() {
  const farm = useFarm();
  const [province, setProvince] = useState('เพชรบูรณ์');
  const [coords, setCoords] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [days, setDays] = useState<DayForecast[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [locating, setLocating] = useState(false);

  const load = useCallback(async (lat: number, lon: number, label: string, force = false) => {
    setErr('');
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    try {
      if (!force) {
        const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (c && c.key === key && Date.now() - c.at < CACHE_MS) { setDays(c.days); setCoords({ lat, lon, label }); return; }
      }
    } catch { /* ไม่มีแคชก็โหลดใหม่ */ }
    setLoading(true);
    try {
      const data = await fetchForecast(lat, lon);
      setDays(data);
      setCoords({ lat, lon, label });
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ key, at: Date.now(), days: data })); } catch { /* ข้าม */ }
    } catch {
      setErr('ดึงพยากรณ์อากาศไม่สำเร็จ ลองใหม่อีกครั้ง หรือเช็กอินเทอร์เน็ต');
    } finally { setLoading(false); }
  }, []);

  // เริ่มต้น: จังหวัดที่เคยเลือก → จังหวัดของแปลงแรก → เพชรบูรณ์
  useEffect(() => {
    let name = 'เพชรบูรณ์';
    try { name = localStorage.getItem(PREF_KEY) || name; } catch { /* ข้าม */ }
    const pv = PROVINCES.find((p) => p.name === name) ?? PROVINCES[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProvince(pv.name);
    load(pv.lat, pv.lon, pv.name);
  }, [load]);

  const pickProvince = (name: string) => {
    const pv = PROVINCES.find((p) => p.name === name);
    if (!pv) return;
    setProvince(name);
    try { localStorage.setItem(PREF_KEY, name); } catch { /* ข้าม */ }
    load(pv.lat, pv.lon, pv.name);
  };

  const locate = () => {
    if (!navigator.geolocation) { setErr('เบราว์เซอร์นี้ไม่รองรับการหาตำแหน่ง'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocating(false); setProvince(''); load(pos.coords.latitude, pos.coords.longitude, 'ตำแหน่งของคุณ'); },
      () => { setLocating(false); setErr('ยังไม่ได้อนุญาตให้ใช้ตำแหน่ง เลือกจังหวัดเองแทนได้'); },
      { timeout: 10_000 },
    );
  };

  const risks = days ? assessRisks(days) : [];
  const spray = days ? sprayWindows(days) : [];
  const plotProvinces = [...new Set(farm.plots.map((p) => p.province).filter((n): n is string => !!n && PROVINCES.some((x) => x.name === n)))];

  return (
    <SiteShell>
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-100 via-corn-50 to-leaf-100 px-6 py-9 sm:px-12 sm:py-12 animate-rise">
        <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-white/50" aria-hidden />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13.5px] font-medium text-leaf-800"><CloudRain size={15} className="text-sky-600" /> อากาศและเตือนโรค</p>
          <h1 className="mt-4 text-[34px] sm:text-[46px] leading-[1.12] text-leaf-950">ฝนจะมาไหม ต้องระวังอะไร<br />ในสัปดาห์นี้</h1>
          <p className="mt-3 text-[16px] text-soil-700 max-w-xl leading-relaxed">ดูพยากรณ์ 7 วัน พร้อมเตือนโรคและแมลงที่เสี่ยงตามฝนและความชื้น และบอกวันที่เหมาะพ่นสาร</p>
        </div>
      </header>

      {/* เลือกที่ */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative">
          <span className="sr-only">เลือกจังหวัด</span>
          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-600 pointer-events-none" />
          <select value={province} onChange={(e) => pickProvince(e.target.value)} className="appearance-none rounded-full bg-white ring-1 ring-soil-300 pl-10 pr-10 py-3 text-[15px] font-medium text-leaf-900 focus-ring">
            {!province && <option value="">ตำแหน่งของคุณ</option>}
            {PROVINCES.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </label>
        <button type="button" onClick={locate} disabled={locating} className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-soil-300 px-5 py-3 text-[14.5px] font-medium text-leaf-900 hover:bg-soil-50 disabled:opacity-60 focus-ring">
          {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />} ใช้ตำแหน่งของฉัน
        </button>
        <button type="button" onClick={() => coords && load(coords.lat, coords.lon, coords.label, true)} disabled={!coords || loading} aria-label="โหลดใหม่" className="grid place-items-center w-11 h-11 rounded-full bg-soil-100 text-leaf-900 hover:bg-soil-200 disabled:opacity-50 focus-ring">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
        {plotProvinces.length > 0 && (
          <span className="text-[13px] text-soil-500">แปลงของคุณ: {plotProvinces.map((n) => (
            <button key={n} type="button" onClick={() => pickProvince(n)} className="ml-1 rounded-full bg-corn-100 px-3 py-1 font-medium text-leaf-900 hover:bg-corn-200 focus-ring">{n}</button>
          ))}</span>
        )}
      </div>

      {err && <p role="alert" className="mt-4 flex gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-[14.5px] text-rose-700"><AlertTriangle size={17} className="mt-0.5 shrink-0" /> {err}</p>}

      {!days && loading && <div className="mt-6 h-64 rounded-[2rem] bg-white/70 animate-pulse" />}

      {days && (
        <>
          {/* เตือนความเสี่ยง */}
          <section className="mt-8" aria-label="เตือนความเสี่ยง">
            <h2 className="text-[26px] text-leaf-950">เตือนสำหรับสัปดาห์นี้ · {coords?.label}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {risks.map((r) => {
                const st = LEVEL[r.level];
                return (
                  <article key={r.id} className={`rounded-3xl border p-5 ${st.box}`}>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-0.5 text-[12.5px] font-medium ${st.chip}`}>{st.label}</span>
                      {r.level === 'low' ? <CheckCircle2 size={17} className="text-leaf-600" /> : <AlertTriangle size={17} className="text-corn-700" />}
                    </div>
                    <h3 className="mt-2 text-[19px] text-leaf-950">{r.title}</h3>
                    <p className="mt-1 text-[14.5px] text-soil-700 leading-relaxed">{r.why}</p>
                    <p className="mt-2 text-[14.5px] text-leaf-900 leading-relaxed"><span className="font-medium">ควรทำ:</span> {r.action}</p>
                    <Link href={r.href} className="mt-2 inline-flex items-center min-h-10 text-[14px] font-medium text-leaf-700 underline focus-ring rounded">อ่านรายละเอียด</Link>
                  </article>
                );
              })}
            </div>
            <p className="mt-3 text-[12.5px] text-soil-500">เป็นแนวทางเบื้องต้นจากอากาศ ไม่ใช่การยืนยันว่ามีการระบาดจริง — ต้องไปสำรวจแปลงประกอบเสมอ</p>
          </section>

          {/* 7 วัน */}
          <section className="mt-10" aria-label="พยากรณ์ 7 วัน">
            <h2 className="text-[26px] text-leaf-950">พยากรณ์ 7 วัน</h2>
            <ul className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible">
              {days.map((d, i) => {
                const I = iconFor(d.code);
                const sp = spray[i];
                return (
                  <li key={d.date} className={`shrink-0 w-[8.5rem] lg:w-auto rounded-3xl p-4 text-center border ${i === 0 ? 'bg-leaf-800 text-white border-leaf-800' : 'bg-white border-[#f1e7d3] text-leaf-900'}`}>
                    <p className="text-[14px] font-medium">{dayName(d.date, i)}</p>
                    <I size={30} className={`mx-auto mt-2 ${i === 0 ? 'text-corn-300' : 'text-leaf-600'}`} aria-hidden />
                    <p className={`mt-1 text-[12px] ${i === 0 ? 'text-leaf-200' : 'text-soil-500'}`}>{describeCode(d.code)}</p>
                    <p className="mt-2 text-[17px] font-display tabular-nums">{Math.round(d.tMax)}°<span className={`text-[13px] ${i === 0 ? 'text-leaf-200' : 'text-soil-400'}`}> / {Math.round(d.tMin)}°</span></p>
                    <p className={`mt-2 flex items-center justify-center gap-1 text-[12.5px] ${i === 0 ? 'text-sky-200' : 'text-sky-700'}`}><Droplets size={13} /> {d.rainProb}% · {d.rain.toFixed(0)} มม.</p>
                    <p className={`mt-1 flex items-center justify-center gap-1 text-[12.5px] ${i === 0 ? 'text-leaf-200' : 'text-soil-500'}`}><Wind size={13} /> {Math.round(d.wind)} กม./ชม.</p>
                    <p className={`mt-1 text-[12px] ${i === 0 ? 'text-leaf-200' : 'text-soil-500'}`}>ชื้น {d.humidity}%</p>
                    <p className={`mt-3 rounded-full px-2 py-1 text-[12px] font-medium ${sp.ok ? (i === 0 ? 'bg-white/15 text-white' : 'bg-leaf-100 text-leaf-800') : (i === 0 ? 'bg-white/10 text-leaf-100' : 'bg-soil-100 text-soil-500')}`}>
                      <SprayCan size={11} className="inline -mt-0.5 mr-1" />{sp.ok ? 'พ่นสารได้' : 'ไม่ควรพ่น'}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[12.5px] text-soil-500">“พ่นสารได้” = ฝนน้อย (&lt;1 มม., โอกาส &lt;40%) และลมไม่แรง (&lt;15 กม./ชม.) · ข้อมูลจาก <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline inline-block py-2">Open-Meteo</a> อัปเดตทุก 30 นาที · ต้องการพ่นสารหรือไม่ ให้เทียบเกณฑ์ใน<Link href="/pests" className="underline inline-block py-2">คลังแมลง</Link>ก่อน</p>
          </section>
        </>
      )}
    </SiteShell>
  );
}
