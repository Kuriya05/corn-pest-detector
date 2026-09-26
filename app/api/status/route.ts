import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { getModels } from '@/lib/gemini';
import { pests } from '@/lib/data/pests';
import { diseases } from '@/lib/data/diseases';
import { deficiencies } from '@/lib/data/fertilizer';

export const runtime = 'nodejs';

export async function GET() {
  const root = process.cwd();
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
    dataset: {
      pests: pests.length,
      diseases: diseases.length,
      deficiencies: deficiencies.length,
      chemicals:
        pests.reduce((n, p) => n + p.chemicals.length, 0) +
        diseases.reduce((n, d) => n + d.chemicals.length, 0),
    },
  });
}
