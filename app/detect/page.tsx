'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ScanLine, Camera, ImagePlus, X, Loader2, AlertTriangle, CheckCircle2,
  ArrowRight, RefreshCw, Bug, Leaf, FlaskConical, Sparkles, Info, Target,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Callout, SeverityBadge } from '@/components/ui';
import type { Finding } from '@/lib/analysis';

type DetectResponse = {
  success: boolean;
  error?: string;
  model?: string;
  isCorn?: boolean;
  imageQuality?: string;
  plantPart?: string;
  growthStageGuess?: string;
  findings?: Finding[];
  yolo?: { available: boolean; error?: string; count: number; extra: Finding[] };
  summary?: string;
  nextSteps?: string[];
  needBetterPhoto?: boolean;
  photoTip?: string;
  analyzedAt?: string;
  disclaimer?: string;
};

const qualityLabel: Record<string, string> = {
  good: 'ภาพชัดเจน',
  blurry: 'ภาพเบลอ',
  too_dark: 'ภาพมืดเกินไป',
  too_far: 'ถ่ายไกลเกินไป',
  not_plant: 'ไม่พบพืชในภาพ',
};

const typeMeta: Record<string, { label: string; icon: typeof Bug; cls: string }> = {
  pest: { label: 'แมลงศัตรูพืช', icon: Bug, cls: 'bg-rose-100 text-rose-800' },
  disease: { label: 'โรคพืช', icon: Leaf, cls: 'bg-orange-100 text-orange-900' },
  deficiency: { label: 'ขาดธาตุอาหาร', icon: FlaskConical, cls: 'bg-sky-100 text-sky-800' },
  damage: { label: 'ร่องรอยความเสียหาย', icon: Target, cls: 'bg-amber-100 text-amber-900' },
  healthy: { label: 'ต้นสมบูรณ์ดี', icon: CheckCircle2, cls: 'bg-leaf-100 text-leaf-800' },
  unknown: { label: 'ยังระบุไม่ได้', icon: Info, cls: 'bg-slate-100 text-slate-700' },
};

export default function DetectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBoxes, setShowBoxes] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = useCallback((f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return; }
    if (f.size > 12 * 1024 * 1024) { setError('ไฟล์ใหญ่เกิน 12 MB กรุณาย่อรูปหรือถ่ายใหม่'); return; }
    setError(null);
    setResult(null);
    setFile(f);
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f); });
  }, []);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return null; });
  };

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/detect', { method: 'POST', body: fd });
      const data: DetectResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'วิเคราะห์ภาพไม่สำเร็จ กรุณาลองใหม่');
        return;
      }
      setResult(data);
      saveHistory(data, file.name);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } catch {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  const allBoxes = [...(result?.findings ?? []), ...(result?.yolo?.extra ?? [])].filter((f) => f.box);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="AI Diagnosis"
        title="สแกนวินิจฉัยจากภาพถ่าย"
        description="ถ่ายรูปใบ ลำต้น ยอด หรือฝักข้าวโพดที่มีอาการ แล้วให้ AI ช่วยวิเคราะห์ว่าเป็นโรค แมลง หรืออาการขาดธาตุอาหาร"
        icon={<ScanLine size={26} strokeWidth={2.3} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start">
        {/* ---------- ฝั่งซ้าย: อัปโหลดและพรีวิว ---------- */}
        <Card className="lg:sticky lg:top-24">
          {!preview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
              className="rounded-4xl border-2 border-dashed border-leaf-300 bg-leaf-50/50 px-5 py-10 text-center"
            >
              <span className="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-3xl bg-white text-leaf-600 shadow-sm">
                <ImagePlus size={30} />
              </span>
              <p className="font-extrabold text-leaf-900 text-[17px]">เลือกรูปข้าวโพดที่มีอาการ</p>
              <p className="mt-1.5 text-[13.5px] text-leaf-600 max-w-sm mx-auto">
                ถ่ายใกล้จุดที่เป็นให้เห็นชัด ในที่แสงสว่างพอ ไม่ย้อนแสง รองรับไฟล์ JPG PNG ขนาดไม่เกิน 12 MB
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-leaf-700 px-5 py-3.5 font-bold text-white shadow-sm hover:bg-leaf-800 transition focus-ring"
                >
                  <Camera size={19} /> ถ่ายรูปตอนนี้
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
                >
                  <ImagePlus size={19} /> เลือกจากเครื่อง
                </button>
              </div>

              <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
                onChange={(e) => pick(e.target.files?.[0])} />
              <input ref={inputRef} type="file" accept="image/*" hidden
                onChange={(e) => pick(e.target.files?.[0])} />
            </div>
          ) : (
            <div>
              <div className="relative overflow-hidden rounded-4xl bg-leaf-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="ภาพข้าวโพดที่อัปโหลด" className="w-full max-h-[62vh] object-contain" />

                {loading && (
                  <div className="absolute inset-0 bg-leaf-950/55 backdrop-blur-[2px] grid place-items-center">
                    <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-corn-300/40 to-transparent animate-sweep" />
                    <div className="relative text-center text-white">
                      <Loader2 size={34} className="mx-auto animate-spin mb-2.5" />
                      <p className="font-extrabold">กำลังวิเคราะห์ภาพ…</p>
                      <p className="text-[13px] text-leaf-100 mt-0.5">ใช้เวลาประมาณ 5–20 วินาที</p>
                    </div>
                  </div>
                )}

                {showBoxes && !loading && allBoxes.map((f, i) => (
                  <div
                    key={i}
                    className="absolute rounded-lg ring-2 ring-corn-300 bg-corn-300/10"
                    style={{ top: `${f.box!.top}%`, left: `${f.box!.left}%`, width: `${f.box!.width}%`, height: `${f.box!.height}%` }}
                  >
                    <span className="absolute -top-1 left-0 -translate-y-full whitespace-nowrap rounded-md bg-corn-400 px-1.5 py-0.5 text-[10.5px] font-extrabold text-leaf-900 shadow">
                      {f.nameTh} {f.confidence}%
                    </span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={reset}
                  className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-xl bg-black/50 text-white backdrop-blur hover:bg-black/70 transition focus-ring"
                  aria-label="ลบรูป"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={analyze}
                  disabled={loading}
                  className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-2xl bg-leaf-700 px-5 py-3.5 font-bold text-white shadow-sm hover:bg-leaf-800 disabled:opacity-60 transition focus-ring"
                >
                  {loading ? <Loader2 size={19} className="animate-spin" /> : <Sparkles size={19} />}
                  {loading ? 'กำลังวิเคราะห์…' : result ? 'วิเคราะห์ซ้ำ' : 'เริ่มวิเคราะห์'}
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3.5 font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
                >
                  <RefreshCw size={17} /> เปลี่ยนรูป
                </button>
                {allBoxes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBoxes((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3.5 font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
                  >
                    <Target size={17} /> {showBoxes ? 'ซ่อนกรอบ' : 'แสดงกรอบ'}
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4">
              <Callout tone="danger" title="วิเคราะห์ไม่สำเร็จ">{error}</Callout>
            </div>
          )}

          <div className="mt-5 rounded-3xl bg-corn-50 ring-1 ring-corn-200 p-4">
            <p className="font-extrabold text-[14px] text-corn-900 mb-2">ถ่ายรูปอย่างไรให้ AI วิเคราะห์แม่น</p>
            <ul className="space-y-1.5 text-[13.5px] text-corn-900/90">
              {[
                'เข้าใกล้จุดที่เป็น ให้เห็นรอยแผล รูเจาะ หรือตัวแมลงเต็มกรอบ',
                'ถ่ายกลางแจ้งตอนเช้าหรือเย็น เลี่ยงแดดจัดจนเกิดเงาทับ และเลี่ยงย้อนแสง',
                'ถ่ายทั้งด้านบนใบและใต้ใบ เพราะบางโรคเห็นอาการชัดเฉพาะใต้ใบ',
                'ถ้าสงสัยราน้ำค้าง ให้ถ่ายตอนเช้าตรู่ที่ยังมีน้ำค้าง จะเห็นผงสีขาวชัด',
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 size={15} className="mt-[3px] shrink-0 text-corn-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* ---------- ฝั่งขวา: ผลวิเคราะห์ ---------- */}
        <div ref={resultRef} className="space-y-5">
          {!result && !loading && (
            <Card className="text-center py-12">
              <span className="mx-auto mb-3 grid place-items-center w-14 h-14 rounded-3xl bg-leaf-50 text-leaf-400">
                <ScanLine size={26} />
              </span>
              <p className="font-extrabold text-leaf-900">ผลวิเคราะห์จะแสดงตรงนี้</p>
              <p className="mt-1.5 text-[13.5px] text-leaf-600 max-w-sm mx-auto">
                ยังไม่แน่ใจว่าเป็นอะไร และไม่มีรูปถ่าย? ลองใช้{' '}
                <Link href="/diseases#advisor" className="font-bold text-leaf-700 underline">
                  การวินิจฉัยจากอาการ
                </Link>{' '}
                แทนได้
              </p>
            </Card>
          )}

          {result && (
            <>
              {result.isCorn === false && (
                <Callout tone="warn" title="ภาพนี้อาจไม่ใช่ข้าวโพด">
                  ระบบนี้ออกแบบมาสำหรับข้าวโพดโดยเฉพาะ ผลวิเคราะห์ด้านล่างอาจไม่ถูกต้อง
                </Callout>
              )}
              {result.needBetterPhoto && (
                <Callout tone="warn" title={`คุณภาพภาพ: ${qualityLabel[result.imageQuality ?? ''] ?? result.imageQuality}`}>
                  {result.photoTip || 'ควรถ่ายรูปใหม่ให้ชัดขึ้นเพื่อให้ผลแม่นยำกว่านี้'}
                </Callout>
              )}

              {result.summary && (
                <Card>
                  <div className="flex items-start gap-3">
                    <span className="grid place-items-center w-10 h-10 rounded-2xl bg-leaf-700 text-corn-300 shrink-0">
                      <Sparkles size={19} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-leaf-600 mb-1">สรุปผล</p>
                      <p className="text-[15px] leading-relaxed text-leaf-900">{result.summary}</p>
                      <p className="mt-2.5 text-[12px] text-leaf-500">
                        ส่วนที่วิเคราะห์: {result.plantPart}
                        {result.growthStageGuess ? ` · คาดว่าเป็นระยะ ${result.growthStageGuess}` : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {(result.findings ?? []).map((f, i) => (
                <FindingCard key={i} finding={f} rank={i} />
              ))}

              {(result.yolo?.extra ?? []).length > 0 && (
                <Card>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-leaf-600 mb-2">
                    โมเดล YOLO ที่เทรนเองตรวจพบเพิ่มเติม
                  </p>
                  <ul className="space-y-2">
                    {result.yolo!.extra.map((f, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-leaf-50 px-4 py-2.5">
                        <span className="font-bold text-[14px] text-leaf-900">{f.nameTh}</span>
                        <span className="text-[13px] font-bold text-leaf-600">{f.confidence}%</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {(result.nextSteps ?? []).length > 0 && (
                <Card className="bg-leaf-700/95! text-white ring-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-corn-300 mb-3">
                    สิ่งที่ควรทำใน 1–7 วันข้างหน้า
                  </p>
                  <ol className="space-y-2.5">
                    {result.nextSteps!.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="grid place-items-center w-6 h-6 rounded-lg bg-white/15 text-[12px] font-extrabold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-[14.5px] leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              <div className="rounded-3xl bg-soil-50 ring-1 ring-soil-200 p-4 flex gap-3">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-soil-600" />
                <div className="text-[13px] text-soil-800 leading-relaxed">
                  <p>{result.disclaimer}</p>
                  <p className="mt-1.5 text-[11.5px] text-soil-600">
                    วิเคราะห์โดยโมเดล {result.model}
                    {result.yolo?.available === false && result.yolo.error ? ` · โมเดล YOLO ไม่พร้อมใช้งาน (${result.yolo.error})` : ''}
                    {result.yolo?.available ? ` · YOLO ตรวจพบ ${result.yolo.count} จุด` : ''}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SiteShell>
  );
}

function FindingCard({ finding, rank }: { finding: Finding; rank: number }) {
  const meta = typeMeta[finding.type] ?? typeMeta.unknown;
  const IconC = meta.icon;

  return (
    <Card className="animate-rise">
      <div className="flex items-start gap-3.5">
        <span className={`grid place-items-center w-11 h-11 rounded-2xl shrink-0 ${meta.cls}`}>
          <IconC size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-extrabold ${meta.cls}`}>{meta.label}</span>
            {finding.type !== 'healthy' && <SeverityBadge level={finding.severity} />}
            {rank === 0 && (
              <span className="rounded-full bg-leaf-700 px-2.5 py-0.5 text-[11.5px] font-extrabold text-white">
                น่าจะเป็นมากที่สุด
              </span>
            )}
          </div>

          <h2 className="text-[18px] font-extrabold text-leaf-900">{finding.nameTh}</h2>
          {finding.nameEn && finding.nameEn !== finding.nameTh && (
            <p className="text-[12.5px] text-leaf-500 italic">{finding.nameEn}</p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-leaf-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${finding.confidence >= 70 ? 'bg-leaf-600' : finding.confidence >= 40 ? 'bg-corn-400' : 'bg-slate-400'}`}
                style={{ width: `${Math.max(finding.confidence, 3)}%` }}
              />
            </div>
            <span className="text-[13px] font-extrabold text-leaf-800 tabular-nums">{finding.confidence}%</span>
          </div>
          {finding.confidence < 50 && (
            <p className="mt-1.5 text-[12px] text-corn-700 font-semibold">
              ความมั่นใจต่ำ — ควรถ่ายรูปเพิ่มหรือให้เจ้าหน้าที่ยืนยันก่อนตัดสินใจ
            </p>
          )}

          {finding.evidence && (
            <p className="mt-3 rounded-2xl bg-leaf-50 px-4 py-3 text-[14px] leading-relaxed text-leaf-800">
              <span className="font-bold">สิ่งที่เห็นในภาพ: </span>
              {finding.evidence}
            </p>
          )}

          {(finding.quickActions ?? []).length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {finding.quickActions!.map((a, i) => (
                <li key={i} className="flex gap-2 text-[13.5px] text-leaf-800">
                  <CheckCircle2 size={15} className="mt-[3px] shrink-0 text-leaf-500" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}

          {finding.link && (
            <Link
              href={finding.link.href}
              className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-leaf-700 px-4 py-2.5 text-[14px] font-bold text-white hover:bg-leaf-800 transition focus-ring"
            >
              {finding.link.label}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

/** บันทึกผลลงเครื่องผู้ใช้ เพื่อดูย้อนหลังในหน้าประวัติ */
function saveHistory(data: DetectResponse, fileName: string) {
  try {
    const top = data.findings?.[0];
    const entry = {
      id: `${Date.now()}`,
      at: data.analyzedAt ?? new Date().toISOString(),
      fileName,
      topName: top?.nameTh ?? 'ไม่พบความผิดปกติชัดเจน',
      topType: top?.type ?? 'unknown',
      confidence: top?.confidence ?? 0,
      severity: top?.severity ?? 'low',
      summary: data.summary ?? '',
      findings: (data.findings ?? []).map((f) => ({ nameTh: f.nameTh, type: f.type, confidence: f.confidence })),
      nextSteps: data.nextSteps ?? [],
    };
    const raw = localStorage.getItem('maize_scan_history');
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    localStorage.setItem('maize_scan_history', JSON.stringify([entry, ...list].slice(0, 100)));
  } catch {
    /* ถ้าเบราว์เซอร์ปิด localStorage ไว้ ก็ข้ามการบันทึกไป */
  }
}
