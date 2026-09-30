'use client';

import { Plus, Trash2, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

export type ListColumn = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'url' | 'select';
  options?: string[];
  /** กินเต็มแถว */
  wide?: boolean;
  required?: boolean;
};

export type ListSchema = { columns: ListColumn[]; addLabel: string; itemLabel: string };

const METHODS = ['พ่นทางใบ', 'คลุกเมล็ด', 'ราดโคนต้น', 'เหยื่อพิษ', 'รมในโรงเก็บ', 'ชีวภัณฑ์'];

export const LIST_SCHEMAS: Record<string, ListSchema> = {
  sources: {
    addLabel: 'เพิ่มแหล่งอ้างอิง',
    itemLabel: 'แหล่งอ้างอิง',
    columns: [
      { key: 'label', label: 'ชื่อเอกสาร / หน่วยงาน', placeholder: 'เช่น กรมวิชาการเกษตร – คู่มือโรคข้าวโพด', wide: true, required: true },
      { key: 'url', label: 'ลิงก์ (URL)', placeholder: 'https://www.doa.go.th/...', type: 'url', wide: true },
    ],
  },
  chemicals: {
    addLabel: 'เพิ่มสารป้องกันกำจัด',
    itemLabel: 'สาร',
    columns: [
      { key: 'name', label: 'ชื่อสารออกฤทธิ์', placeholder: 'เช่น โพรพิโคนาโซล', required: true },
      { key: 'formulation', label: 'สูตร / ความเข้มข้น', placeholder: 'เช่น 25% EC' },
      { key: 'group', label: 'กลุ่มกลไก (IRAC/FRAC)', placeholder: 'เช่น FRAC 3' },
      { key: 'rate', label: 'อัตราใช้', placeholder: 'เช่น 10 มล. ต่อน้ำ 20 ลิตร' },
      { key: 'method', label: 'วิธีใช้', type: 'select', options: METHODS },
      { key: 'note', label: 'หมายเหตุ', placeholder: 'เช่น พ่นเมื่อพบอาการ ทุก 7 วัน', wide: true },
    ],
  },
  uses: {
    addLabel: 'เพิ่มกรณีการใช้',
    itemLabel: 'กรณีการใช้',
    columns: [
      { key: 'target', label: 'ศัตรูพืชเป้าหมาย', placeholder: 'เช่น หนอนกระทู้ข้าวโพดลายจุด', required: true },
      { key: 'targetType', label: 'ประเภทเป้าหมาย', type: 'select', options: ['แมลงศัตรูพืช', 'โรคพืช', 'วัชพืช', 'สัตว์ศัตรูพืช'] },
      { key: 'formulation', label: 'สูตร', placeholder: 'เช่น 5% SC' },
      { key: 'rate', label: 'อัตราใช้', placeholder: 'เช่น 20 มล. ต่อน้ำ 20 ลิตร' },
      { key: 'method', label: 'วิธีใช้', type: 'select', options: METHODS },
      { key: 'note', label: 'หมายเหตุ', wide: true },
    ],
  },
};

type Row = Record<string, unknown>;

export function ObjectListEditor({
  schema, value, onChange,
}: {
  schema: ListSchema;
  value: Row[];
  onChange: (rows: Row[]) => void;
}) {
  const rows = value;
  const blank = () => Object.fromEntries(schema.columns.map((c) => [c.key, c.type === 'select' ? (c.options?.[0] ?? '') : '']));

  const update = (i: number, key: string, v: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const inputCls = 'w-full rounded-xl bg-white ring-1 ring-leaf-200 px-3 py-2.5 text-[14px] focus-ring';

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="rounded-2xl bg-leaf-50 px-4 py-3 text-[13.5px] text-leaf-600">ยังไม่มีรายการ — กดปุ่มด้านล่างเพื่อเพิ่ม</p>
      )}

      {rows.map((r, i) => (
        <div key={i} className="rounded-2xl ring-1 ring-leaf-200 bg-leaf-50/40 p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[12.5px] font-extrabold text-leaf-700">{schema.itemLabel} {i + 1}</span>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="grid place-items-center w-8 h-8 rounded-lg text-leaf-600 hover:bg-white disabled:opacity-30 focus-ring" aria-label="เลื่อนขึ้น">
                <ChevronUp size={16} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1}
                className="grid place-items-center w-8 h-8 rounded-lg text-leaf-600 hover:bg-white disabled:opacity-30 focus-ring" aria-label="เลื่อนลง">
                <ChevronDown size={16} />
              </button>
              <button type="button" onClick={() => remove(i)}
                className="grid place-items-center w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-50 focus-ring" aria-label="ลบรายการนี้">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {schema.columns.map((c) => {
              const v = String(r[c.key] ?? '');
              const badUrl = c.type === 'url' && v && !/^https?:\/\//i.test(v);
              return (
                <label key={c.key} className={`block ${c.wide ? 'sm:col-span-2' : ''}`}>
                  <span className="block text-[12px] font-bold text-leaf-700 mb-1">
                    {c.label}{c.required && <span className="text-rose-600"> *</span>}
                  </span>
                  {c.type === 'select' ? (
                    <select value={v} onChange={(e) => update(i, c.key, e.target.value)} className={`${inputCls} cursor-pointer`}>
                      {v && !c.options?.includes(v) && <option value={v}>{v}</option>}
                      <option value="">— ไม่ระบุ —</option>
                      {c.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type={c.type === 'url' ? 'url' : 'text'}
                        value={v}
                        placeholder={c.placeholder}
                        onChange={(e) => update(i, c.key, e.target.value)}
                        className={`${inputCls} ${badUrl ? 'ring-amber-400' : ''}`}
                      />
                      {c.type === 'url' && /^https?:\/\//i.test(v) && (
                        <a href={v} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 grid place-items-center w-10 rounded-xl bg-white ring-1 ring-leaf-200 text-leaf-700 hover:bg-leaf-50 focus-ring"
                          aria-label="เปิดลิงก์ทดสอบ">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  )}
                  {badUrl && <span className="mt-1 block text-[12px] font-semibold text-amber-700">ลิงก์ควรขึ้นต้นด้วย https:// — ระบบจะเติมให้อัตโนมัติ</span>}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <button type="button" onClick={() => onChange([...rows, blank()])}
        className="inline-flex items-center gap-2 rounded-2xl bg-white ring-1 ring-leaf-300 px-4 py-2.5 text-[14px] font-bold text-leaf-800 hover:bg-leaf-50 transition focus-ring">
        <Plus size={17} /> {schema.addLabel}
      </button>
    </div>
  );
}
