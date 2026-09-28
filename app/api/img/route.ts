import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const blobUrl = request.nextUrl.searchParams.get('url');
  if (!blobUrl) {
    return new NextResponse('Missing url', { status: 400 });
  }

  // ตรวจสอบว่าเป็น Vercel Blob URL
  if (!blobUrl.includes('vercel-storage.com') && !blobUrl.includes('blob.vercel')) {
    return new NextResponse('Invalid url', { status: 400 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const res = await fetch(blobUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      return new NextResponse('Not found', { status: 404 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
