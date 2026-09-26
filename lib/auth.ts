/**
 * ระบบล็อกอินอย่างง่ายสำหรับผู้ดูแลระบบ
 * ใช้คุกกี้ที่เซ็นด้วย HMAC-SHA256 ไม่ต้องมีฐานข้อมูลผู้ใช้
 *
 * ข้อจำกัดที่ควรรู้: ออกแบบมาสำหรับการใช้งานภายในหน่วยงานหรือการเรียนการสอน
 * ถ้าจะเปิดสู่อินเทอร์เน็ตสาธารณะ ควรเปลี่ยนไปใช้ระบบผู้ใช้จริงที่เก็บรหัสผ่านแบบแฮช
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export type Role = 'admin' | 'guest';

export type Session = {
  username: string;
  role: Role;
  /** เวลาหมดอายุ (epoch millis) */
  exp: number;
};

export const COOKIE_NAME = 'maize_session';
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 ชั่วโมง

function secret(): string {
  return process.env.AUTH_SECRET || 'maize-dev-secret-change-me';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function createToken(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): Session | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  if (!safeEqual(sig, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Session;
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

/** ตรวจสอบชื่อผู้ใช้และรหัสผ่านจากค่าใน .env.local */
export function checkCredentials(username: string, password: string): Session | null {
  const u = process.env.ADMIN_USERNAME || 'admin';
  const p = process.env.ADMIN_PASSWORD || '';
  if (!p) return null;
  if (username.trim() !== u) return null;
  if (!safeEqual(password, p)) return null;
  return { username: u, role: 'admin', exp: Date.now() + MAX_AGE_SECONDS * 1000 };
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: MAX_AGE_SECONDS,
  secure: process.env.NODE_ENV === 'production',
};

/** อ่านเซสชันปัจจุบันจากคุกกี้ (ใช้ได้เฉพาะฝั่งเซิร์ฟเวอร์) */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export async function requireAdmin(): Promise<Session | null> {
  const session = await getSession();
  return session?.role === 'admin' ? session : null;
}

/** ตั้งค่ารหัสผ่านแอดมินไว้หรือยัง */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}
