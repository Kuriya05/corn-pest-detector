import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getStats } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: 'ต้องเข้าสู่ระบบผู้ดูแลก่อน' }, { status: 401 });
  }
  return NextResponse.json({ success: true, ...(await getStats()) });
}
