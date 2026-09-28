import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get('image') as File | null;
    const collection = (form.get('collection') as string) || 'general';
    const itemId = (form.get('itemId') as string) || 'item';

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'ต้องเป็นไฟล์รูปภาพ (jpg, png, webp)' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'ไฟล์ใหญ่เกิน 8 MB' }, { status: 413 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeId = itemId.replace(/[^a-z0-9-_]/gi, '-').slice(0, 40);
    const filename = `uploads/${collection}/${collection}-${safeId}-${Date.now()}.${ext}`;

    // อัปโหลด — รองรับทั้ง public และ private store
    let blob;
    try {
      blob = await put(filename, file, { access: 'public', contentType: file.type });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('private')) {
        blob = await put(filename, file, { access: 'private', contentType: file.type });
        // private store: ส่ง proxy URL เพื่อให้ <img> โหลดได้
        const proxyUrl = `/api/img?url=${encodeURIComponent(blob.url)}`;
        return NextResponse.json({ success: true, url: proxyUrl, filename });
      }
      throw e;
    }

    // public store: ส่ง URL โดยตรง
    return NextResponse.json({ success: true, url: blob.url, filename });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
