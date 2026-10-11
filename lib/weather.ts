/**
 * พยากรณ์อากาศจาก Open-Meteo (ฟรี ไม่ต้องใช้คีย์ · https://open-meteo.com) + กฎเตือนความเสี่ยงโรค/แมลง
 *
 * กฎความเสี่ยงอิงช่วงที่ระบุไว้ในข้อมูลของระบบนี้ (หน้าโรค/แมลง/เตือนภัยประจำเดือน) เช่น
 *  - ราสนิม: ความชื้น 95–100% และอุณหภูมิ 24–28 °C
 *  - โรคจากเชื้อรา (ราน้ำค้าง ใบไหม้): ฝนติดกัน ความชื้นสูง
 *  - หนอนกระทู้ลายจุด/เพลี้ยไฟ: ร้อนและแล้ง
 * เป็นแนวทางเบื้องต้นเพื่อให้ไปสำรวจแปลง ไม่ใช่การพยากรณ์การระบาดจริง
 */

export type Province = { name: string; lat: number; lon: number };

export const PROVINCES: Province[] = [
  { name: 'เพชรบูรณ์', lat: 16.42, lon: 101.15 },
  { name: 'นครสวรรค์', lat: 15.7, lon: 100.12 },
  { name: 'นครราชสีมา', lat: 14.97, lon: 102.1 },
  { name: 'ลพบุรี', lat: 14.8, lon: 100.65 },
  { name: 'สระบุรี', lat: 14.53, lon: 100.91 },
  { name: 'เลย', lat: 17.49, lon: 101.72 },
  { name: 'เชียงใหม่', lat: 18.79, lon: 98.98 },
  { name: 'เชียงราย', lat: 19.91, lon: 99.83 },
  { name: 'น่าน', lat: 18.78, lon: 100.78 },
  { name: 'แพร่', lat: 18.14, lon: 100.14 },
  { name: 'พิษณุโลก', lat: 16.82, lon: 100.26 },
  { name: 'สุโขทัย', lat: 17.0, lon: 99.82 },
  { name: 'กำแพงเพชร', lat: 16.48, lon: 99.52 },
  { name: 'ตาก', lat: 16.88, lon: 99.13 },
  { name: 'ขอนแก่น', lat: 16.44, lon: 102.83 },
  { name: 'ชัยภูมิ', lat: 15.81, lon: 102.03 },
  { name: 'กาญจนบุรี', lat: 14.0, lon: 99.55 },
  { name: 'อุตรดิตถ์', lat: 17.62, lon: 100.1 },
  { name: 'พิจิตร', lat: 16.44, lon: 100.35 },
  { name: 'กรุงเทพมหานคร', lat: 13.75, lon: 100.5 },
];

export type DayForecast = {
  date: string;
  tMax: number;
  tMin: number;
  tMean: number;
  rain: number; // มม.
  rainProb: number; // %
  humidity: number; // % เฉลี่ยทั้งวัน
  wind: number; // กม./ชม. สูงสุด
  code: number;
};

export async function fetchForecast(lat: number, lon: number): Promise<DayForecast[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code` +
    `&hourly=relative_humidity_2m,temperature_2m&timezone=Asia%2FBangkok&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const j = await res.json();
  const d = j.daily;
  const hum: Record<string, number[]> = {};
  (j.hourly.time as string[]).forEach((t, i) => { (hum[t.slice(0, 10)] ??= []).push(j.hourly.relative_humidity_2m[i]); });
  return (d.time as string[]).map((date, i) => {
    const hs = hum[date] ?? [];
    return {
      date,
      tMax: d.temperature_2m_max[i],
      tMin: d.temperature_2m_min[i],
      tMean: (d.temperature_2m_max[i] + d.temperature_2m_min[i]) / 2,
      rain: d.precipitation_sum[i] ?? 0,
      rainProb: d.precipitation_probability_max[i] ?? 0,
      humidity: hs.length ? Math.round(hs.reduce((a, b) => a + b, 0) / hs.length) : 0,
      wind: d.wind_speed_10m_max[i] ?? 0,
      code: d.weather_code[i] ?? 0,
    };
  });
}

/** รหัส WMO → คำอธิบายภาษาไทย */
export function describeCode(code: number): string {
  if (code === 0) return 'ท้องฟ้าแจ่มใส';
  if (code <= 2) return 'มีเมฆบางส่วน';
  if (code === 3) return 'เมฆมาก';
  if (code <= 48) return 'หมอก';
  if (code <= 57) return 'ฝนปรอย';
  if (code <= 65) return 'ฝนตก';
  if (code <= 82) return 'ฝนตกเป็นช่วง';
  if (code <= 99) return 'ฝนฟ้าคะนอง';
  return '—';
}

export type Risk = {
  id: string;
  level: 'high' | 'medium' | 'low';
  title: string;
  why: string;
  action: string;
  href: string;
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** วิเคราะห์ความเสี่ยงจากพยากรณ์ 7 วัน */
export function assessRisks(days: DayForecast[]): Risk[] {
  const risks: Risk[] = [];
  const rainyDays = days.filter((d) => d.rain >= 2).length;
  const totalRain = days.reduce((s, d) => s + d.rain, 0);
  const humAvg = avg(days.map((d) => d.humidity));
  const tMean = avg(days.map((d) => d.tMean));
  const tMax = Math.max(...days.map((d) => d.tMax));
  const dryStreak = (() => { let best = 0, cur = 0; for (const d of days) { if (d.rain < 1) { cur++; best = Math.max(best, cur); } else cur = 0; } return best; })();

  // เชื้อรา: ฝนติดกัน + ชื้นสูง
  if (rainyDays >= 3 && humAvg >= 80) {
    risks.push({
      id: 'fungal', level: rainyDays >= 5 || humAvg >= 88 ? 'high' : 'medium', title: 'โรคจากเชื้อรา (ราน้ำค้าง ใบไหม้ กาบและใบไหม้)',
      why: `ฝนตกอย่างน้อย ${rainyDays} วันใน 7 วัน ความชื้นเฉลี่ย ~${Math.round(humAvg)}%`,
      action: 'เดินสำรวจใบล่างสัปดาห์นี้ ทำร่องระบายน้ำไม่ให้ขัง และเลี่ยงการให้น้ำเพิ่ม', href: '/diseases',
    });
  }
  // ราสนิม: ชื้นมาก + 24–28 °C (ตามข้อมูลช่วงระบาดในระบบ)
  if (humAvg >= 85 && tMean >= 22 && tMean <= 29) {
    risks.push({
      id: 'rust', level: humAvg >= 92 ? 'high' : 'medium', title: 'โรคราสนิม',
      why: `อากาศอบอุ่น ~${tMean.toFixed(0)} °C และชื้นสูง ~${Math.round(humAvg)}% ใกล้ช่วงที่ราสนิมระบาด (ชื้น 95–100%, 24–28 °C)`,
      action: 'ดูตุ่มสีสนิมใต้ใบ — ข้าวโพดเลี้ยงสัตว์มักไม่คุ้มพ่นสาร ให้ใช้พันธุ์ต้านทานในรุ่นถัดไป', href: '/diseases#rust',
    });
  }
  // หนอนกระทู้ลายจุด/เพลี้ยไฟ: แล้ง + ร้อน
  if (dryStreak >= 5 && tMax >= 33) {
    risks.push({
      id: 'fall-armyworm', level: dryStreak >= 6 && tMax >= 35 ? 'high' : 'medium', title: 'หนอนกระทู้ลายจุด และเพลี้ยไฟ',
      why: `ไม่มีฝนติดกัน ${dryStreak} วัน และร้อนจัดสูงสุด ${Math.round(tMax)} °C — อากาศร้อนแห้งแมลงกลุ่มนี้ระบาดง่าย`,
      action: 'ตรวจยอดอ่อนและกาบใบทุกเช้า มองหามูลหนอนสีเข้มและใบเป็นรูพรุน', href: '/pests#fall-armyworm',
    });
  }
  // ขาดน้ำ/ความร้อน
  if (dryStreak >= 5) {
    risks.push({
      id: 'drought', level: dryStreak >= 7 ? 'high' : 'medium', title: 'ขาดน้ำ',
      why: `แทบไม่มีฝน ${dryStreak} วันติดกัน (ฝนรวม ${totalRain.toFixed(0)} มม.)`,
      action: 'ถ้าอยู่ช่วงก่อนออกดอก–ออกไหม ต้องให้น้ำ เพราะขาดน้ำช่วงนี้กระทบผลผลิตมากที่สุด', href: '/calendar',
    });
  }
  if (tMax >= 37) {
    risks.push({
      id: 'heat', level: 'medium', title: 'ร้อนจัด',
      why: `อุณหภูมิสูงสุด ~${Math.round(tMax)} °C ช่วงออกไหมอาจผสมเกสรไม่ติด`,
      action: 'ถ้าข้าวโพดกำลังออกไหม ให้น้ำช่วงเย็น และอย่าพ่นสารตอนแดดจัด', href: '/calendar',
    });
  }
  if (risks.length === 0) {
    risks.push({ id: 'ok', level: 'low', title: 'สัปดาห์นี้ยังไม่มีสัญญาณเสี่ยงเด่น', why: 'อากาศไม่เข้าเงื่อนไขการระบาดที่ระบบเฝ้าดู', action: 'สำรวจแปลงตามปกติ สัปดาห์ละครั้ง', href: '/farm' });
  }
  return risks;
}

/** วันไหนเหมาะพ่นสาร: ฝนน้อย ลมไม่แรง */
export function sprayWindows(days: DayForecast[]) {
  return days.map((d) => {
    const ok = d.rain < 1 && d.rainProb < 40 && d.wind < 15;
    const reasons: string[] = [];
    if (d.rain >= 1 || d.rainProb >= 40) reasons.push(`ฝน ${d.rainProb}%`);
    if (d.wind >= 15) reasons.push(`ลมแรง ${Math.round(d.wind)} กม./ชม.`);
    return { date: d.date, ok, reasons };
  });
}
