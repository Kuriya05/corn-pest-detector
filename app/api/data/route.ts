import { NextResponse } from 'next/server';
import { COLLECTIONS, getCollection, getAllCollections, type CollectionName } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** อ่านข้อมูลคลังความรู้ — เปิดให้ทุกคนอ่านได้ */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('collection') as CollectionName | null;

  if (name) {
    if (!COLLECTIONS.includes(name)) {
      return NextResponse.json({ success: false, error: 'ไม่รู้จักหมวดข้อมูลนี้' }, { status: 400 });
    }
    return NextResponse.json({ success: true, collection: name, items: await getCollection(name) });
  }

  return NextResponse.json({ success: true, collections: await getAllCollections() });
}
