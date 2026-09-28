/**
 * lib/db.ts — SQLite client
 * - Production (Vercel): ใช้ Turso ผ่าน TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
 * - Local dev: ใช้ file:../database/corn-pest.db
 * - Fallback: in-memory (ข้อมูล seed ยังแสดงได้ แต่ไม่บันทึก)
 */
import { createClient, type Client } from '@libsql/client';
import { join } from 'path';
import { mkdirSync } from 'fs';

let _client: Client | null = null;
let _initialized = false;

export function getClient(): Client {
  if (!_client) {
    const tursoUrl   = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl) {
      // Production: Turso serverless SQLite
      _client = createClient({ url: tursoUrl, authToken: tursoToken });
    } else {
      // Local dev: ไฟล์ SQLite ในเครื่อง
      try {
        const DB_DIR  = join(process.cwd(), '..', 'database');
        const DB_PATH = join(DB_DIR, 'corn-pest.db');
        mkdirSync(DB_DIR, { recursive: true });
        _client = createClient({ url: `file:${DB_PATH}` });
      } catch {
        // Fallback: in-memory (เช่น Vercel ไม่มี Turso env)
        _client = createClient({ url: 'file::memory:?cache=shared' });
      }
    }
  }
  return _client;
}

/** เรียกครั้งแรกเพื่อสร้างตาราง */
export async function ensureSchema(): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  const client = getClient();
  const schemaSql = `
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

  const statements = schemaSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((sql) => ({ sql }));

  if (statements.length > 0) {
    await client.batch(statements, 'write');
  }
}
