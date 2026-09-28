/**
 * lib/db.ts — SQLite client (ใช้ @libsql/client ซึ่งเป็น pure JS/WASM ไม่ต้อง compile native)
 * ไฟล์ฐานข้อมูลอยู่ที่ ../database/corn-pest.db (นอก corn-pest-detector)
 */
import { createClient, type Client } from '@libsql/client';
import { join } from 'path';
import { mkdirSync, existsSync, readFileSync } from 'fs';

// path ไปยัง database/ folder ที่อยู่นอก corn-pest-detector
const DB_DIR  = join(process.cwd(), '..', 'database');
const DB_PATH = join(DB_DIR, 'corn-pest.db');
const SCHEMA  = join(DB_DIR, 'schema.sql');

let _client: Client | null = null;
let _initialized = false;

export function getClient(): Client {
  if (!_client) {
    mkdirSync(DB_DIR, { recursive: true });
    _client = createClient({ url: `file:${DB_PATH}` });
  }
  return _client;
}

/** เรียกครั้งแรกเพื่อสร้างตาราง (ต้อง await ก่อนใช้งาน) */
export async function ensureSchema(): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  const client = getClient();

  let schemaSql: string;
  if (existsSync(SCHEMA)) {
    schemaSql = readFileSync(SCHEMA, 'utf8');
  } else {
    schemaSql = `
      CREATE TABLE IF NOT EXISTS items (
        collection  TEXT NOT NULL,
        item_id     TEXT NOT NULL,
        is_seed     INTEGER NOT NULL DEFAULT 0,
        is_deleted  INTEGER NOT NULL DEFAULT 0,
        data        TEXT NOT NULL,
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL,
        created_by  TEXT,
        updated_by  TEXT,
        PRIMARY KEY (collection, item_id)
      );
      CREATE TABLE IF NOT EXISTS audit (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        at          TEXT NOT NULL,
        by          TEXT NOT NULL,
        action      TEXT NOT NULL,
        collection  TEXT NOT NULL,
        item_id     TEXT NOT NULL,
        label       TEXT NOT NULL
      );
    `;
  }

  // แยกแต่ละ statement ออกมาและรัน batch
  const statements = schemaSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((sql) => ({ sql }));

  if (statements.length > 0) {
    await client.batch(statements, 'write');
  }
}
