'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown, ShieldCheck, Search, Plus, Pencil, Trash2, RotateCcw, Save, X, Loader2,
  Download, History, Database, AlertTriangle, CheckCircle2, LogOut, BadgeCheck,
  ImagePlus, Trash, Eye,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Callout, EmptyState } from '@/components/ui';
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

  /** โครงสร้างเริ่มต้นของแต่ละหมวด ใช้เมื่อยังไม่มีข้อมูลตั้งต้นในหน้า */
  const BLANK_TEMPLATES: Record<CollectionName, Record<string, unknown>> = {
    pests: {
      nameTh: '', nameEn: '', scientific: '', aliases: [],
      severity: 'low', summary: '', identify: [], stage: '',
      damage: [], threshold: '', season: '', cultural: [],
      biological: [], chemicals: [], warnings: [], sources: [], matchKeywords: [],
    },
    diseases: {
      nameTh: '', nameEn: '', pathogen: '', kind: 'เชื้อรา',
      severity: 'low', summary: '', symptoms: [], distinguish: '',
      conditions: '', stage: '', lossImpact: '', resistantVarieties: [],
      cultural: [], chemicals: [], warnings: [], sources: [], matchKeywords: [],
    },
    biologicals: {
      nameTh: '', nameEn: '', scientific: '', kind: 'เชื้อรา',
      summary: '', controls: [], maizeSpecific: false, rate: '',
      howTo: [], cautions: [], sources: [], matchKeywords: [],
    },
    weeds: {
      nameTh: '', localNames: [], nameEn: '', scientific: '',
      group: 'ใบแคบ', lifeCycle: 'ฤดูเดียว', frequency: '',
      summary: '', identify: [], impact: '', cultural: [],
      herbicides: [], sources: [], matchKeywords: [],
    },
    varieties: {
      nameTh: '', code: '', cropType: 'เลี้ยงสัตว์', hybridType: 'ลูกผสมเดี่ยว',
      org: '', certifiedYear: '', yield: '', yieldDrought: '',
      maturityDays: '', silkingDays: '', plantHeight: '', earHeight: '',
      resistance: [], strengths: [], recommendedFor: '', seedSource: '',
      notes: [], sources: [], matchKeywords: [],
    },
    deficiencies: {
      nutrient: '', symbol: '', color: '', quickSign: '',
      cause: '', fix: [], sources: [],
    },
    chemicals: {
      nameTh: '', nameEn: '', category: '', chemClass: '',
      mode: '', formulations: '', uses: [], timing: '',
      restricted: false, restrictedReason: '', sources: [], matchKeywords: [],
    },
  };

  function blankItem(): Item {
    const template = items.find((i) => i.official) ?? items[0];
    // สร้าง id แบบสุ่มเพื่อกันซ้ำ: prefix-timestamp-random
    const pre = collection.slice(0, 4);
    const randId = `${pre}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    // ใช้ template จาก items ที่โหลดมา หรือ fallback เป็นโครงสร้างคงที่ตามหมวด
    const fallback = BLANK_TEMPLATES[collection] ?? {};
    const blank: Item = { id: randId, images: [], ...fallback };
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
    if (!('images' in blank)) blank.images = [];
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

      {/* เลือกหมวด (dropdown) */}
      <div className="mt-6">
        <label htmlFor="collection-select" className="block text-[13px] font-semibold text-leaf-700 mb-1.5">
          เลือกหมวดข้อมูล
        </label>
        <div className="relative">
          <select
            id="collection-select"
            value={collection}
            onChange={(e) => { setCollection(e.target.value as CollectionName); setEditing(null); setQuery(''); }}
            className="w-full appearance-none rounded-2xl border border-leaf-200 bg-white px-4 py-3 pr-11 text-[15px] font-semibold text-leaf-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 cursor-pointer"
          >
            {COLLECTIONS.map((c) => {
              const n = stats?.collections.find((x) => x.name === c)?.total;
              return (
                <option key={c} value={c}>
                  {collectionLabels[c]}{typeof n === 'number' ? ` (${n})` : ''}
                </option>
              );
            })}
          </select>
          <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-leaf-600" />
        </div>
      </div>

      {/* สถิติ */}
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

      {current && current.removed > 0 && (
        <div className="mt-4">
          <Callout tone="warn" title={`มี ${current.removed} รายการที่ถูกซ่อนอยู่`}>
            รายการเหล่านี้ยังอยู่ในระบบแต่ไม่แสดงให้เกษตรกรเห็น — กดกู้คืนได้จากรายการด้านล่าง
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
                  {/* รูปภาพ thumbnail */}
                  {Array.isArray(it.images) && (it.images as string[]).length > 0 && (
                    <div className="shrink-0 w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-leaf-100 bg-leaf-50">
                      <img src={(it.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

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
                      {Array.isArray(it.images) && (it.images as string[]).length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11.5px] font-extrabold text-sky-800">
                          <Eye size={11} /> มีรูปภาพ
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
          collection={collection}
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
  item, isNew, collection, collectionLabel, onCancel, onSave,
}: {
  item: Item;
  isNew: boolean;
  collection: CollectionName;
  collectionLabel: string;
  onCancel: () => void;
  onSave: (item: Item) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Item>(() => {
    // migrate: imageUrl (เดิม) → images array (ใหม่)
    const base = { ...item };
    if (!('images' in base)) {
      const legacy = (base as Record<string,unknown>).imageUrl;
      base.images = legacy ? [legacy as string] : [];
      delete (base as Record<string,unknown>).imageUrl;
    }
    return base;
  });
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // จัด images มาอยู่หน้าสุดเสมอ
  const keys = ['images', ...Object.keys(draft).filter((k) => !['official', 'edited', 'images', 'imageUrl'].includes(k))];

  const setField = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }));

  async function uploadImage(file: File, currentUrls: string[]) {
    setUploadingImage(true);
    setImageError(null);
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('collection', collection);
      form.append('itemId', draft.id || 'new');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'อัปโหลดไม่สำเร็จ');
      setField('images', [...currentUrls, data.url as string]);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploadingImage(false);
    }
  }

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
            <Callout tone="info" title="รหัสสุ่มอัตโนมัติ">
              ระบบสร้างรหัสให้อัตโนมัติเพื่อป้องกันข้อมูลซ้ำ — ไม่ต้องกรอกเอง
            </Callout>
          )}

          {keys.map((key) => {
            const value = draft[key];
            const label = fieldLabels[key] ?? key;

            /* ---- รูปภาพ (หลายรูป) ---- */
            if (key === 'images') {
              const urls: string[] = Array.isArray(value) ? (value as string[]) : [];
              return (
                <Field key={key} label="รูปภาพประกอบ" hint="jpg, png, webp ไม่เกิน 8 MB ต่อรูป | เพิ่มได้หลายรูป | กด Enter หลังวาง URL">
                  {/* preview grid */}
                  {urls.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {urls.map((url, idx) => (
                        <div key={idx} className="relative">
                          <img src={url} alt={`รูปที่ ${idx + 1}`}
                            className="h-28 w-auto max-w-[180px] rounded-2xl object-cover ring-1 ring-leaf-200" />
                          <button type="button"
                            onClick={() => setField('images', urls.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 grid place-items-center w-7 h-7 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition"
                            title={`ลบรูปที่ ${idx + 1}`}>
                            <Trash size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-3 h-32 w-full rounded-2xl bg-leaf-50 ring-1 ring-dashed ring-leaf-300 flex flex-col items-center justify-center gap-2 text-leaf-400">
                      <ImagePlus size={28} className="opacity-40" />
                      <span className="text-[14px]">ยังไม่มีรูปภาพ</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? []);
                        let cur = [...urls];
                        for (const f of files) {
                          await uploadImage(f, cur);
                          cur = [...cur]; // refresh after each
                        }
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-2 rounded-xl bg-leaf-700 px-4 py-2.5 text-[14px] font-bold text-white hover:bg-leaf-800 disabled:opacity-60 transition focus-ring"
                    >
                      {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                      {uploadingImage ? 'กำลังอัปโหลด…' : 'เพิ่มรูปภาพ'}
                    </button>
                    <input
                      type="url"
                      placeholder="วาง URL รูปแล้วกด Enter…"
                      className="flex-1 min-w-[200px] rounded-xl bg-white ring-1 ring-leaf-200 px-3 py-2.5 text-[14px] focus-ring"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) { setField('images', [...urls, val]); (e.target as HTMLInputElement).value = ''; }
                        }
                      }}
                    />
                  </div>
                  {imageError && <p className="mt-2 text-[13px] font-semibold text-rose-700">{imageError}</p>}
                </Field>
              );
            }

            if (key === 'id') {
              return (
                <Field key={key} label={label}>
                  <div className="flex gap-2">
                    <input
                      type="text" value={String(value ?? '')} readOnly
                      className="flex-1 rounded-2xl bg-leaf-50 ring-1 ring-leaf-200 px-4 py-3 text-[15px] font-mono text-leaf-600 focus-ring"
                    />
                    {isNew && (
                      <button type="button"
                        onClick={() => {
                          const pre = collection.slice(0, 4);
                          setField('id', `${pre}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`);
                        }}
                        className="shrink-0 rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[13px] font-bold text-leaf-700 hover:bg-leaf-50 transition focus-ring"
                        title="สุ่มรหัสใหม่"
                      >สุ่มใหม่</button>
                    )}
                  </div>
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

            /* ---- ฟิลด์ที่มีตัวเลือกคงที่ ---- */
            {/* kind (โรค/ชีวภัณฑ์), severity, lifeCycle, cropType, hybridType, group (วัชพืช) */}
            const FIXED_OPTIONS: Record<string, { v: string; l: string }[]> = {
              severity: [
                { v: 'low',      l: '🟢 เฝ้าระวัง' },
                { v: 'medium',   l: '🟡 ปานกลาง' },
                { v: 'high',     l: '🟠 รุนแรง' },
                { v: 'critical', l: '🔴 รุนแรงที่สุด' },
              ],
              lifeCycle: [
                { v: 'ฤดูเดียว', l: 'ฤดูเดียว (Annual)' },
                { v: 'ข้ามปี',   l: 'ข้ามปี (Perennial)' },
              ],
              cropType: [
                { v: 'เลี้ยงสัตว์', l: 'เลี้ยงสัตว์' },
                { v: 'หวาน',        l: 'หวาน' },
                { v: 'ข้าวเหนียว',  l: 'ข้าวเหนียว' },
                { v: 'เทียน',       l: 'เทียน' },
                { v: 'ฝักอ่อน',    l: 'ฝักอ่อน' },
              ],
              hybridType: [
                { v: 'ลูกผสมเดี่ยว',    l: 'ลูกผสมเดี่ยว (Single cross)' },
                { v: 'ลูกผสมสามทาง',   l: 'ลูกผสมสามทาง (Three-way cross)' },
                { v: 'ผสมเปิด',         l: 'ผสมเปิด (Open-pollinated)' },
                { v: 'พันธุ์รับรอง',    l: 'พันธุ์รับรอง' },
              ],
            };
            const KIND_OPTS: Record<string, { v: string; l: string }[]> = {
              diseases: [
                { v: 'เชื้อรา',    l: '🍄 เชื้อรา' },
                { v: 'แบคทีเรีย', l: '🦠 แบคทีเรีย' },
                { v: 'ไวรัส',     l: '🧬 ไวรัส' },
              ],
              biologicals: [
                { v: 'เชื้อรา',          l: '🍄 เชื้อรา' },
                { v: 'แบคทีเรีย',       l: '🦠 แบคทีเรีย' },
                { v: 'ไวรัส',           l: '🧬 ไวรัส' },
                { v: 'แมลงตัวห้ำ',      l: '🐞 แมลงตัวห้ำ' },
                { v: 'แมลงตัวเบียน',    l: '🦟 แมลงตัวเบียน' },
                { v: 'ไส้เดือนฝอย',    l: '🪱 ไส้เดือนฝอย' },
                { v: 'โปรโตซัว',        l: '🔬 โปรโตซัว' },
                { v: 'สารสกัดจากพืช',  l: '🌿 สารสกัดจากพืช' },
              ],
            };
            const WEED_GROUP_OPTS = [
              { v: 'ใบแคบ', l: '🌾 ใบแคบ (Grass)' },
              { v: 'ใบกว้าง', l: '🍃 ใบกว้าง (Broadleaf)' },
              { v: 'กก', l: '🌱 กก (Sedge)' },
            ];

            let fixedOpts: { v: string; l: string }[] | null = null;
            if (key === 'severity')  fixedOpts = FIXED_OPTIONS.severity;
            else if (key === 'lifeCycle') fixedOpts = FIXED_OPTIONS.lifeCycle;
            else if (key === 'cropType')  fixedOpts = FIXED_OPTIONS.cropType;
            else if (key === 'hybridType') fixedOpts = FIXED_OPTIONS.hybridType;
            else if (key === 'kind' && KIND_OPTS[collection]) fixedOpts = KIND_OPTS[collection];
            else if (key === 'group' && collection === 'weeds') fixedOpts = WEED_GROUP_OPTS;

            if (fixedOpts) {
              const cur = String(value ?? fixedOpts[0]?.v ?? '');
              return (
                <Field key={key} label={label}>
                  <select
                    value={cur}
                    onChange={(e) => setField(key, e.target.value)}
                    className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[16px] font-semibold text-leaf-900 focus-ring cursor-pointer"
                  >
                    {fixedOpts.map((opt) => (
                      <option key={opt.v} value={opt.v}>{opt.l}</option>
                    ))}
                  </select>
                </Field>
              );
            }

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
