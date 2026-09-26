import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { COLLECTIONS, saveItem, deleteItem, restoreItem, type CollectionName, type Item } from '@/lib/store';

export const runtime = 'nodejs';

const deny = () =>
  NextResponse.json({ success: false, error: 'ต้องเข้าสู่ระบบผู้ดูแลก่อนจึงจะแก้ไขข้อมูลได้' }, { status: 401 });

function validCollection(name: unknown): name is CollectionName {
  return typeof name === 'string' && (COLLECTIONS as readonly string[]).includes(name);
}

/** เพิ่มหรือแก้ไขรายการ */
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return deny();

  let body: { collection?: string; item?: Item };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }, { status: 400 });
  }

  if (!validCollection(body.collection)) {
    return NextResponse.json({ success: false, error: 'ไม่รู้จักหมวดข้อมูลนี้' }, { status: 400 });
  }
  if (!body.item || typeof body.item !== 'object') {
    return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลรายการ' }, { status: 400 });
  }

  // ฟิลด์ที่ระบบเติมให้ ไม่ต้องบันทึกลงไฟล์
  const item = { ...body.item } as Item;
  delete (item as Record<string, unknown>).official;
  delete (item as Record<string, unknown>).edited;

  const result = await saveItem(body.collection, item, session.username);
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  return NextResponse.json({ success: true, id: result.id });
}

/** ลบรายการ */
export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return deny();

  const url = new URL(request.url);
  const collection = url.searchParams.get('collection');
  const id = url.searchParams.get('id');

  if (!validCollection(collection) || !id) {
    return NextResponse.json({ success: false, error: 'ต้องระบุหมวดและรหัสรายการ' }, { status: 400 });
  }

  const result = await deleteItem(collection, id, session.username);
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  return NextResponse.json({ success: true, permanent: result.permanent });
}

/** กู้คืนรายการตั้งต้นให้กลับไปเป็นค่าเดิม */
export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return deny();

  const url = new URL(request.url);
  const collection = url.searchParams.get('collection');
  const id = url.searchParams.get('id');

  if (!validCollection(collection) || !id) {
    return NextResponse.json({ success: false, error: 'ต้องระบุหมวดและรหัสรายการ' }, { status: 400 });
  }

  const result = await restoreItem(collection, id, session.username);
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
