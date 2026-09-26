'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, CheckCircle2, XCircle, Database, Cpu, Bug, Leaf, FlaskConical,
  RefreshCw, Loader2, ArrowLeft, BarChart3,
} from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Callout, SourceList } from '@/components/ui';
import { SRC } from '@/lib/data/pests';
import { DSRC } from '@/lib/data/diseases';
import { fertilizerSources } from '@/lib/data/fertilizer';

type Status = {
  geminiConfigured: boolean;
  models: string[];
  yolo: { enabled: boolean; modelFound: boolean; scriptFound: boolean; venvFound: boolean; confidence: string };
  dataset: { pests: number; diseases: number; deficiencies: number; chemicals: number };
};

export default function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/status');
      setStatus(await r.json());
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    try {
      const raw = localStorage.getItem('maize_scan_history');
      setScans(raw ? (JSON.parse(raw) as unknown[]).length : 0);
    } catch {
      setScans(0);
    }
  }, []);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Admin"
        title="สถานะระบบ"
        description="ตรวจสอบการเชื่อมต่อ AI โมเดลตรวจจับ และจำนวนข้อมูลในคลังความรู้"
        icon={<ShieldAlert size={26} strokeWidth={2.3} />}
        action={
          <button
            type="button" onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[14px] font-bold text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 transition focus-ring"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} รีเฟรช
          </button>
        }
      />

      {loading && !status && (
        <Card className="text-center py-12">
          <Loader2 size={28} className="mx-auto animate-spin text-leaf-500" />
        </Card>
      )}

      {status && (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-4">
                <Cpu size={19} className="text-leaf-600" /> ระบบ AI วิเคราะห์ภาพ (Gemini)
              </h2>
              <StatusRow ok={status.geminiConfigured} label="ตั้งค่า GEMINI_API_KEY แล้ว" />
              <div className="mt-3 rounded-2xl bg-leaf-50 px-4 py-3">
                <p className="text-[12px] font-black uppercase tracking-[0.1em] text-leaf-600 mb-1.5">ลำดับโมเดลที่ใช้</p>
                <ol className="space-y-1">
                  {status.models.map((m, i) => (
                    <li key={m} className="text-[13.5px] text-leaf-800">
                      <span className="font-bold">{i + 1}.</span> {m}
                      {i === 0 && <span className="ml-1.5 text-[11.5px] text-leaf-500">(ใช้เป็นหลัก)</span>}
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-[12px] text-leaf-600">
                  ถ้าโมเดลแรกคิวเต็มหรือถูกปลดระวาง ระบบจะไล่ไปโมเดลถัดไปอัตโนมัติ
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-4">
                <Bug size={19} className="text-leaf-600" /> โมเดล YOLO ที่เทรนเอง (ตัวเสริม)
              </h2>
              <div className="space-y-2">
                <StatusRow ok={status.yolo.enabled} label="เปิดใช้งาน" />
                <StatusRow ok={status.yolo.modelFound} label="พบไฟล์โมเดล best.pt" />
                <StatusRow ok={status.yolo.scriptFound} label="พบสคริปต์ detect_model.py" />
                <StatusRow ok={status.yolo.venvFound} label="พบ virtualenv (.venv)" optional />
              </div>
              <p className="mt-3 text-[12.5px] text-leaf-600">
                ค่า confidence ปัจจุบัน {status.yolo.confidence} — ปรับได้ที่ตัวแปร YOLO_CONF ในไฟล์ .env.local
              </p>
              {!status.yolo.venvFound && (
                <p className="mt-2 text-[12.5px] text-corn-800">
                  ถ้าไม่พบ virtualenv ระบบจะเรียก python จาก PATH แทน — ต้องติดตั้ง ultralytics ไว้ในนั้น
                </p>
              )}
            </Card>
          </div>

          <Card>
            <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-leaf-900 mb-4">
              <Database size={19} className="text-leaf-600" /> ข้อมูลในคลังความรู้
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Metric icon={<Bug size={18} />} value={status.dataset.pests} label="แมลงศัตรูพืช" href="/pests" />
              <Metric icon={<Leaf size={18} />} value={status.dataset.diseases} label="โรคข้าวโพด" href="/diseases" />
              <Metric icon={<FlaskConical size={18} />} value={status.dataset.deficiencies} label="อาการขาดธาตุ" href="/fertilizer" />
              <Metric icon={<Database size={18} />} value={status.dataset.chemicals} label="รายการสารที่แนะนำ" />
              <Metric icon={<BarChart3 size={18} />} value={scans} label="ผลสแกนในเครื่องนี้" href="/history" />
            </div>
          </Card>

          <Callout tone="info" title="การแก้ไขข้อมูลในคลังความรู้">
            ข้อมูลโรค แมลง และปุ๋ยทั้งหมดเก็บเป็นไฟล์โค้ดในโปรเจกต์ที่{' '}
            <code className="rounded bg-leaf-100 px-1.5 py-0.5 text-[13px] font-mono">lib/data/</code> —
            แก้ไขได้ที่ pests.ts, diseases.ts, fertilizer.ts และ calendar.ts
            การเก็บเป็นไฟล์แทนฐานข้อมูลทำให้ทุกการแก้ไขถูกบันทึกใน git และตรวจสอบย้อนกลับได้ว่าใครแก้อะไร
            ซึ่งสำคัญมากเพราะเป็นข้อมูลที่เกษตรกรใช้ตัดสินใจจริง
          </Callout>

          <div className="grid gap-4 md:grid-cols-3">
            <SourceList sources={[SRC.doaGuide, SRC.nswFaw, SRC.nswBorer]} />
            <SourceList sources={[DSRC.oard5, DSRC.nswDowny, DSRC.ku]} />
            <SourceList sources={fertilizerSources.slice(0, 3)} />
          </div>
        </div>
      )}

      {!loading && !status && (
        <Callout tone="danger" title="เชื่อมต่อไม่สำเร็จ">
          ไม่สามารถอ่านสถานะระบบได้ ลองรีเฟรชอีกครั้ง หรือตรวจสอบว่าเซิร์ฟเวอร์กำลังทำงานอยู่
        </Callout>
      )}

      <Link href="/" className="mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-leaf-700 hover:text-leaf-900 focus-ring rounded">
        <ArrowLeft size={16} /> กลับสู่หน้าหลัก
      </Link>
    </SiteShell>
  );
}

function StatusRow({ ok, label, optional }: { ok: boolean; label: string; optional?: boolean }) {
  return (
    <p className="flex items-center gap-2.5 text-[14px]">
      {ok ? (
        <CheckCircle2 size={18} className="text-leaf-600 shrink-0" />
      ) : (
        <XCircle size={18} className={`shrink-0 ${optional ? 'text-leaf-300' : 'text-rose-500'}`} />
      )}
      <span className={ok ? 'text-leaf-900 font-semibold' : optional ? 'text-leaf-500' : 'text-rose-700 font-semibold'}>
        {label}
      </span>
    </p>
  );
}

function Metric({ icon, value, label, href }: { icon: React.ReactNode; value: number; label: string; href?: string }) {
  const body = (
    <div className="rounded-2xl bg-leaf-50 px-4 py-3.5 h-full transition hover:bg-leaf-100">
      <span className="text-leaf-600">{icon}</span>
      <p className="mt-1.5 text-[24px] font-extrabold tabular-nums text-leaf-900 leading-none">{value}</p>
      <p className="mt-1 text-[12.5px] font-semibold text-leaf-700">{label}</p>
    </div>
  );
  return href ? <Link href={href} className="focus-ring rounded-2xl">{body}</Link> : body;
}
