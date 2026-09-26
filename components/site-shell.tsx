'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Home, ScanLine, Bug, Leaf, FlaskConical, CalendarDays, Clock, BookOpen,
  HelpCircle, Menu, X, Sprout, ShieldAlert, ExternalLink, ChevronRight, MoreHorizontal,
  Wheat, ShieldCheck, LogOut, LogIn, SprayCan,
} from 'lucide-react';
import { navItems, moreItems, type NavItem } from './nav-items';

const icons: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  home: Home, scan: ScanLine, bug: Bug, leaf: Leaf, flask: FlaskConical,
  calendar: CalendarDays, clock: Clock, book: BookOpen, help: HelpCircle,
  sprout: Sprout, wheat: Wheat, shield: ShieldCheck, spray: SprayCan,
};

function Icon({ name, ...rest }: { name: string; size?: number; className?: string; strokeWidth?: number }) {
  const C = icons[name] ?? Home;
  return <C {...rest} />;
}

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [role, setRole] = useState<'admin' | 'guest'>('guest');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.role === 'admin') setRole('admin'); })
      .catch(() => {});
  }, [pathname]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setRole('guest');
    window.location.href = '/';
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:bg-leaf-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:font-bold"
      >
        ข้ามไปเนื้อหาหลัก
      </a>

      <header className="sticky top-0 z-50 no-print bg-white/85 backdrop-blur-xl border-b border-leaf-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 md:h-18 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 min-w-0 group focus-ring rounded-xl">
            <span className="grid place-items-center w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-leaf-700 text-corn-300 shadow-sm shrink-0 transition group-hover:scale-105">
              <Sprout size={22} strokeWidth={2.4} />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block font-extrabold text-[15px] md:text-[17px] text-leaf-900 truncate">
                AI วินิจฉัยศัตรูข้าวโพด
              </span>
              <span className="block text-[10px] md:text-[11px] font-bold uppercase tracking-[0.18em] text-leaf-600">
                Maejo University
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 ml-auto" aria-label="เมนูหลัก">
            {navItems.slice(1).map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  style={active && item.cat ? { backgroundColor: item.cat } : undefined}
                  className={`px-3 py-2 rounded-xl text-[14px] font-bold transition focus-ring ${
                    active ? 'text-white shadow-sm bg-leaf-700' : 'text-leaf-800 hover:bg-leaf-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {role === 'admin' && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1.5 text-[12.5px] font-extrabold text-leaf-800 hover:bg-leaf-200 transition focus-ring"
            >
              <ShieldCheck size={14} /> ผู้ดูแล
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-leaf-200 bg-white px-3 py-2 text-[14px] font-bold text-leaf-800 hover:bg-leaf-50 transition focus-ring"
            aria-label="เปิดเมนู"
          >
            <Menu size={18} />
            <span className="hidden sm:inline">เมนู</span>
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] no-print" role="dialog" aria-modal="true" aria-label="เมนูทั้งหมด">
          <button
            type="button"
            aria-label="ปิดเมนู"
            className="absolute inset-0 bg-leaf-950/45 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl p-5 overflow-y-auto animate-rise">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-leaf-900">เมนูทั้งหมด</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-50 text-leaf-800 hover:bg-leaf-100 focus-ring"
                aria-label="ปิด"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1.5">
              {navItems.map((item) => (
                <MenuRow key={item.href} item={item} active={isActive(pathname, item.href)} onClick={() => setOpen(false)} />
              ))}
            </div>

            <p className="mt-6 mb-2 px-1 text-[11px] font-black uppercase tracking-[0.16em] text-leaf-600">เพิ่มเติม</p>
            <div className="space-y-1.5">
              {moreItems.map((item) => (
                <MenuRow key={item.href} item={item} active={isActive(pathname, item.href)} onClick={() => setOpen(false)} />
              ))}
            </div>

            {role === 'admin' ? (
              <div className="mt-6 space-y-2">
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-leaf-200 bg-leaf-50 px-4 py-3 hover:bg-leaf-100 transition focus-ring"
                >
                  <ShieldCheck size={18} className="text-leaf-700 shrink-0" />
                  <span className="font-bold text-[14px] text-leaf-900">จัดการข้อมูล (ผู้ดูแล)</span>
                </Link>
                <button
                  type="button"
                  onClick={() => { setOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 rounded-2xl border border-soil-200 bg-soil-50 px-4 py-3 text-left hover:bg-soil-100 transition focus-ring"
                >
                  <LogOut size={18} className="text-soil-700 shrink-0" />
                  <span className="font-bold text-[14px] text-soil-900">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-6 w-full flex items-center gap-3 rounded-2xl border border-soil-200 bg-soil-50 px-4 py-3 hover:bg-soil-100 transition focus-ring"
              >
                <LogIn size={18} className="text-soil-700 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-[14px] text-soil-900">เข้าสู่ระบบผู้ดูแล</span>
                  <span className="block text-[12px] text-soil-700">เกษตรกรทั่วไปไม่ต้องเข้าสู่ระบบ</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MenuRow({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition focus-ring ${
        active ? 'bg-leaf-700 text-white' : 'bg-leaf-50/60 text-leaf-900 hover:bg-leaf-100'
      }`}
    >
      <Icon name={item.icon} size={20} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-[15px]">{item.label}</span>
        <span className={`block text-[12px] ${active ? 'text-leaf-100' : 'text-leaf-600'}`}>{item.desc}</span>
      </span>
      <ChevronRight size={16} className="shrink-0 opacity-60" />
    </Link>
  );
}

/** แถบเมนูล่างสำหรับมือถือ — นิ้วโป้งกดถึงง่ายเวลาอยู่กลางแปลง */
export function MobileTabBar() {
  const pathname = usePathname();
  const tabs = [navItems[0], navItems[2], navItems[1], navItems[3], navItems[4]];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 no-print bg-white/95 backdrop-blur-xl border-t border-leaf-100 pb-[env(safe-area-inset-bottom)]"
      aria-label="เมนูด่วน"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((item, i) => {
          const active = isActive(pathname, item.href);
          const center = i === 2;
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 focus-ring"
              >
                <span
                  className={`grid place-items-center rounded-xl transition ${
                    center
                      ? `w-11 h-11 -mt-4 shadow-lg ${active ? 'bg-leaf-700 text-white' : 'bg-corn-400 text-leaf-900'}`
                      : `w-8 h-8 ${active ? 'bg-leaf-100 text-leaf-800' : 'text-leaf-600'}`
                  }`}
                >
                  <Icon name={item.icon} size={center ? 22 : 19} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className={`text-[10.5px] font-bold ${active ? 'text-leaf-800' : 'text-leaf-600'}`}>
                  {item.short}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-leaf-100 bg-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-leaf-700 text-corn-300">
              <Sprout size={18} strokeWidth={2.4} />
            </span>
            <span className="font-extrabold text-leaf-900">AI วินิจฉัยศัตรูข้าวโพด</span>
          </div>
          <p className="text-[13.5px] text-leaf-700 leading-relaxed">
            ระบบตรวจจับและวิเคราะห์ศัตรูพืชในไร่ข้าวโพดจากภาพถ่าย ด้วยปัญญาประดิษฐ์
            <br />
            มหาวิทยาลัยแม่โจ้
          </p>
        </div>

        <div>
          <h3 className="font-extrabold text-leaf-900 mb-3 text-[15px]">เมนู</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13.5px]">
            {[...navItems, ...moreItems].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-leaf-700 hover:text-leaf-900 hover:underline focus-ring rounded">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-extrabold text-leaf-900 mb-3 text-[15px]">ขอคำปรึกษาจากเจ้าหน้าที่</h3>
          <ul className="space-y-2 text-[13.5px]">
            {[
              { label: 'กรมวิชาการเกษตร', url: 'https://www.doa.go.th/' },
              { label: 'กรมส่งเสริมการเกษตร', url: 'https://www.doae.go.th/' },
              { label: 'สำนักงานเศรษฐกิจการเกษตร (ราคารับซื้อ)', url: 'https://oae.go.th/' },
              { label: 'คณะเทคโนโลยีการเกษตร ม.แม่โจ้', url: 'https://ap.mju.ac.th/wtms_index.aspx?&lang=th-TH' },
            ].map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-leaf-700 hover:text-leaf-900 hover:underline focus-ring rounded"
                >
                  {l.label}
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-leaf-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-[12.5px] text-leaf-600 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} มหาวิทยาลัยแม่โจ้ — ใช้เพื่อการศึกษาและส่งเสริมการเกษตร</p>
          <p className="font-semibold">
            ผลวิเคราะห์จาก AI เป็นเพียงข้อมูลประกอบ ก่อนใช้สารเคมีให้อ่านฉลากและปรึกษาเจ้าหน้าที่เกษตรทุกครั้ง
          </p>
        </div>
      </div>
    </footer>
  );
}

/** โครงหน้าเว็บมาตรฐาน — ใช้ครอบทุกหน้า */
export default function SiteShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className={`flex-1 w-full mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16 ${wide ? 'max-w-[1400px]' : 'max-w-7xl'}`}>
        {children}
      </main>
      <SiteFooter />
      <MobileTabBar />
    </>
  );
}

export { MoreHorizontal };
