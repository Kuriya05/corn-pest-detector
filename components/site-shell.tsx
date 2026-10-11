'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Home, ScanLine, Bug, Leaf, FlaskConical, CalendarDays, Clock, BookOpen,
  HelpCircle, Menu, X, Sprout, ExternalLink, Wheat, ShieldCheck, LogOut, LogIn, SprayCan, ChevronDown, Store,
} from 'lucide-react';
import { navItems, moreItems, type NavItem } from './nav-items';
import AccessibilityPanel from './accessibility-panel';

const icons: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  home: Home, scan: ScanLine, bug: Bug, leaf: Leaf, flask: FlaskConical,
  calendar: CalendarDays, clock: Clock, book: BookOpen, help: HelpCircle,
  sprout: Sprout, wheat: Wheat, shield: ShieldCheck, spray: SprayCan, store: Store,
};

function Icon({ name, ...rest }: { name: string; size?: number; className?: string; strokeWidth?: number }) {
  const C = icons[name] ?? Home;
  return <C {...rest} />;
}

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function useRole() {
  const pathname = usePathname();
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
  return { role, logout };
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 min-w-0 focus-ring rounded-lg">
      <span className="grid place-items-center w-9 h-9 rounded-full bg-corn-400 text-leaf-900 shrink-0">
        <Sprout size={17} strokeWidth={2.4} />
      </span>
      <span className="font-display text-[17px] text-leaf-900 truncate">Maize Doctor</span>
    </Link>
  );
}

/** เมนู "คลังความรู้" แบบเลื่อนลง สำหรับจอใหญ่ */
function MoreMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const anyActive = moreItems.some((i) => isActive(pathname, i.href));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-[14.5px] font-medium transition focus-ring ${anyActive ? 'bg-corn-100 text-leaf-900' : 'text-soil-600 hover:bg-soil-100 hover:text-leaf-900'}`}
      >
        คลังความรู้ <ChevronDown size={15} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-3 w-72 rounded-3xl bg-white border border-[#f1e7d3] shadow-[0_20px_50px_-20px_rgb(122_82_12_/_0.4)] p-2 animate-rise">
          {moreItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition focus-ring ${isActive(pathname, item.href) ? 'bg-corn-100 text-leaf-900' : 'text-soil-700 hover:bg-soil-100'}`}
            >
              <Icon name={item.icon} size={17} className="shrink-0 text-leaf-600" />
              <span className="min-w-0">
                <span className="block text-[14.5px] font-medium leading-tight">{item.label}</span>
                <span className="block text-[12.5px] text-soil-500 leading-snug">{item.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  const pathname = usePathname();
  const { role, logout } = useRole();
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:bg-leaf-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
      >
        ข้ามไปเนื้อหาหลัก
      </a>

      <header className="sticky top-0 z-50 no-print px-3 sm:px-6 pt-3">
        <div className="mx-auto max-w-6xl h-14 sm:h-16 px-4 sm:px-6 flex items-center gap-4 rounded-full bg-white/90 backdrop-blur border border-[#f1e7d3] shadow-[0_10px_30px_-16px_rgb(122_82_12_/_0.35)]">
          <Brand />

          <nav className="hidden lg:flex items-center gap-1 ml-2" aria-label="เมนูหลัก">
            {navItems.slice(1).map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3.5 py-2 rounded-full text-[14.5px] font-medium transition focus-ring ${active ? 'bg-corn-100 text-leaf-900' : 'text-soil-600 hover:bg-soil-100 hover:text-leaf-900'}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <MoreMenu pathname={pathname} />
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {role === 'admin' ? (
              <>
                <Link href="/admin" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-leaf-800 hover:bg-leaf-50 focus-ring">
                  <ShieldCheck size={15} /> ผู้ดูแล
                </Link>
                <button type="button" onClick={logout} className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-soil-600 hover:bg-soil-100 focus-ring">
                  <LogOut size={15} /> ออก
                </button>
              </>
            ) : (
              <Link href="/login" className="hidden lg:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-soil-500 hover:text-leaf-900 focus-ring">
                <LogIn size={14} /> ผู้ดูแล
              </Link>
            )}
            <Link href="/detect" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-corn-400 px-5 py-2.5 text-[14px] font-medium text-leaf-950 hover:bg-corn-300 shadow-[0_6px_16px_-6px_rgb(245_174_11_/_0.7)] transition focus-ring">
              <ScanLine size={15} /> สแกนเลย
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="lg:hidden grid place-items-center w-10 h-10 rounded-full bg-soil-100 text-leaf-900 hover:bg-soil-200 transition focus-ring"
              aria-label="เปิดเมนู"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] no-print" role="dialog" aria-modal="true" aria-label="เมนูทั้งหมด">
          <button type="button" aria-label="ปิดเมนู" className="absolute inset-0 bg-leaf-950/30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-[#fffaf0] p-5 overflow-y-auto animate-rise rounded-l-[2rem]">
            <div className="flex items-center justify-between mb-4">
              <Brand />
              <button type="button" onClick={() => setOpen(false)} className="grid place-items-center w-10 h-10 rounded-lg border border-soil-200 hover:bg-soil-100 focus-ring" aria-label="ปิด">
                <X size={19} />
              </button>
            </div>

            <div className="space-y-0.5">
              {[...navItems, ...moreItems].map((item) => <MenuRow key={item.href} item={item} active={isActive(pathname, item.href)} onClick={() => setOpen(false)} />)}
            </div>

            <div className="mt-6 pt-4 border-t border-soil-200 space-y-0.5">
              {role === 'admin' ? (
                <>
                  <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-soil-100 focus-ring"><ShieldCheck size={18} /> จัดการข้อมูล (ผู้ดูแล)</Link>
                  <button type="button" onClick={() => { setOpen(false); logout(); }} className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-soil-100 focus-ring"><LogOut size={18} /> ออกจากระบบ</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] text-soil-600 hover:bg-soil-100 focus-ring"><LogIn size={18} /> เข้าสู่ระบบผู้ดูแล</Link>
              )}
            </div>
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
      className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition focus-ring ${active ? 'bg-corn-100 text-leaf-900' : 'text-soil-700 hover:bg-soil-100'}`}
    >
      <Icon name={item.icon} size={19} className={`shrink-0 ${active ? 'text-leaf-600' : 'text-soil-500'}`} />
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-[15.5px] leading-tight">{item.label}</span>
        <span className="block text-[12.5px] text-soil-500">{item.desc}</span>
      </span>
    </Link>
  );
}

/** แถบล่างบนมือถือ — ปุ่มสแกนเด่นตรงกลาง */
function MobileTabBar() {
  const pathname = usePathname();
  const tabs = [navItems[0], navItems[2], navItems[1], navItems[3], navItems[4]];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 no-print bg-white/95 backdrop-blur-md border-t border-[#f1e7d3] rounded-t-3xl pb-[env(safe-area-inset-bottom)]" aria-label="เมนูด่วน">
      <ul className="grid grid-cols-5">
        {tabs.map((item, i) => {
          const active = isActive(pathname, item.href);
          const center = i === 2;
          return (
            <li key={item.href} className="flex">
              <Link href={item.href} aria-current={active ? 'page' : undefined} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 focus-ring">
                <span
                  className={`grid place-items-center rounded-full transition ${
                    center
                      ? `w-12 h-12 -mt-5 border-4 border-white shadow-md ${active ? 'bg-corn-500 text-leaf-950' : 'bg-corn-400 text-leaf-950'}`
                      : `w-8 h-8 ${active ? 'text-leaf-700' : 'text-soil-500'}`
                  }`}
                >
                  <Icon name={item.icon} size={center ? 21 : 19} strokeWidth={active ? 2.4 : 1.8} />
                </span>
                <span className={`text-[11.5px] font-medium ${active ? 'text-leaf-800' : 'text-soil-500'}`}>{item.short}</span>
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
    <footer className="no-print mt-20 bg-white border-t border-[#f1e7d3] rounded-t-[2.5rem]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Brand />
          <p className="mt-3 text-[13.5px] text-soil-600 leading-relaxed max-w-md">
            ผู้ช่วยดูแลไร่ข้าวโพดด้วย AI จากมหาวิทยาลัยแม่โจ้ ถ่ายรูปแล้วรู้ว่าเป็นอะไร ต้องทำยังไงต่อ
          </p>
        </div>
        <div>
          <p className="text-[12px] font-medium text-soil-500 mb-3">อยากถามคนจริง ๆ?</p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13.5px]">
            {[
              { label: 'กรมวิชาการเกษตร', url: 'https://www.doa.go.th/' },
              { label: 'กรมส่งเสริมการเกษตร', url: 'https://www.doae.go.th/' },
              { label: 'สำนักงานเศรษฐกิจการเกษตร', url: 'https://oae.go.th/' },
              { label: 'คณะเทคโนโลยีการเกษตร ม.แม่โจ้', url: 'https://ap.mju.ac.th/wtms_index.aspx?&lang=th-TH' },
            ].map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-soil-700 hover:text-leaf-800 hover:underline focus-ring rounded">
                  {l.label} <ExternalLink size={12} className="shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-soil-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 text-[12.5px] text-soil-500 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <p>© {new Date().getFullYear()} มหาวิทยาลัยแม่โจ้ · ทำขึ้นเพื่อการเรียนรู้และช่วยเกษตรกร</p>
          <p>AI ช่วยดูเบื้องต้นเท่านั้น ก่อนใช้สารเคมีอย่าลืมอ่านฉลาก และถามเจ้าหน้าที่เกษตรในพื้นที่ด้วยนะครับ</p>
        </div>
      </div>
    </footer>
  );
}

/** โครงหน้าเว็บมาตรฐาน — ใช้ครอบทุกหน้า */
export default function SiteShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <>
      <Header />
      <main id="main" className={`flex-1 w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-28 lg:pb-16 overflow-x-hidden ${wide ? 'max-w-[1400px]' : 'max-w-6xl'}`}>
        {children}
      </main>
      <SiteFooter />
      <MobileTabBar />
      <AccessibilityPanel />
    </>
  );
}
