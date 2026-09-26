/**
 * ตัวช่วยเรียกใช้งาน Google Gemini API (Google AI Studio)
 * - ไล่ลองหลายโมเดลตามลำดับใน GEMINI_MODELS ถ้าโมเดลแรกคิวเต็ม (503) หรือถูกปลดระวาง (404)
 * - รีทรายอัตโนมัติเมื่อเจอ 429/503 พร้อมหน่วงเวลาแบบเพิ่มขึ้น
 * - ซ่อม JSON ที่โมเดลตอบมาไม่สมบูรณ์ก่อนแปลงค่า
 */

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

export function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.ROBOFLOW_API_KEY || '';
  if (!key) {
    throw new GeminiError(
      'ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในไฟล์ .env.local — ขอคีย์ได้ที่ https://aistudio.google.com/apikey',
      503,
    );
  }
  return key;
}

export function getModels(): string[] {
  const raw = process.env.GEMINI_MODELS || 'gemini-flash-latest,gemini-3.6-flash,gemini-3.8-flash,gemini-3.1-flash-lite';
  return raw.split(',').map((m) => m.trim()).filter(Boolean);
}

export type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

type CallOptions = {
  parts: GeminiPart[];
  /** ให้ตอบเป็น JSON ล้วน */
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  /** ข้อความกำกับบทบาทของโมเดล */
  system?: string;
  timeoutMs?: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callOnce(model: string, key: string, opts: CallOptions): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 90_000);

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: opts.parts }],
    generationConfig: {
      temperature: opts.temperature ?? 0.2,
      maxOutputTokens: opts.maxOutputTokens ?? 4096,
      ...(opts.json ? { responseMimeType: 'application/json' } : {}),
    },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }

  try {
    const res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new GeminiError(`[${model}] ${res.status}: ${detail.slice(0, 400)}`, res.status);
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts)
      ? parts.map((p: { text?: string }) => p.text ?? '').join('')
      : '';

    if (!text.trim()) {
      const reason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason;
      throw new GeminiError(`[${model}] โมเดลไม่ได้ตอบข้อความกลับมา (${reason ?? 'unknown'})`, 502);
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

/** เรียก Gemini พร้อมไล่โมเดลสำรองและรีทราย */
export async function callGemini(opts: CallOptions): Promise<{ text: string; model: string }> {
  const key = getApiKey();
  const models = getModels();
  let lastError: unknown = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const text = await callOnce(model, key, opts);
        return { text, model };
      } catch (err) {
        lastError = err;
        const status = err instanceof GeminiError ? err.status : 0;

        // คีย์ผิด/หมดสิทธิ์ — ไม่ต้องลองต่อ
        if (status === 400 || status === 401 || status === 403) throw err;
        // โมเดลนี้ไม่มีแล้ว — ข้ามไปโมเดลถัดไปทันที
        if (status === 404) break;
        // คิวเต็ม — ลองซ้ำครั้งเดียวแล้วเปลี่ยนไปโมเดลถัดไปเลย จะได้ไม่ให้ผู้ใช้รอนาน
        if (status === 503) {
          if (attempt === 0) { await sleep(400); continue; }
          break;
        }
        // โควต้า/ข้อผิดพลาดชั่วคราว — หน่วงแล้วลองใหม่
        if (status === 429 || status === 500 || status === 0) {
          await sleep(700 * (attempt + 1));
          continue;
        }
        break;
      }
    }
  }

  if (lastError instanceof GeminiError) throw lastError;
  throw new GeminiError(
    `เรียกใช้งาน AI ไม่สำเร็จ: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    502,
  );
}

/** ดึงก้อน JSON ออกจากข้อความ แล้วพยายามซ่อมกรณีปิดวงเล็บไม่ครบ */
export function parseJsonLoose<T = unknown>(raw: string): T {
  let text = raw.trim();

  // ตัด code fence ถ้ามี
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();

  const start = text.search(/[[{]/);
  if (start === -1) throw new GeminiError('AI ตอบกลับมาไม่ใช่รูปแบบ JSON', 502);
  text = text.slice(start);

  const direct = tryParse<T>(text);
  if (direct.ok) return direct.value;

  // ซ่อม: ปิดสตริง/วงเล็บที่ค้างอยู่
  const repaired = repairJson(text);
  const second = tryParse<T>(repaired);
  if (second.ok) return second.value;

  throw new GeminiError('แปลงคำตอบของ AI เป็น JSON ไม่สำเร็จ', 502);
}

function tryParse<T>(text: string): { ok: true; value: T } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return { ok: false };
  }
}

function repairJson(text: string): string {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  let out = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += ch;

    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }

    if (ch === '"') {
      // เจอ " ขณะอยู่ในสตริง ให้ดูว่าตัวถัดไปสมเหตุสมผลหรือไม่
      if (!inString) { inString = true; continue; }
      const next = text.slice(i + 1).match(/^\s*(.)/)?.[1];
      if (next === undefined || [',', ':', '}', ']'].includes(next)) {
        inString = false;
      }
      continue;
    }

    if (inString) continue;
    if (ch === '{' || ch === '[') stack.push(ch);
    if (ch === '}' || ch === ']') stack.pop();
  }

  if (inString) out += '"';
  // ตัดเครื่องหมายจุลภาคที่ค้างท้าย
  out = out.replace(/,\s*$/, '');
  while (stack.length) {
    const open = stack.pop();
    out += open === '{' ? '}' : ']';
  }
  return out;
}
