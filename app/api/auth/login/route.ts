import { NextResponse } from 'next/server';
import { checkCredentials, createToken, COOKIE_NAME, cookieOptions, isAuthConfigured } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: 'ยังไม่ได้ตั้งค่า ADMIN_PASSWORD ในไฟล์ .env.local' },
      { status: 503 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }, { status: 400 });
  }

  const session = checkCredentials(body.username ?? '', body.password ?? '');
  if (!session) {
    return NextResponse.json({ success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true, username: session.username, role: session.role });
  res.cookies.set(COOKIE_NAME, createToken(session), cookieOptions);
  return res;
}
