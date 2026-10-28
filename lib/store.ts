/**
 * ชั้นเก็บข้อมูลของคลังความรู้ (libsql edition — async API)
 *
 * ฐานข้อมูลคือแหล่งข้อมูลเดียวของหน้าเว็บ — ไฟล์ lib/data/*.ts ใช้เป็นชุดข้อมูลนำเข้าครั้งแรกเท่านั้น
 * (ensureSeeded จะเขียนรายการที่ยังไม่มีลงฐานข้อมูล แล้วทุกการอ่านดึงจากฐานข้อมูลอย่างเดียว)
 */

import { getClient, ensureSchema } from './db';
import { normalizeItem } from './normalize';
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

export type MergedItem = Item & {
  official: boolean;
  edited: boolean;
};

/** ข้อมูลตั้งต้นจากไฟล์โค้ด */
function seedOf(name: CollectionName): Item[] {
  const map: Record<CollectionName, unknown[]> = {
    pests, diseases, biologicals, weeds, varieties, deficiencies,
    chemicals: allChemicals,
  };
  return map[name] as Item[];
}

function labelOf(name: CollectionName, item: Item): string {
  const field = titleField[name];
  const v = item[field];
  return typeof v === 'string' && v ? v : item.id;
}

/** สร้าง id ใหม่จากข้อความ ให้ไม่ซ้ำกับของเดิม */
export function makeId(name: CollectionName, raw: string, existing: string[]): string {
  const base =
    raw.trim().toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40) || `${name}-item`;
  let id = base;
  let n = 2;
  while (existing.includes(id)) id = `${base}-${n++}`;
  return id;
}

// ─── นำเข้าข้อมูลตั้งต้นลงฐานข้อมูล ─────────────────────────

const SEED_BY = 'system';
let _seeded: Promise<void> | null = null;

/** ลายนิ้วมือของชุดข้อมูลตั้งต้น — เปลี่ยนเมื่อเพิ่มรายการใหม่ในไฟล์ จึงนำเข้าเฉพาะตอนที่จำเป็น */
function seedVersion(): string {
  let h = 5381;
  for (const c of COLLECTIONS) {
    for (const it of seedOf(c)) {
      const s = `${c}:${it.id}|`;
      for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
  }
  return `v1-${(h >>> 0).toString(36)}`;
}

/** เขียนข้อมูลตั้งต้นที่ยังไม่มีลงฐานข้อมูล (ไม่ทับรายการที่แอดมินแก้หรือลบไว้) */
export function ensureSeeded(): Promise<void> {
  if (!_seeded) {
    _seeded = (async () => {
      await ensureSchema();
      const client = getClient();
      await client.execute('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
      const version = seedVersion();
      const rs = await client.execute({ sql: 'SELECT value FROM meta WHERE key = ?', args: ['seed_version'] });
      if (rs.rows[0]?.value === version) return;

      const now = new Date().toISOString();
      const stmts = COLLECTIONS.flatMap((c) =>
        seedOf(c).map((it) => ({
          sql: `INSERT INTO items (collection, item_id, is_seed, is_deleted, data, created_at, updated_at, created_by, updated_by)
                VALUES (?, ?, 1, 0, ?, ?, ?, ?, ?)
                ON CONFLICT(collection, item_id) DO UPDATE SET
                  data = CASE WHEN items.data = '{}' THEN excluded.data ELSE items.data END`,
          args: [c, it.id, JSON.stringify(it), now, now, SEED_BY, SEED_BY],
        })),
      );
      stmts.push({
        sql: `INSERT INTO meta (key, value) VALUES ('seed_version', ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        args: [version],
      });
      await client.batch(stmts, 'write');
      console.log(`[store] นำเข้าข้อมูลตั้งต้นลงฐานข้อมูลแล้ว (${stmts.length - 1} รายการ)`);
    })().catch((err) => {
      _seeded = null; // ให้ลองใหม่ในคำขอถัดไป
      throw err;
    });
  }
  return _seeded;
}

// ─── Queries ────────────────────────────────────────────────

type DbRow = { item_id: string; is_seed: number; is_deleted: number; data: string };

/** อ่านข้อมูลของหมวดหนึ่งจากฐานข้อมูล */
export async function getCollection(name: CollectionName): Promise<MergedItem[]> {
  await ensureSeeded();
  const client = getClient();

  const rs = await client.execute({
    sql: 'SELECT item_id, is_seed, data, created_at, updated_by FROM items WHERE collection = ? AND is_deleted = 0',
    args: [name],
  });

  // เรียงตามลำดับในชุดข้อมูลตั้งต้น แล้วตามด้วยรายการที่เพิ่มภายหลังตามเวลาที่สร้าง
  const order = new Map(seedOf(name).map((it, i) => [it.id, i]));
  const rows = [...rs.rows].sort((a, b) => {
    const ia = order.get(a.item_id as string) ?? Infinity;
    const ib = order.get(b.item_id as string) ?? Infinity;
    if (ia !== ib) return ia - ib;
    return String(a.created_at).localeCompare(String(b.created_at));
  });

  const out: MergedItem[] = [];
  for (const row of rows) {
    let parsed: Item;
    try { parsed = JSON.parse(row.data as string) as Item; } catch { continue; }
    if (!parsed || typeof parsed !== 'object') continue;
    const official = Boolean(Number(row.is_seed));
    out.push({
      ...normalizeItem(name, { ...parsed, id: row.item_id as string }),
      official,
      edited: official && row.updated_by !== SEED_BY,
    } as MergedItem);
  }
  return out;
}

export async function getAllCollections(): Promise<Record<CollectionName, MergedItem[]>> {
  const entries = await Promise.all(
    COLLECTIONS.map(async (c) => [c, await getCollection(c)] as const)
  );
  return Object.fromEntries(entries) as Record<CollectionName, MergedItem[]>;
}

/** เพิ่มหรือแก้ไขรายการ */
export async function saveItem(
  name: CollectionName,
  item: Item,
  by: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!item.id || typeof item.id !== 'string') return { ok: false, error: 'รายการนี้ไม่มีรหัส (id)' };

  await ensureSeeded();
  const client = getClient();
  const now = new Date().toISOString();
  const seedIds = new Set(seedOf(name).map((x) => x.id));
  const isSeed = seedIds.has(item.id) ? 1 : 0;

  // ตรวจสอบว่ามีอยู่แล้วหรือเปล่า
  const existRs = await client.execute({
    sql: 'SELECT item_id FROM items WHERE collection = ? AND item_id = ?',
    args: [name, item.id],
  });
  const exists = existRs.rows.length > 0;
  const action = exists ? 'update' : 'create';

  await client.batch([
    {
      sql: `INSERT INTO items (collection, item_id, is_seed, is_deleted, data, created_at, updated_at, created_by, updated_by)
            VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?)
            ON CONFLICT(collection, item_id) DO UPDATE SET
              is_deleted = 0,
              data = excluded.data,
              updated_at = excluded.updated_at,
              updated_by = excluded.updated_by`,
      args: [name, item.id, isSeed, JSON.stringify(item), now, now, exists ? null : by, by],
    },
    {
      sql: `INSERT INTO audit (at, "by", action, collection, item_id, label) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [now, by, action, name, item.id, labelOf(name, item)],
    },
  ], 'write');

  return { ok: true, id: item.id };
}

/** ลบรายการ */
export async function deleteItem(
  name: CollectionName,
  id: string,
  by: string,
): Promise<{ ok: true; permanent: boolean } | { ok: false; error: string }> {
  await ensureSeeded();
  const client = getClient();
  const now = new Date().toISOString();
  const seed = seedOf(name).find((x) => x.id === id);

  const rowRs = await client.execute({
    sql: 'SELECT item_id, is_seed, data FROM items WHERE collection = ? AND item_id = ?',
    args: [name, id],
  });
  const row = rowRs.rows[0] as unknown as DbRow | undefined;

  let label = id;
  let permanent = false;

  if (seed) {
    // seed item — soft delete
    const item = row ? (JSON.parse(row.data as string) as Item) : seed;
    label = labelOf(name, item);
    await client.batch([
      {
        sql: `INSERT INTO items (collection, item_id, is_seed, is_deleted, data, created_at, updated_at, created_by, updated_by)
              VALUES (?, ?, 1, 1, '{}', ?, ?, ?, ?)
              ON CONFLICT(collection, item_id) DO UPDATE SET
                is_deleted = 1,
                updated_at = excluded.updated_at,
                updated_by = excluded.updated_by`,
        args: [name, id, now, now, null, by],
      },
      {
        sql: `INSERT INTO audit (at, "by", action, collection, item_id, label) VALUES (?, ?, 'delete', ?, ?, ?)`,
        args: [now, by, name, id, label],
      },
    ], 'write');
  } else if (row) {
    // custom item — hard delete
    label = labelOf(name, JSON.parse(row.data as string) as Item);
    await client.batch([
      {
        sql: 'DELETE FROM items WHERE collection = ? AND item_id = ?',
        args: [name, id],
      },
      {
        sql: `INSERT INTO audit (at, "by", action, collection, item_id, label) VALUES (?, ?, 'delete', ?, ?, ?)`,
        args: [now, by, name, id, label],
      },
    ], 'write');
    permanent = true;
  } else {
    return { ok: false, error: 'ไม่พบรายการที่ต้องการลบ' };
  }

  return { ok: true, permanent };
}

/** กู้คืนรายการตั้งต้น */
export async function restoreItem(
  name: CollectionName,
  id: string,
  by: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const seed = seedOf(name).find((x) => x.id === id);
  if (!seed) return { ok: false, error: 'รายการนี้ไม่ใช่ข้อมูลตั้งต้น จึงกู้คืนไม่ได้' };

  await ensureSeeded();
  const client = getClient();
  const now = new Date().toISOString();

  await client.batch([
    {
      sql: `INSERT INTO items (collection, item_id, is_seed, is_deleted, data, created_at, updated_at, created_by, updated_by)
            VALUES (?, ?, 1, 0, ?, ?, ?, ?, ?)
            ON CONFLICT(collection, item_id) DO UPDATE SET
              is_deleted = 0,
              data = excluded.data,
              updated_at = excluded.updated_at,
              updated_by = excluded.updated_by`,
      args: [name, id, JSON.stringify(seed), now, now, SEED_BY, SEED_BY],
    },
    {
      sql: `INSERT INTO audit (at, "by", action, collection, item_id, label) VALUES (?, ?, 'restore', ?, ?, ?)`,
      args: [now, by, name, id, labelOf(name, seed)],
    },
  ], 'write');

  return { ok: true };
}

/** สรุปสถิติ */
export async function getStats() {
  await ensureSeeded();
  const client = getClient();
  const now = new Date().toISOString();

  const collections = await Promise.all(
    COLLECTIONS.map(async (c) => {
      const items = await getCollection(c);

      const rowsRs = await client.execute({
        sql: 'SELECT is_seed, is_deleted, updated_by FROM items WHERE collection = ?',
        args: [c],
      });
      const rows = rowsRs.rows;

      return {
        name: c,
        label: collectionLabels[c],
        total: items.length,
        seed: seedOf(c).length,
        added: rows.filter((r) => !Number(r.is_seed) && !Number(r.is_deleted)).length,
        edited: rows.filter((r) => Number(r.is_seed) && !Number(r.is_deleted) && r.updated_by !== SEED_BY).length,
        removed: rows.filter((r) => Number(r.is_seed) && Number(r.is_deleted)).length,
      };
    })
  );

  const auditRs = await client.execute(
    'SELECT at, "by" AS "by", action, collection, item_id AS id, label FROM audit ORDER BY audit.id DESC LIMIT 50'
  );
  const audit = auditRs.rows as unknown as AuditEntry[];

  return { collections, audit, updatedAt: now };
}

export { seedOf };

/** ดึง overrides ดิบจาก DB ทั้งหมด (สำหรับ export) */
export async function readStore(): Promise<Record<string, unknown[]>> {
  await ensureSeeded();
  const client = getClient();
  const result: Record<string, unknown[]> = {};
  for (const col of COLLECTIONS) {
    const rs = await client.execute({ sql: 'SELECT data FROM items WHERE collection = ? AND is_deleted = 0', args: [col] });
    result[col] = rs.rows.map((r) => JSON.parse(r.data as string));
  }
  return result;
}
