/**
 * lib/normalize.ts — ทำความสะอาดข้อมูลที่แอดมินกรอก ให้อยู่ในรูปแบบที่หน้าเว็บแสดงได้
 * รองรับข้อมูลเก่าที่เคยถูกบันทึกผิดรูปแบบ เช่น วาง JSON ลงช่อง "บรรทัดละ 1 รายการ"
 */
import type { Chemical, Severity, SourceRef } from './data/types';

const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];
const SEVERITY_TH: Record<string, Severity> = {
  'เฝ้าระวัง': 'low', 'ต่ำ': 'low',
  'ปานกลาง': 'medium',
  'รุนแรง': 'high', 'สูง': 'high',
  'รุนแรงที่สุด': 'critical', 'รุนแรงมาก': 'critical', 'วิกฤต': 'critical',
};

export function normSeverity(v: unknown): Severity {
  const s = String(v ?? '').trim();
  if ((SEVERITIES as string[]).includes(s)) return s as Severity;
  const lower = s.toLowerCase();
  if ((SEVERITIES as string[]).includes(lower)) return lower as Severity;
  // ตัด emoji/สัญลักษณ์ออกแล้วเทียบคำไทย — เช็คคำยาวก่อน ("รุนแรงที่สุด" ก่อน "รุนแรง")
  const th = s.replace(/[^฀-๿]/g, '');
  for (const key of Object.keys(SEVERITY_TH).sort((a, b) => b.length - a.length)) {
    if (th.includes(key)) return SEVERITY_TH[key];
  }
  return 'low';
}

const URL_RE = /https?:\/\/[^\s"'<>\]]+/i;

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

/** ลองแปลงข้อความเป็น JSON — ถ้าไม่ใช่ JSON คืน undefined */
function tryJson(s: string): unknown {
  const t = s.trim();
  if (!t || !/^[[{"]/.test(t)) return undefined;
  try { return JSON.parse(t); } catch { return undefined; }
}

/**
 * ถ้าอาร์เรย์ของสตริงเป็น JSON ที่ถูกตัดเป็นบรรทัด ๆ (เช่น ["[", "{", "\"label\": ...", "}", "]"])
 * ให้ต่อกลับแล้ว parse ใหม่
 */
function unsplitJson(arr: unknown[]): unknown[] {
  if (!arr.length || !arr.every((x) => typeof x === 'string')) return arr;
  const strs = arr as string[];
  // แต่ละตัวเป็น JSON ในตัวเอง
  const each = strs.map(tryJson);
  if (each.every((x) => x !== undefined)) {
    return each.flatMap((x) => (Array.isArray(x) ? x : [x]));
  }
  // ต่อทั้งหมดเป็นก้อนเดียว
  const joined = tryJson(strs.join('\n'));
  if (joined !== undefined) return Array.isArray(joined) ? joined : [joined];
  return arr;
}

export function normSources(v: unknown): SourceRef[] {
  let arr: unknown[] = Array.isArray(v) ? v : v == null || v === '' ? [] : [v];
  arr = unsplitJson(arr);
  const out: SourceRef[] = [];
  const push = (label: string, url: string) => {
    label = label.trim(); url = url.trim();
    if (!label && !url) return;
    // เติม https:// ให้ลิงก์ที่พิมพ์มาแค่ชื่อโดเมน เช่น www.doa.go.th
    if (url && !/^https?:\/\//i.test(url) && /^[\w-]+(\.[\w-]+)+/.test(url)) url = `https://${url}`;
    out.push({ label: label || hostOf(url), url });
  };
  const visit = (x: unknown) => {
    if (x == null) return;
    if (typeof x === 'string') {
      const j = tryJson(x);
      if (j !== undefined) return visit(j);
      const m = x.match(URL_RE);
      if (m) {
        const label = x.replace(m[0], '').replace(/[\s–—\-:|()]+$/g, '').replace(/^[\s–—\-:|()]+/g, '');
        push(label, m[0]);
      } else push(x, '');
      return;
    }
    if (Array.isArray(x)) { x.forEach(visit); return; }
    if (typeof x === 'object') {
      const o = x as Record<string, unknown>;
      if (Array.isArray(o.sources)) { o.sources.forEach(visit); return; }
      const url = String(o.url ?? o.link ?? o.href ?? '');
      const label = String(o.label ?? o.title ?? o.name ?? '');
      if (url || label) push(label, url);
    }
  };
  arr.forEach(visit);
  return out;
}

export function normChemicals(v: unknown): Chemical[] {
  let arr: unknown[] = Array.isArray(v) ? v : v == null || v === '' ? [] : [v];
  arr = unsplitJson(arr);
  const out: Chemical[] = [];
  const row = (name: string, extra: Partial<Chemical> = {}) =>
    out.push({ name: name.trim(), rate: '', method: '' as Chemical['method'], ...extra });
  const visit = (x: unknown) => {
    if (x == null) return;
    if (typeof x === 'string') {
      const j = tryJson(x);
      if (j !== undefined) return visit(j);
      if (x.trim()) row(x);
      return;
    }
    if (Array.isArray(x)) { x.forEach(visit); return; }
    if (typeof x === 'object') {
      const o = x as Record<string, unknown>;
      if (typeof o.name === 'string') {
        if (!o.name.trim()) return; // แถวว่าง
        out.push({
          name: o.name,
          formulation: o.formulation ? String(o.formulation) : undefined,
          group: o.group ? String(o.group) : undefined,
          rate: String(o.rate ?? ''),
          method: String(o.method ?? '') as Chemical['method'],
          note: o.note ? String(o.note) : undefined,
        });
        return;
      }
      // รูปแบบ { active_ingredients: [...], application: "..." }
      const ings = Array.isArray(o.active_ingredients) ? (o.active_ingredients as unknown[]).map(String) : [];
      const note = o.application ? String(o.application) : undefined;
      if (ings.length) ings.forEach((n) => row(n.replace(/_/g, ' '), { note }));
      else if (note) row(note);
    }
  };
  arr.forEach(visit);
  return out;
}

/** ปรับรูปแบบข้อมูล 1 รายการให้พร้อมแสดงผล */
export function normalizeItem<T extends Record<string, unknown>>(collection: string, item: T): T {
  const it: Record<string, unknown> = { ...item };
  if ('severity' in it) it.severity = normSeverity(it.severity);
  if ('sources' in it) it.sources = normSources(it.sources);
  if ((collection === 'pests' || collection === 'diseases') && 'chemicals' in it) {
    it.chemicals = normChemicals(it.chemicals);
  }
  return it as T;
}
