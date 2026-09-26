import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { getModels } from '@/lib/gemini';
import { getStats } from '@/lib/store';
import { isAuthConfigured, getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const root = process.cwd();
  const [stats, session] = await Promise.all([getStats(), getSession()]);
  const yoloModel = resolve(/*turbopackIgnore: true*/ root, process.env.YOLO_MODEL_PATH || '../best.pt');
  const yoloScript = resolve(/*turbopackIgnore: true*/ root, process.env.YOLO_SCRIPT_PATH || '../detect_model.py');

  return NextResponse.json({
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.ROBOFLOW_API_KEY),
    models: getModels(),
    yolo: {
      enabled: process.env.YOLO_ENABLED !== 'false',
      modelFound: existsSync(yoloModel),
      scriptFound: existsSync(yoloScript),
      venvFound:
        existsSync(join(root, '..', '.venv', 'Scripts', 'python.exe')) ||
        existsSync(join(root, '..', '.venv', 'bin', 'python')),
      confidence: process.env.YOLO_CONF || '0.35',
    },
    auth: { configured: isAuthConfigured(), role: session?.role ?? 'guest' },
    dataset: {
      total: stats.collections.reduce((n, c) => n + c.total, 0),
      collections: stats.collections,
      updatedAt: stats.updatedAt,
    },
  });
}
