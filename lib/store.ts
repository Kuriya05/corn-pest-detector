/**
 * ชั้นเก็บข้อมูลของคลังความรู้ (libsql edition — async API)
 *
 * ข้อมูลตั้งต้น (seed) อยู่ในไฟล์โค้ด lib/data/*.ts
 * ส่วนที่แอดมินเพิ่ม แก้ หรือลบ จะถูกบันทึกลง SQLite ที่ ../database/corn-pest.db
 */

import { getClient, ensureSchema } from './db';
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

// ─── Queries ────────────────────────────────────────────────

type DbRow = { item_id: string; is_seed: number; is_deleted: number; data: string };

/** อ่านข้อมูลของหมวดหนึ่ง โดยซ้อนสิ่งที่แอดมินแก้ไว้ทับข้อมูลตั้งต้น */
export async function getCollection(name: CollectionName): Promise<MergedItem[]> {
  await ensureSchema();
  const client = getClient();

  const rs = await client.execute({
    sql: 'SELECT item_id, is_seed, is_deleted, data FROM items WHERE collection = ?',
    args: [name],
  });

  const editMap = new Map<string, Item>();
  const deletedSeedIds = new Set<string>();
  const addedItems: Item[] = [];

  for (const row of rs.rows) {
    const item_id   = row.item_id as string;
    const is_seed   = Number(row.is_seed);
    const is_deleted = Number(row.is_deleted);
    const parsed    = JSON.parse(row.data as string) as Item;

    if (is_seed) {
      if (is_deleted) deletedSeedIds.add(item_id);
      else editMap.set(item_id, parsed);
    } else {
      if (!is_deleted) addedItems.push(parsed);
    }
  }

  const base = seedOf(name)
    .filter((it) => !deletedSeedIds.has(it.id))
    .map((it) => {
      const edit = editMap.get(it.id);
      return { ...(edit ?? it), official: true, edited: Boolean(edit) } as MergedItem;
    });

  const added = addedItems.map((it) => ({ ...it, official: false, edited: false }) as MergedItem);

  return [...base, ...added];
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

  await ensureSchema();
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
      sql: `INSERT INTO audit (at, by, action, collection, item_id, label) VALUES (?, ?, ?, ?, ?, ?)`,
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
  await ensureSchema();
  const client = getClient();
  const now = new Date().toISOString();
  const seed = seedOf(name).find((x) => x.id === id);

  const rowRs = await client.execute({
    sql: 'SELECT item_id, is_seed, data FROM items WHERE collection = ? AND item_id = ?',
    args: [name, id],
  });
  const row = rowRs.rows[0] as DbRow | undefined;

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
        sql: `INSERT INTO audit (at, by, action, collection, item_id, label) VALUES (?, ?, 'delete', ?, ?, ?)`,
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
        sql: `INSERT INTO audit (at, by, action, collection, item_id, label) VALUES (?, ?, 'delete', ?, ?, ?)`,
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

  await ensureSchema();
  const client = getClient();
  const now = new Date().toISOString();

  await client.batch([
    {
      sql: 'DELETE FROM items WHERE collection = ? AND item_id = ?',
      args: [name, id],
    },
    {
      sql: `INSERT INTO audit (at, by, action, collection, item_id, label) VALUES (?, ?, 'restore', ?, ?, ?)`,
      args: [now, by, name, id, labelOf(name, seed)],
    },
  ], 'write');

  return { ok: true };
}

/** สรุปสถิติ */
export async function getStats() {
  await ensureSchema();
  const client = getClient();
  const now = new Date().toISOString();

  const collections = await Promise.all(
    COLLECTIONS.map(async (c) => {
      const items = await getCollection(c);

      const rowsRs = await client.execute({
        sql: 'SELECT is_seed, is_deleted FROM items WHERE collection = ?',
        args: [c],
      });
      const rows = rowsRs.rows;

      return {
        name: c,
        label: collectionLabels[c],
        total: items.length,
        seed: seedOf(c).length,
        added: rows.filter((r) => !Number(r.is_seed) && !Number(r.is_deleted)).length,
        edited: rows.filter((r) => Number(r.is_seed) && !Number(r.is_deleted)).length,
        removed: rows.filter((r) => Number(r.is_seed) && Number(r.is_deleted)).length,
      };
    })
  );

  const auditRs = await client.execute(
    'SELECT at, by, action, collection, item_id as id, label FROM audit ORDER BY id DESC LIMIT 50'
  );
  const audit = auditRs.rows as unknown as AuditEntry[];

  return { collections, audit, updatedAt: now };
}

export { seedOf };
