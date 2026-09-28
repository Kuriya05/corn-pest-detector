import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

// จำกัด 2 MB ต่อรูป (base64 ≈ +33% → ~2.7 MB ใน DB)
const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get('image') as File | null;

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'ต้องเป็นไฟล์รูปภาพ (jpg, png, webp)' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: `ไฟล์ใหญ่เกิน 2 MB (${(file.size/1024/1024).toFixed(1)} MB)` }, { status: 413 });
    }

    // แปลงเป็น base64 data URL
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ success: true, url: dataUrl, filename: file.name });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
