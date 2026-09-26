/**
 * ชั้นเก็บข้อมูลของคลังความรู้
 *
 * แนวคิด: ข้อมูลตั้งต้น (seed) อยู่ในไฟล์โค้ด lib/data/*.ts ซึ่งอ้างอิงเอกสารราชการ
 * ส่วนที่แอดมินเพิ่ม แก้ หรือลบ จะถูกบันทึกแยกไว้ใน data/overrides.json
 * เวลาอ่านจะนำสองส่วนมาซ้อนกัน ทำให้ข้อมูลต้นฉบับไม่ถูกทำลาย และย้อนกลับได้เสมอ
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { pests } from './data/pests';
import { diseases } from './data/diseases';
import { biologicals } from './data/biologicals';
import { weeds } from './data/weeds';
import { varieties } from './data/varieties';
import { deficiencies } from './data/fertilizer';
import { allChemicals } from './data/chemicals';
import { COLLECTIONS, titleField, collectionLabels, type CollectionName } from './collections';

export { COLLECTIONS, collectionLabels, titleField } from './collections';
export type { CollectionName } from './collections';

export type Item = Record<string, unknown> & { id: string };

export type AuditEntry = {
  at: string;
  by: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  collection: CollectionName;
  id: string;
  label: string;
};

type CollectionOverride = {
  /** แก้ไขทับรายการเดิม (เก็บทั้งรายการที่แก้แล้ว) */
  edits: Record<string, Item>;
  /** รายการที่แอดมินเพิ่มเอง */
  added: Item[];
  /** id ของรายการตั้งต้นที่ถูกซ่อน */
  removed: string[];
};

export type StoreFile = {
  version: number;
  updatedAt: string;
  collections: Record<CollectionName, CollectionOverride>;
  audit: AuditEntry[];
};

const DATA_DIR = join(process.cwd(), 'data');
const STORE_PATH = join(DATA_DIR, 'overrides.json');

const emptyOverride = (): CollectionOverride => ({ edits: {}, added: [], removed: [] });

function emptyStore(): StoreFile {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    collections: Object.fromEntries(COLLECTIONS.map((c) => [c, emptyOverride()])) as StoreFile['collections'],
    audit: [],
  };
}

/** ข้อมูลตั้งต้นจากไฟล์โค้ด */
function seedOf(name: CollectionName): Item[] {
  const map: Record<CollectionName, unknown[]> = {
    pests, diseases, biologicals, weeds, varieties, deficiencies,
    chemicals: allChemicals,
  };
  return map[name] as Item[];
}

export async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as StoreFile;
    // เติมหมวดที่อาจยังไม่มีในไฟล์เก่า
    for (const c of COLLECTIONS) {
      if (!parsed.collections?.[c]) {
        parsed.collections = { ...(parsed.collections ?? {}), [c]: emptyOverride() } as StoreFile['collections'];
      }
    }
    if (!Array.isArray(parsed.audit)) parsed.audit = [];
    return parsed;
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  store.updatedAt = new Date().toISOString();
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export type MergedItem = Item & {
  /** true = เป็นข้อมูลตั้งต้นที่อ้างอิงเอกสารราชการ */
  official: boolean;
  /** true = ถูกแอดมินแก้ไขทับแล้ว */
  edited: boolean;
};

/** อ่านข้อมูลของหมวดหนึ่ง โดยซ้อนสิ่งที่แอดมินแก้ไว้ทับข้อมูลตั้งต้น */
export async function getCollection(name: CollectionName): Promise<MergedItem[]> {
  const store = await readStore();
  const ov = store.collections[name] ?? emptyOverride();
  const removed = new Set(ov.removed);

  const base = seedOf(name)
    .filter((it) => !removed.has(it.id))
    .map((it) => {
      const edit = ov.edits[it.id];
      return { ...(edit ?? it), official: true, edited: Boolean(edit) } as MergedItem;
    });

  const added = ov.added.map((it) => ({ ...it, official: false, edited: false }) as MergedItem);

  return [...base, ...added];
}

export async function getAllCollections(): Promise<Record<CollectionName, MergedItem[]>> {
  const entries = await Promise.all(COLLECTIONS.map(async (c) => [c, await getCollection(c)] as const));
  return Object.fromEntries(entries) as Record<CollectionName, MergedItem[]>;
}

function labelOf(name: CollectionName, item: Item): string {
  const field = titleField[name];
  const v = item[field];
  return typeof v === 'string' && v ? v : item.id;
}

/** สร้าง id ใหม่จากข้อความ ให้ไม่ซ้ำกับของเดิม */
export function makeId(name: CollectionName, raw: string, existing: string[]): string {
  const base =
    raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40) || `${name}-item`;
  let id = base;
  let n = 2;
  while (existing.includes(id)) id = `${base}-${n++}`;
  return id;
}

/** เพิ่มหรือแก้ไขรายการ */
export async function saveItem(
  name: CollectionName,
  item: Item,
  by: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!item.id || typeof item.id !== 'string') return { ok: false, error: 'รายการนี้ไม่มีรหัส (id)' };

  const store = await readStore();
  const ov = store.collections[name] ?? emptyOverride();
  const seedIds = seedOf(name).map((x) => x.id);
  const isSeed = seedIds.includes(item.id);
  const addedIndex = ov.added.findIndex((x) => x.id === item.id);

  let action: AuditEntry['action'];
  if (isSeed) {
    ov.edits[item.id] = item;
    // ถ้าเคยถูกลบไว้ การแก้ไขถือว่านำกลับมาแสดง
    ov.removed = ov.removed.filter((r) => r !== item.id);
    action = 'update';
  } else if (addedIndex >= 0) {
    ov.added[addedIndex] = item;
    action = 'update';
  } else {
    ov.added.push(item);
    action = 'create';
  }

  store.collections[name] = ov;
  store.audit.unshift({ at: new Date().toISOString(), by, action, collection: name, id: item.id, label: labelOf(name, item) });
  store.audit = store.audit.slice(0, 500);
  await writeStore(store);
  return { ok: true, id: item.id };
}

/** ลบรายการ — ถ้าเป็นข้อมูลตั้งต้นจะแค่ซ่อนไว้ และกู้คืนได้ */
export async function deleteItem(
  name: CollectionName,
  id: string,
  by: string,
): Promise<{ ok: true; permanent: boolean } | { ok: false; error: string }> {
  const store = await readStore();
  const ov = store.collections[name] ?? emptyOverride();
  const seed = seedOf(name).find((x) => x.id === id);
  const addedIndex = ov.added.findIndex((x) => x.id === id);

  let label = id;
  let permanent = false;

  if (seed) {
    label = labelOf(name, ov.edits[id] ?? seed);
    if (!ov.removed.includes(id)) ov.removed.push(id);
  } else if (addedIndex >= 0) {
    label = labelOf(name, ov.added[addedIndex]);
    ov.added.splice(addedIndex, 1);
    permanent = true;
  } else {
    return { ok: false, error: 'ไม่พบรายการที่ต้องการลบ' };
  }

  store.collections[name] = ov;
  store.audit.unshift({ at: new Date().toISOString(), by, action: 'delete', collection: name, id, label });
  store.audit = store.audit.slice(0, 500);
  await writeStore(store);
  return { ok: true, permanent };
}

/** กู้คืนรายการตั้งต้นให้กลับไปเป็นค่าเดิมจากเอกสารอ้างอิง */
export async function restoreItem(
  name: CollectionName,
  id: string,
  by: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const store = await readStore();
  const ov = store.collections[name] ?? emptyOverride();
  const seed = seedOf(name).find((x) => x.id === id);
  if (!seed) return { ok: false, error: 'รายการนี้ไม่ใช่ข้อมูลตั้งต้น จึงกู้คืนไม่ได้' };

  delete ov.edits[id];
  ov.removed = ov.removed.filter((r) => r !== id);
  store.collections[name] = ov;
  store.audit.unshift({ at: new Date().toISOString(), by, action: 'restore', collection: name, id, label: labelOf(name, seed) });
  store.audit = store.audit.slice(0, 500);
  await writeStore(store);
  return { ok: true };
}

/** สรุปจำนวนรายการในแต่ละหมวด */
export async function getStats() {
  const store = await readStore();
  const out = await Promise.all(
    COLLECTIONS.map(async (c) => {
      const items = await getCollection(c);
      const ov = store.collections[c] ?? emptyOverride();
      return {
        name: c,
        label: collectionLabels[c],
        total: items.length,
        seed: seedOf(c).length,
        added: ov.added.length,
        edited: Object.keys(ov.edits).length,
        removed: ov.removed.length,
      };
    }),
  );
  return { collections: out, audit: store.audit.slice(0, 50), updatedAt: store.updatedAt };
}

export { seedOf };
