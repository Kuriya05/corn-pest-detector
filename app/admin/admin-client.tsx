'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck, Search, Plus, Pencil, Trash2, RotateCcw, Save, X, Loader2,
  Download, History, Database, AlertTriangle, CheckCircle2, LogOut, BadgeCheck,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Chip, Callout, EmptyState } from '@/components/ui';
import { COLLECTIONS, collectionLabels, titleField, type CollectionName } from '@/lib/collections';
import { fieldLabels, longTextFields } from './field-labels';

type Item = Record<string, unknown> & { id: string; official?: boolean; edited?: boolean };

type Stats = {
  collections: { name: CollectionName; label: string; total: number; seed: number; added: number; edited: number; removed: number }[];
  audit: { at: string; by: string; action: string; collection: string; id: string; label: string }[];
  updatedAt: string;
};

const actionLabel: Record<string, string> = {
  create: 'เพิ่มใหม่', update: 'แก้ไข', delete: 'ลบ', restore: 'กู้คืน',
};

export default function AdminClient({ username }: { username: string }) {
  const [collection, setCollection] = useState<CollectionName>('pests');
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async (name: CollectionName) => {
    setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`/api/data?collection=${name}`).then((r) => r.json()),
        fetch('/api/admin/stats').then((r) => r.json()),
      ]);
      if (itemsRes?.success) setItems(itemsRes.items);
      if (statsRes?.success) setStats(statsRes);
    } catch {
      setToast({ tone: 'err', text: 'โหลดข้อมูลไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(collection); }, [collection, load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => JSON.stringify(it).toLowerCase().includes(q));
  }, [items, query]);

  const titleOf = (it: Item) => String(it[titleField[collection]] ?? it.id);

  /** สร้างแม่แบบรายการใหม่จากโครงสร้างของรายการเดิม */
  function blankItem(): Item {
    const template = items.find((i) => i.official) ?? items[0];
    const blank: Item = { id: '' };
    if (template) {
      for (const [k, v] of Object.entries(template)) {
        if (k === 'official' || k === 'edited' || k === 'id') continue;
        if (Array.isArray(v)) blank[k] = [];
        else if (typeof v === 'boolean') blank[k] = false;
        else if (typeof v === 'number') blank[k] = 0;
        else if (v && typeof v === 'object') blank[k] = {};
        else blank[k] = '';
      }
    }
    return blank;
  }

  async function save(item: Item) {
    if (!item.id?.trim()) { setToast({ tone: 'err', text: 'ต้องกรอกรหัสรายการ (id)' }); return; }
    const res = await fetch('/api/admin/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, item }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) { setToast({ tone: 'err', text: data.error || 'บันทึกไม่สำเร็จ' }); return; }
    setToast({ tone: 'ok', text: `บันทึก "${titleOf(item)}" เรียบร้อยแล้ว` });
    setEditing(null);
    setIsNew(false);
    load(collection);
  }

  async function remove(item: Item) {
    const warn = item.official
      ? `ซ่อนรายการ "${titleOf(item)}" ออกจากคลังความรู้?\n\nรายการนี้เป็นข้อมูลอ้างอิงจากเอกสารราชการ จะถูกซ่อนไว้เท่านั้น และกู้คืนได้ภายหลัง`
      : `ลบรายการ "${titleOf(item)}" อย่างถาวร?\n\nรายการนี้แอดมินเพิ่มเอง เมื่อลบแล้วจะกู้คืนไม่ได้`;
    if (!window.confirm(warn)) return;

    const res = await fetch(`/api/admin/item?collection=${collection}&id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data.success) { setToast({ tone: 'err', text: data.error || 'ลบไม่สำเร็จ' }); return; }
    setToast({ tone: 'ok', text: data.permanent ? 'ลบรายการถาวรแล้ว' : 'ซ่อนรายการแล้ว — กู้คืนได้จากแถบสถิติด้านบน' });
    load(collection);
  }

  async function restore(id: string) {
    const res = await fetch(`/api/admin/item?collection=${collection}&id=${encodeURIComponent(id)}`, { method: 'PUT' });
    const data = await res.json();
    if (!res.ok || !data.success) { setToast({ tone: 'err', text: data.error || 'กู้คืนไม่สำเร็จ' }); return; }
    setToast({ tone: 'ok', text: 'กู้คืนกลับเป็นข้อมูลต้นฉบับแล้ว' });
    load(collection);
  }

  const current = stats?.collections.find((c) => c.name === collection);

  return (
    <SiteShell wide>
      <PageHeader
        eyebrow="Admin"
        title="จัดการข้อมูลคลังความรู้"
        description={`เข้าสู่ระบบในชื่อ ${username} — ทุกการแก้ไขจะถูกบันทึกไว้ว่าใครทำอะไรเมื่อไหร่`}
        icon={<ShieldCheck size={26} strokeWidth={2.3} />}
        action={
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/admin/export"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[14px] font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
            >
              <Download size={16} /> สำรองข้อมูล
            </a>
            <button
              type="button"
              onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[14px] font-bold text-soil-800 ring-1 ring-soil-200 hover:bg-soil-50 transition focus-ring"
            >
              <LogOut size={16} /> ออกจากระบบ
            </button>
          </div>
        }
      />

      <Callout tone="info" title="ข้อมูลตั้งต้นจะไม่หายไปไหน">
        รายการที่ติดป้าย <strong>อ้างอิงราชการ</strong> มาจากไฟล์โค้ดที่อ้างอิงเอกสารกรมวิชาการเกษตร
        เมื่อแก้ไขหรือลบ ระบบจะเก็บสิ่งที่คุณเปลี่ยนไว้แยกต่างหาก ต้นฉบับยังอยู่ครบและกดกู้คืนได้ตลอดเวลา
      </Callout>

      {toast && (
        <div className={`mt-4 rounded-3xl px-4 py-3 flex items-center gap-2.5 ring-1 ${
          toast.tone === 'ok' ? 'bg-leaf-50 ring-leaf-200 text-leaf-900' : 'bg-rose-50 ring-rose-200 text-rose-900'
        }`}>
          {toast.tone === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span className="text-[14px] font-semibold">{toast.text}</span>
        </div>
      )}

      {/* แถบเลือกหมวด */}
      <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {COLLECTIONS.map((c) => (
          <Chip
            key={c} active={collection === c}
            onClick={() => { setCollection(c); setEditing(null); setQuery(''); }}
            count={stats?.collections.find((x) => x.name === c)?.total}
          >
            {collectionLabels[c]}
          </Chip>
        ))}
      </div>

      {/* สถิติของหมวดปัจจุบัน */}
      {current && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { k: 'ทั้งหมด', v: current.total },
            { k: 'ข้อมูลตั้งต้น', v: current.seed },
            { k: 'แอดมินเพิ่ม', v: current.added },
            { k: 'ถูกแก้ไข', v: current.edited },
            { k: 'ถูกซ่อน', v: current.removed },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl bg-white/80 ring-1 ring-leaf-100 px-4 py-3">
              <p className="text-[21px] font-extrabold tabular-nums text-leaf-900 leading-none">{s.v}</p>
              <p className="mt-1 text-[12px] font-semibold text-leaf-600">{s.k}</p>
            </div>
          ))}
        </div>
      )}

      {/* รายการที่ถูกซ่อน */}
      {current && current.removed > 0 && (
        <div className="mt-4">
          <Callout tone="warn" title={`มี ${current.removed} รายการที่ถูกซ่อนอยู่`}>
            รายการเหล่านี้ยังอยู่ในระบบแต่ไม่แสดงให้เกษตรกรเห็น — กดกู้คืนได้จากรายการด้านล่างที่ขึ้นป้าย &ldquo;ถูกซ่อน&rdquo;
            หรือกดปุ่มกู้คืนทั้งหมดในหน้านี้
          </Callout>
        </div>
      )}

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-400 pointer-events-none" />
          <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={`ค้นหาใน${collectionLabels[collection]}`}
            className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 pl-12 pr-4 py-3.5 text-[15px] placeholder:text-leaf-400 focus-ring"
          />
        </label>
        <button
          type="button"
          onClick={() => { setEditing(blankItem()); setIsNew(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-leaf-700 px-5 py-3.5 font-bold text-white shadow-sm hover:bg-leaf-800 transition focus-ring"
        >
          <Plus size={19} /> เพิ่มรายการใหม่
        </button>
      </div>

      {loading ? (
        <Card className="mt-5 text-center py-12"><Loader2 size={28} className="mx-auto animate-spin text-leaf-500" /></Card>
      ) : list.length === 0 ? (
        <div className="mt-5">
          <EmptyState icon={<Database size={24} />} title="ไม่พบรายการ" hint="ลองเปลี่ยนคำค้น หรือกดเพิ่มรายการใหม่" />
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {list.map((it) => (
            <li key={it.id}>
              <Card className="py-4!">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {it.official ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-leaf-100 px-2.5 py-0.5 text-[11.5px] font-extrabold text-leaf-800">
                          <BadgeCheck size={12} /> อ้างอิงราชการ
                        </span>
                      ) : (
                        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11.5px] font-extrabold text-violet-900">
                          แอดมินเพิ่มเอง
                        </span>
                      )}
                      {it.edited && (
                        <span className="rounded-full bg-corn-100 px-2.5 py-0.5 text-[11.5px] font-extrabold text-corn-900">
                          แก้ไขแล้ว
                        </span>
                      )}
                    </div>
                    <p className="font-extrabold text-[15.5px] text-leaf-900 truncate">{titleOf(it)}</p>
                    <p className="text-[12px] text-leaf-500 font-mono truncate">{it.id}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {it.edited && (
                      <button
                        type="button" onClick={() => restore(it.id)}
                        title="กู้คืนกลับเป็นข้อมูลต้นฉบับ"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-leaf-700 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
                      >
                        <RotateCcw size={15} /> กู้คืน
                      </button>
                    )}
                    <button
                      type="button" onClick={() => { setEditing({ ...it }); setIsNew(false); }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-leaf-700 px-3 py-2 text-[13px] font-bold text-white hover:bg-leaf-800 transition focus-ring"
                    >
                      <Pencil size={15} /> แก้ไข
                    </button>
                    <button
                      type="button" onClick={() => remove(it)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 transition focus-ring"
                    >
                      <Trash2 size={15} /> ลบ
                    </button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* ประวัติการแก้ไข */}
      {stats && stats.audit.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-leaf-900 mb-3">
            <History size={20} className="text-leaf-600" /> ประวัติการแก้ไขล่าสุด
          </h2>
          <Card>
            <ul className="divide-y divide-leaf-50">
              {stats.audit.slice(0, 20).map((a, i) => (
                <li key={i} className="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px]">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-extrabold ${
                    a.action === 'delete' ? 'bg-rose-100 text-rose-800'
                    : a.action === 'create' ? 'bg-leaf-100 text-leaf-800'
                    : a.action === 'restore' ? 'bg-sky-100 text-sky-800'
                    : 'bg-corn-100 text-corn-900'
                  }`}>
                    {actionLabel[a.action] ?? a.action}
                  </span>
                  <span className="font-bold text-leaf-900">{a.label}</span>
                  <span className="text-leaf-500">ใน {collectionLabels[a.collection as CollectionName] ?? a.collection}</span>
                  <span className="ml-auto text-[12px] text-leaf-500">
                    {a.by} · {new Date(a.at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {editing && (
        <ItemEditor
          item={editing}
          isNew={isNew}
          collectionLabel={collectionLabels[collection]}
          onCancel={() => { setEditing(null); setIsNew(false); }}
          onSave={save}
        />
      )}
    </SiteShell>
  );
}

/* ---------------- ฟอร์มแก้ไขรายการ ---------------- */

function ItemEditor({
  item, isNew, collectionLabel, onCancel, onSave,
}: {
  item: Item;
  isNew: boolean;
  collectionLabel: string;
  onCancel: () => void;
  onSave: (item: Item) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Item>(item);
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const keys = Object.keys(draft).filter((k) => k !== 'official' && k !== 'edited');

  const setField = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }));

  async function submit() {
    if (Object.keys(jsonErrors).length) return;
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[80] no-print" role="dialog" aria-modal="true">
      <button type="button" aria-label="ปิด" className="absolute inset-0 bg-leaf-950/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="absolute inset-x-0 bottom-0 top-8 sm:inset-6 sm:top-10 mx-auto max-w-4xl rounded-t-4xl sm:rounded-4xl bg-white shadow-2xl flex flex-col overflow-hidden animate-rise">
        <header className="flex items-center gap-3 px-5 sm:px-7 py-4 border-b border-leaf-100 shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-black uppercase tracking-[0.14em] text-leaf-600">{collectionLabel}</p>
            <h2 className="text-[19px] font-extrabold text-leaf-900 truncate">
              {isNew ? 'เพิ่มรายการใหม่' : `แก้ไข: ${String(draft.nameTh ?? draft.nutrient ?? draft.id)}`}
            </h2>
          </div>
          <button type="button" onClick={onCancel} className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-50 text-leaf-800 hover:bg-leaf-100 focus-ring" aria-label="ปิด">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5">
          {isNew && (
            <Callout tone="info" title="กรอกรหัสรายการเป็นภาษาอังกฤษ">
              รหัส (id) ใช้สำหรับลิงก์และการจับคู่กับผลวิเคราะห์ของ AI ควรเป็นตัวอักษรอังกฤษตัวเล็กคั่นด้วยขีด เช่น
              <code className="mx-1 rounded bg-leaf-100 px-1.5">fall-armyworm</code> และต้องไม่ซ้ำกับรายการอื่น
            </Callout>
          )}

          {keys.map((key) => {
            const value = draft[key];
            const label = fieldLabels[key] ?? key;

            if (key === 'id') {
              return (
                <Field key={key} label={label}>
                  <input
                    type="text" value={String(value ?? '')} disabled={!isNew}
                    onChange={(e) => setField(key, e.target.value.trim())}
                    className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] font-mono disabled:bg-leaf-50 disabled:text-leaf-500 focus-ring"
                  />
                  {!isNew && <p className="mt-1 text-[12px] text-leaf-500">รหัสแก้ไขไม่ได้ เพื่อไม่ให้ลิงก์ที่มีอยู่เสีย</p>}
                </Field>
              );
            }

            if (typeof value === 'boolean') {
              return (
                <Field key={key} label={label}>
                  <label className="inline-flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={value} onChange={(e) => setField(key, e.target.checked)} className="w-5 h-5 accent-leaf-700" />
                    <span className="text-[14px] text-leaf-800">{value ? 'ใช่' : 'ไม่ใช่'}</span>
                  </label>
                </Field>
              );
            }

            if (typeof value === 'number') {
              return (
                <Field key={key} label={label}>
                  <input
                    type="number" value={value} onChange={(e) => setField(key, Number(e.target.value))}
                    className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] focus-ring"
                  />
                </Field>
              );
            }

            // อาร์เรย์ของข้อความ — แก้เป็นบรรทัดละรายการ
            if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
              return (
                <Field key={key} label={label} hint="พิมพ์บรรทัดละ 1 รายการ">
                  <textarea
                    value={(value as string[]).join('\n')}
                    onChange={(e) => setField(key, e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
                    rows={Math.min(Math.max((value as string[]).length + 1, 3), 10)}
                    className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] leading-relaxed focus-ring resize-y"
                  />
                </Field>
              );
            }

            // อาร์เรย์ของวัตถุ หรือวัตถุ — แก้เป็น JSON
            if (value !== null && typeof value === 'object') {
              const err = jsonErrors[key];
              return (
                <Field key={key} label={label} hint="แก้ไขในรูปแบบ JSON — ระบบจะตรวจไวยากรณ์ให้">
                  <textarea
                    defaultValue={JSON.stringify(value, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setField(key, parsed);
                        setJsonErrors((s) => { const n = { ...s }; delete n[key]; return n; });
                      } catch {
                        setJsonErrors((s) => ({ ...s, [key]: 'รูปแบบ JSON ยังไม่ถูกต้อง' }));
                      }
                    }}
                    rows={8}
                    className={`w-full rounded-2xl bg-white ring-1 px-4 py-3 text-[13.5px] font-mono leading-relaxed focus-ring resize-y ${
                      err ? 'ring-rose-300' : 'ring-leaf-200'
                    }`}
                  />
                  {err && <p className="mt-1 text-[12.5px] font-semibold text-rose-700">{err}</p>}
                </Field>
              );
            }

            // ข้อความธรรมดา
            const text = String(value ?? '');
            const multiline = longTextFields.has(key) || text.length > 80;
            return (
              <Field key={key} label={label}>
                {multiline ? (
                  <textarea
                    value={text} onChange={(e) => setField(key, e.target.value)} rows={3}
                    className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] leading-relaxed focus-ring resize-y"
                  />
                ) : (
                  <input
                    type="text" value={text} onChange={(e) => setField(key, e.target.value)}
                    className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] focus-ring"
                  />
                )}
              </Field>
            );
          })}
        </div>

        <footer className="flex items-center gap-3 px-5 sm:px-7 py-4 border-t border-leaf-100 shrink-0 bg-white">
          {Object.keys(jsonErrors).length > 0 && (
            <p className="text-[13px] font-semibold text-rose-700 flex items-center gap-1.5">
              <AlertTriangle size={15} /> แก้ JSON ให้ถูกต้องก่อนบันทึก
            </p>
          )}
          <button type="button" onClick={onCancel} className="ml-auto rounded-2xl bg-white px-5 py-3 font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring">
            ยกเลิก
          </button>
          <button
            type="button" onClick={submit} disabled={saving || Object.keys(jsonErrors).length > 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-leaf-700 px-5 py-3 font-bold text-white hover:bg-leaf-800 disabled:opacity-50 transition focus-ring"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            บันทึก
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13.5px] font-bold text-leaf-800 mb-1.5">
        {label}
        {hint && <span className="ml-2 font-normal text-[12px] text-leaf-500">{hint}</span>}
      </p>
      {children}
    </div>
  );
}
