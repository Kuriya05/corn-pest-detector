import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllCollections, readStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** ส่งออกคลังความรู้ทั้งหมดเป็นไฟล์ JSON สำหรับสำรองข้อมูล */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: 'ต้องเข้าสู่ระบบผู้ดูแลก่อน' }, { status: 401 });
  }

  const [collections, store] = await Promise.all([getAllCollections(), readStore()]);
  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), exportedBy: session.username, collections, overrides: store },
    null,
    2,
  );

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="maize-knowledge-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
