import { NextResponse } from 'next/server';
import { getSession, isAuthConfigured } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    success: true,
    configured: isAuthConfigured(),
    role: session?.role ?? 'guest',
    username: session?.username ?? null,
  });
}
