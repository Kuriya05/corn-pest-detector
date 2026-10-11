'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Accessibility, X, Play, Pause, Square, Mic, MicOff, Volume2, Contrast, Type, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { VOICE_EVENT } from '@/lib/voice';

/* ------------------------------------------------------------------
   ผู้ช่วยเสียง & การเข้าถึง
   - อ่านหน้านี้/ผลวิเคราะห์ให้ฟัง (Web Speech API ของเบราว์เซอร์ ไม่ต้องใช้อินเทอร์เน็ตกับเสียงอ่านส่วนใหญ่)
   - สั่งงานด้วยเสียง (ต้องใช้ Chrome/Edge/Safari ที่รองรับ SpeechRecognition)
   - ขยายตัวอักษร · คอนทราสต์สูง · คีย์ลัด Alt+R
------------------------------------------------------------------- */

const PREFS_KEY = 'maize_a11y_prefs_v1';
type Prefs = { rate: number; autoRead: boolean; zoom: number; contrast: boolean };
const DEFAULT_PREFS: Prefs = { rate: 0.95, autoRead: false, zoom: 1, contrast: false };
const ZOOMS = [1, 1.15, 1.3, 1.5];

/** คำสั่งเสียง → ปลายทาง (จับคู่แบบมีคำนี้อยู่ในประโยค เรียงตามลำดับความเฉพาะเจาะจง) */
const NAV_COMMANDS: { words: string[]; href: string; say: string }[] = [
  { words: ['ประเมินอาการ', 'เล่าอาการ', 'วินิจฉัยจากอาการ', 'อาการ'], href: '/diseases#advisor', say: 'ไปหน้าประเมินจากอาการ' },
  { words: ['สแกน', 'ถ่ายรูป', 'วิเคราะห์ภาพ', 'ตรวจใบ'], href: '/detect', say: 'ไปหน้าสแกนวินิจฉัย' },
  { words: ['แมลง', 'หนอน', 'ศัตรูพืช'], href: '/pests', say: 'ไปหน้าคลังแมลงศัตรู' },
  { words: ['โรค'], href: '/diseases', say: 'ไปหน้าคลังโรคข้าวโพด' },
  { words: ['ปุ๋ย'], href: '/fertilizer', say: 'ไปหน้าปุ๋ย' },
  { words: ['ปฏิทิน', 'ดูแลไร่'], href: '/calendar', say: 'ไปหน้าปฏิทินดูแลไร่' },
  { words: ['ซื้อ', 'ขาย', 'ร้านค้า', 'ช้อปปี้', 'ชอปปี้'], href: '/shop', say: 'ไปหน้าซื้อขาย' },
  { words: ['วัชพืช'], href: '/weeds', say: 'ไปหน้าวัชพืช' },
  { words: ['พันธุ์'], href: '/varieties', say: 'ไปหน้าพันธุ์ข้าวโพด' },
  { words: ['ประวัติ'], href: '/history', say: 'ไปหน้าประวัติการสแกน' },
  { words: ['หน้าแรก', 'กลับบ้าน', 'หน้าหลัก'], href: '/', say: 'กลับหน้าแรก' },
];

type SRInstance = {
  lang: string; continuous: boolean; interimResults: boolean;
  start: () => void; stop: () => void; abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
type SRCtor = new () => SRInstance;

/** แบ่งข้อความเป็นท่อนสั้น ๆ — Chrome จะอ่านตัดกลางคันถ้าประโยคยาวมาก */
function chunkText(raw: string, max = 150): string[] {
  const lines = raw.split(/\n+/).map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const out: string[] = [];
  for (const line of lines) {
    if (line.length <= max) { out.push(line); continue; }
    let rest = line;
    while (rest.length > max) {
      let cut = rest.lastIndexOf(' ', max);
      if (cut < max * 0.5) cut = max;
      out.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) out.push(rest);
  }
  return out;
}

export default function AccessibilityPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [hasThaiVoice, setHasThaiVoice] = useState(true);
  const [srSupported, setSrSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [status, setStatus] = useState('');

  const queueRef = useRef<string[]>([]);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const prefsRef = useRef(prefs);
  const recRef = useRef<SRInstance | null>(null);

  useEffect(() => { prefsRef.current = prefs; }, [prefs]);

  /* ---------- โหลดค่าที่ตั้งไว้ + ตรวจความสามารถของเบราว์เซอร์ ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch { /* ใช้ค่าเริ่มต้น */ }

    const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
    setSrSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));

    if (!('speechSynthesis' in window)) { setTtsSupported(false); return; }
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const th = voices.find((v) => v.lang.toLowerCase().startsWith('th')) ?? null;
      voiceRef.current = th;
      setHasThaiVoice(!!th || voices.length === 0); // voices ยังโหลดไม่เสร็จ = อย่าเพิ่งเตือน
    };
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, []);

  /* ---------- ใช้ค่าการแสดงผล (ขยายตัวอักษร / คอนทราสต์) ---------- */
  useEffect(() => {
    document.documentElement.style.setProperty('zoom', String(prefs.zoom));
    document.documentElement.classList.toggle('a11y-contrast', prefs.contrast);
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* ข้าม */ }
  }, [prefs]);

  const update = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }));

  /* ---------- อ่านออกเสียง ---------- */
  const stop = useCallback(() => {
    queueRef.current = [];
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    queueRef.current = chunkText(text);
    setSpeaking(true);
    setPaused(false);

    // อ่านทีละท่อน — จบท่อนหนึ่งค่อยเริ่มท่อนถัดไป
    function step() {
      const next = queueRef.current.shift();
      if (next === undefined) { setSpeaking(false); setPaused(false); return; }
      const u = new SpeechSynthesisUtterance(next);
      u.lang = 'th-TH';
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = prefsRef.current.rate;
      u.onend = step;
      u.onerror = (e) => { if (e.error !== 'canceled' && e.error !== 'interrupted') step(); };
      window.speechSynthesis.speak(u);
    }
    step();
  }, []);

  const readPage = useCallback(() => {
    const main = document.getElementById('main');
    const title = document.title.split('|')[0].trim();
    const body = main?.innerText ?? document.body.innerText;
    speak(`${title}\n${body}`);
  }, [speak]);

  const togglePause = () => {
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  };

  /* ---------- ฟังข้อความจากหน้าอื่น (ผลสแกน/ผลประเมิน) ---------- */
  useEffect(() => {
    const onSpeak = (e: Event) => {
      const { text, force } = (e as CustomEvent<{ text: string; force?: boolean }>).detail;
      if (force || prefsRef.current.autoRead) speak(text);
    };
    window.addEventListener(VOICE_EVENT, onSpeak);
    return () => window.removeEventListener(VOICE_EVENT, onSpeak);
  }, [speak]);

  /* ---------- คีย์ลัด Alt+R = อ่านหน้านี้/หยุด · Esc = ปิดแผง ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (window.speechSynthesis?.speaking) stop(); else readPage();
      } else if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, readPage, stop]);

  // เปลี่ยนหน้าแล้วหยุดอ่านของหน้าเก่า
  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);

  /* ---------- สั่งงานด้วยเสียง ---------- */
  const handleCommand = useCallback((raw: string) => {
    const said = raw.replace(/\s+/g, '').toLowerCase();
    setHeard(raw);
    if (!said) return;

    if (/หยุด|เงียบ|พอ/.test(said)) { stop(); setStatus('หยุดอ่านแล้ว'); return; }
    if (/อ่าน|ฟัง/.test(said)) { setStatus('กำลังอ่านหน้านี้'); readPage(); return; }
    if (/ใหญ่|ขยาย/.test(said)) { const i = Math.min(ZOOMS.indexOf(prefsRef.current.zoom) + 1, ZOOMS.length - 1); update({ zoom: ZOOMS[i < 0 ? 1 : i] }); speak('ขยายตัวอักษรแล้ว'); return; }
    if (/เล็ก|ย่อ/.test(said)) { const i = Math.max(ZOOMS.indexOf(prefsRef.current.zoom) - 1, 0); update({ zoom: ZOOMS[i] }); speak('ย่อตัวอักษรแล้ว'); return; }
    if (/ช่วย|คำสั่ง/.test(said)) {
      speak('คุณพูดได้ว่า สแกน, แมลง, โรค, ปุ๋ย, ปฏิทิน, ซื้อขาย, ประเมินอาการ, อ่านหน้านี้, หยุด, ตัวอักษรใหญ่ หรือกลับหน้าแรก');
      setStatus('บอกคำสั่งที่ใช้ได้แล้ว');
      return;
    }
    const hit = NAV_COMMANDS.find((c) => c.words.some((w) => said.includes(w)));
    if (hit) { setStatus(hit.say); speak(hit.say); router.push(hit.href); return; }
    setStatus('ยังไม่เข้าใจคำสั่งนี้ ลองพูดว่า “ช่วยเหลือ” เพื่อฟังคำสั่งทั้งหมด');
    speak('ยังไม่เข้าใจคำสั่งนี้ ลองพูดว่า ช่วยเหลือ');
  }, [readPage, router, speak, stop]);

  const toggleListen = () => {
    if (listening) { recRef.current?.stop(); return; }
    const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    stop(); // กันเสียงอ่านดังเข้าไมค์
    const rec = new Ctor();
    rec.lang = 'th-TH';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => { handleCommand(e.results[0][0].transcript); };
    rec.onerror = (e) => {
      setStatus(e.error === 'not-allowed' ? 'ยังไม่ได้อนุญาตให้ใช้ไมโครโฟน' : e.error === 'no-speech' ? 'ไม่ได้ยินเสียง ลองพูดอีกครั้ง' : 'ฟังไม่สำเร็จ ลองอีกครั้ง');
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setHeard('');
    setStatus('กำลังฟัง… พูดคำสั่งได้เลย');
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  };

  const zoomIdx = Math.max(ZOOMS.indexOf(prefs.zoom), 0);

  return (
    <>
      {/* ปุ่มลอย */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="ผู้ช่วยเสียงและการเข้าถึง"
        className="no-print fixed z-[60] right-4 bottom-24 lg:bottom-6 inline-flex items-center gap-2 rounded-full bg-leaf-700 pl-3.5 pr-4 py-3 text-white shadow-[0_14px_30px_-10px_rgb(23_65_31_/_0.7)] hover:bg-leaf-800 transition focus-ring"
      >
        <Accessibility size={20} />
        <span className="hidden sm:inline text-[14.5px] font-medium">ผู้ช่วยเสียง</span>
      </button>

      {open && (
        <div
          id="a11y-panel"
          role="dialog"
          aria-label="ผู้ช่วยเสียงและการเข้าถึง"
          className="no-print fixed z-[65] right-3 bottom-24 lg:bottom-6 w-[calc(100vw-1.5rem)] max-w-sm max-h-[80vh] overflow-y-auto rounded-[1.75rem] bg-white border border-[#f1e7d3] shadow-[0_30px_70px_-20px_rgb(23_65_31_/_0.5)] p-5 animate-rise"
        >
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-corn-300 text-leaf-950"><Volume2 size={19} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[18px] text-leaf-950 leading-tight">ผู้ช่วยเสียง</h2>
              <p className="text-[12.5px] text-soil-500">อ่านให้ฟัง · สั่งด้วยเสียง · ปรับให้อ่านง่าย</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="ปิดแผง" className="grid place-items-center w-9 h-9 rounded-full bg-soil-100 text-leaf-900 hover:bg-soil-200 focus-ring"><X size={17} /></button>
          </div>

          {!ttsSupported && (
            <p className="mt-4 flex gap-2 rounded-2xl bg-corn-50 border border-corn-200 p-3 text-[13px] text-corn-900"><AlertTriangle size={16} className="shrink-0 mt-0.5" /> เบราว์เซอร์นี้ยังไม่รองรับการอ่านออกเสียง ลองใช้ Chrome, Edge หรือ Safari</p>
          )}
          {ttsSupported && !hasThaiVoice && (
            <p className="mt-4 flex gap-2 rounded-2xl bg-corn-50 border border-corn-200 p-3 text-[13px] text-corn-900"><AlertTriangle size={16} className="shrink-0 mt-0.5" /> อุปกรณ์นี้ยังไม่มีเสียงภาษาไทย เสียงอาจอ่านไม่ชัด — ติดตั้งเสียงไทยได้ที่การตั้งค่าภาษา/เสียงของเครื่อง</p>
          )}

          {/* 1) อ่านให้ฟัง */}
          <section className="mt-5" aria-label="อ่านให้ฟัง">
            <h3 className="text-[15px] text-leaf-950 mb-2">ฟังหน้านี้</h3>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <button type="button" onClick={readPage} disabled={!ttsSupported}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-leaf-700 px-4 py-3 font-medium text-white hover:bg-leaf-800 disabled:opacity-50 transition focus-ring">
                <Play size={17} /> อ่านหน้านี้ให้ฟัง
              </button>
              <button type="button" onClick={togglePause} disabled={!speaking} aria-label={paused ? 'อ่านต่อ' : 'หยุดชั่วคราว'}
                className="grid place-items-center w-12 rounded-full bg-corn-100 text-leaf-900 hover:bg-corn-200 disabled:opacity-40 transition focus-ring">
                {paused ? <Play size={17} /> : <Pause size={17} />}
              </button>
              <button type="button" onClick={stop} disabled={!speaking} aria-label="หยุดอ่าน"
                className="grid place-items-center w-12 rounded-full bg-soil-100 text-leaf-900 hover:bg-soil-200 disabled:opacity-40 transition focus-ring">
                <Square size={16} />
              </button>
            </div>
            <label className="mt-3 block">
              <span className="flex justify-between text-[13px] text-soil-600"><span>ความเร็วเสียง</span><span className="tabular-nums">{prefs.rate.toFixed(2)}×</span></span>
              <input type="range" min={0.6} max={1.4} step={0.05} value={prefs.rate} onChange={(e) => update({ rate: Number(e.target.value) })}
                className="w-full accent-leaf-600 mt-1" aria-label="ความเร็วเสียง" />
            </label>
            <label className="mt-2 flex items-start gap-3 rounded-2xl bg-leaf-50 p-3 cursor-pointer">
              <input type="checkbox" checked={prefs.autoRead} onChange={(e) => update({ autoRead: e.target.checked })} className="mt-1 w-5 h-5 accent-leaf-600" />
              <span className="text-[14px] text-leaf-900 leading-snug"><span className="font-medium">อ่านผลวิเคราะห์ให้อัตโนมัติ</span><br /><span className="text-[12.5px] text-soil-600">พอสแกนหรือประเมินอาการเสร็จ จะอ่านผลให้ฟังทันที</span></span>
            </label>
          </section>

          {/* 2) สั่งด้วยเสียง */}
          <section className="mt-5" aria-label="สั่งงานด้วยเสียง">
            <h3 className="text-[15px] text-leaf-950 mb-2">สั่งงานด้วยเสียง</h3>
            {srSupported ? (
              <>
                <button type="button" onClick={toggleListen} aria-pressed={listening}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-medium transition focus-ring ${listening ? 'bg-rose-600 text-white animate-pulse' : 'bg-corn-400 text-leaf-950 hover:bg-corn-300'}`}>
                  {listening ? <><MicOff size={18} /> กำลังฟัง… (กดเพื่อหยุด)</> : <><Mic size={18} /> กดแล้วพูดคำสั่ง</>}
                </button>
                <p className="mt-2 text-[12.5px] text-soil-500 leading-relaxed">ลองพูดว่า “สแกน” “แมลง” “โรค” “ซื้อขาย” “ประเมินอาการ” “อ่านหน้านี้” “หยุด” “ตัวอักษรใหญ่” หรือ “ช่วยเหลือ”</p>
              </>
            ) : (
              <p className="rounded-2xl bg-soil-50 p-3 text-[13px] text-soil-600">เบราว์เซอร์นี้ยังไม่รองรับการสั่งด้วยเสียง (ใช้ Chrome หรือ Edge บนคอมพิวเตอร์/Android ได้)</p>
            )}
            {(heard || status) && (
              <div className="mt-2 rounded-2xl bg-soil-50 p-3 text-[13.5px]" role="status" aria-live="polite">
                {heard && <p className="text-soil-600">ได้ยินว่า: <span className="font-medium text-leaf-900">“{heard}”</span></p>}
                {status && <p className="flex gap-1.5 text-leaf-800"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-leaf-600" /> {status}</p>}
              </div>
            )}
          </section>

          {/* 3) ปรับการแสดงผล */}
          <section className="mt-5" aria-label="ปรับการแสดงผล">
            <h3 className="text-[15px] text-leaf-950 mb-2">ปรับให้อ่านง่าย</h3>
            <div className="flex items-center gap-2">
              <Type size={18} className="text-leaf-600 shrink-0" />
              <div className="flex flex-1 rounded-full bg-soil-100 p-1" role="group" aria-label="ขนาดตัวอักษร">
                {ZOOMS.map((z, i) => (
                  <button key={z} type="button" aria-pressed={zoomIdx === i} onClick={() => update({ zoom: z })} aria-label={`ขนาดตัวอักษร ${Math.round(z * 100)} เปอร์เซ็นต์`}
                    className={`flex-1 rounded-full py-2 font-medium transition focus-ring ${zoomIdx === i ? 'bg-white text-leaf-900 shadow-sm' : 'text-soil-600'}`}
                    style={{ fontSize: `${13 + i * 2.5}px` }}>ก</button>
                ))}
              </div>
            </div>
            <label className="mt-2 flex items-center gap-3 rounded-2xl bg-soil-50 p-3 cursor-pointer">
              <Contrast size={18} className="text-leaf-600 shrink-0" />
              <span className="flex-1 text-[14px] text-leaf-900">สีคมชัดสูง (ตัวเข้ม ขอบหนา)</span>
              <input type="checkbox" checked={prefs.contrast} onChange={(e) => update({ contrast: e.target.checked })} className="w-5 h-5 accent-leaf-600" />
            </label>
          </section>

          <p className="mt-4 text-[12px] text-soil-500">คีย์ลัด: กด <kbd className="rounded bg-soil-100 px-1.5 py-0.5 font-sans">Alt</kbd> + <kbd className="rounded bg-soil-100 px-1.5 py-0.5 font-sans">R</kbd> เพื่ออ่านหน้านี้หรือหยุดอ่านได้ทุกหน้า</p>
        </div>
      )}
    </>
  );
}
