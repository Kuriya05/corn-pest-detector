/**
 * lib/db.ts — ชั้นฐานข้อมูล
 * - Production (Vercel): Supabase Postgres ผ่าน POSTGRES_URL (ได้อัตโนมัติจาก Vercel ↔ Supabase integration)
 * - Local dev: SQLite ไฟล์ ../database/corn-pest.db
 *
 * ทั้งสองแบบใช้ interface เดียวกัน: execute({ sql, args }) / batch([...])
 * SQL เขียนด้วย placeholder `?` แล้วแปลงเป็น $1, $2 ... ให้ Postgres อัตโนมัติ
 */
import postgres from 'postgres';
import { createClient, type Client } from '@libsql/client';
import { join } from 'path';
import { mkdirSync } from 'fs';

type Arg = string | number | null;
export type Stmt = { sql: string; args?: Arg[] };
export type Row = Record<string, unknown>;
export type Result = { rows: Row[] };

export interface Db {
  kind: 'postgres' | 'sqlite';
  execute(stmt: Stmt | string): Promise<Result>;
  batch(stmts: Stmt[], mode?: 'write' | 'read'): Promise<void>;
}

const PG_URL =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  '';

function toPg(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

let _db: Db | null = null;
let _initialized = false;

function makePostgres(): Db {
  // ตัด query params (เช่น ?pgbouncer=true&supa=...) ที่ postgres.js ไม่รู้จักออก
  const url = PG_URL.split('?')[0];
  const sql = postgres(url, {
    ssl: 'require',
    prepare: false,       // จำเป็นสำหรับ Supabase pooler (transaction mode)
    max: 1,               // serverless: 1 connection ต่อ instance
    idle_timeout: 20,
    connect_timeout: 15,
  });
  return {
    kind: 'postgres',
    async execute(stmt) {
      const s = typeof stmt === 'string' ? { sql: stmt, args: [] } : stmt;
      const rows = await sql.unsafe(toPg(s.sql), (s.args ?? []) as never[]);
      return { rows: rows as unknown as Row[] };
    },
    async batch(stmts) {
      await sql.begin(async (tx) => {
        for (const s of stmts) await tx.unsafe(toPg(s.sql), (s.args ?? []) as never[]);
      });
    },
  };
}

function makeSqlite(): Db {
  // บน Vercel ห้ามใช้ SQLite: ระบบไฟล์เป็นแบบอ่านอย่างเดียวและถูกล้างทุกครั้งที่ server รีสตาร์ต
  // เดิมโค้ดจะสลับไปใช้ฐานข้อมูลในหน่วยความจำแบบเงียบ ๆ ทำให้ข้อมูลที่บันทึกหายไปเอง
  if (process.env.VERCEL) {
    throw new Error(
      '[db] ไม่พบตัวแปรเชื่อมต่อฐานข้อมูล (POSTGRES_URL / DATABASE_URL / SUPABASE_DB_URL) บน Vercel — ' +
      'ตรวจการเชื่อม Supabase ใน Vercel → Settings → Environment Variables แล้ว redeploy'
    );
  }
  let client: Client;
  const dir = join(process.cwd(), '..', 'database');
  try {
    mkdirSync(dir, { recursive: true });
    client = createClient({ url: `file:${join(dir, 'corn-pest.db')}` });
  } catch (err) {
    // ไม่ใช้ฐานข้อมูลในหน่วยความจำอีกต่อไป เพราะข้อมูลจะหายเมื่อปิดแอป
    throw new Error(`[db] เปิดไฟล์ SQLite ที่ ${dir} ไม่ได้: ${(err as Error).message}`);
  }
  return {
    kind: 'sqlite',
    async execute(stmt) {
      const rs = await client.execute(stmt as never);
      return { rows: rs.rows as unknown as Row[] };
    },
    async batch(stmts) {
      await client.batch(stmts.map((s) => ({ sql: s.sql, args: s.args ?? [] })), 'write');
    },
  };
}

export function getClient(): Db {
  if (!_db) {
    _db = PG_URL ? makePostgres() : makeSqlite();
    console.log(`[db] ใช้ฐานข้อมูล: ${_db.kind === 'postgres' ? 'Supabase Postgres' : 'SQLite (database/corn-pest.db)'}`);
  }
  return _db;
}

/** สร้างตารางถ้ายังไม่มี (เรียกอัตโนมัติ ไม่ต้องไปสร้างเองใน Supabase) */
export async function ensureSchema(): Promise<void> {
  if (_initialized) return;
  const db = getClient();

  const auditId = db.kind === 'postgres'
    ? 'id BIGSERIAL PRIMARY KEY'
    : 'id INTEGER PRIMARY KEY AUTOINCREMENT';

  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS items (
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
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS audit (
        ${auditId},
        at          TEXT NOT NULL,
        "by"        TEXT NOT NULL,
        action      TEXT NOT NULL,
        collection  TEXT NOT NULL,
        item_id     TEXT NOT NULL,
        label       TEXT NOT NULL
      )`,
    },
  ]);
  _initialized = true;
}
