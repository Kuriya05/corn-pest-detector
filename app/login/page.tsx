'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, ArrowLeft, LogIn, Info } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { Card, Callout } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.configured === false) setConfigured(false);
        if (d?.role === 'admin') router.replace('/admin');
      })
      .catch(() => {});
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="max-w-md mx-auto pt-6">
        <Card className="cat-bar" >
          <div className="text-center mb-6">
            <span className="mx-auto mb-3 grid place-items-center w-14 h-14 rounded-3xl bg-leaf-700 text-corn-300">
              <ShieldCheck size={26} />
            </span>
            <h1 className="text-[22px] font-extrabold text-leaf-900">เข้าสู่ระบบผู้ดูแล</h1>
            <p className="mt-1.5 text-[13.5px] text-leaf-600">
              สำหรับเจ้าหน้าที่ที่ต้องการเพิ่ม แก้ไข หรือลบข้อมูลในคลังความรู้
            </p>
          </div>

          {!configured && (
            <div className="mb-5">
              <Callout tone="warn" title="ยังไม่ได้ตั้งรหัสผ่าน">
                กรุณาเพิ่มค่า <code className="rounded bg-corn-100 px-1.5">ADMIN_PASSWORD</code> ในไฟล์{' '}
                <code className="rounded bg-corn-100 px-1.5">.env.local</code> แล้วรีสตาร์ทเซิร์ฟเวอร์
              </Callout>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="block text-[13px] font-bold text-leaf-800 mb-1.5">ชื่อผู้ใช้</span>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                autoComplete="username" required
                className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] focus-ring"
              />
            </label>

            <label className="block">
              <span className="block text-[13px] font-bold text-leaf-800 mb-1.5">รหัสผ่าน</span>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" required
                className="w-full rounded-2xl bg-white ring-1 ring-leaf-200 px-4 py-3 text-[15px] focus-ring"
              />
            </label>

            {error && <Callout tone="danger">{error}</Callout>}

            <button
              type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-leaf-700 px-5 py-3.5 font-bold text-white shadow-sm hover:bg-leaf-800 disabled:opacity-60 transition focus-ring"
            >
              {loading ? <Loader2 size={19} className="animate-spin" /> : <LogIn size={19} />}
              {loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="mt-5 flex gap-2 text-[12.5px] text-leaf-600">
            <Info size={15} className="shrink-0 mt-0.5" />
            เกษตรกรทั่วไปไม่ต้องเข้าสู่ระบบ — ดูข้อมูลและใช้ AI วินิจฉัยได้ทุกหน้าอยู่แล้ว
          </p>
        </Card>

        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-leaf-700 hover:text-leaf-900 focus-ring rounded">
          <ArrowLeft size={16} /> กลับสู่หน้าหลัก
        </Link>
      </div>
    </SiteShell>
  );
}
