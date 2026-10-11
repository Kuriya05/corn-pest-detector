'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, Mic, MicOff, Volume2, Trash2, Sprout, ArrowUpRight, Loader2, Sparkles, NotebookPen } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { speakResult } from '@/lib/voice';
import { useFarm, ageDays, stageForAge } from '@/lib/farm';

type ChatMsg = { id: string; role: 'user' | 'ai'; text: string; links?: { label: string; href: string }[]; followUps?: string[]; error?: boolean };

const KEY = 'maize_chat_v1';
const SUGGESTIONS = [
  'ใบข้าวโพดมีรูพรุนและยอดกุด เป็นอะไร',
  'ข้าวโพดอายุ 30 วันควรใส่ปุ๋ยสูตรไหน',
  'ฝนตกติดกัน ต้องระวังโรคอะไรบ้าง',
  'เมื่อไรถึงควรพ่นสารฆ่าแมลง',
  'ข้าวโพดหลังนาควรปลูกเดือนไหน',
];

type SRInstance = { lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };
type SRCtor = new () => SRInstance;
const mid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function ChatPage() {
  const farm = useFarm();
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [plotId, setPlotId] = useState('');
  const [listening, setListening] = useState(false);
  const [srOk, setSrOk] = useState(false);
  const [micMsg, setMicMsg] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SRInstance | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]') as ChatMsg[];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved)) setMsgs(saved.slice(-30));
    } catch { /* เริ่มแชทใหม่ */ }
    const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
    setSrOk(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(msgs.slice(-30))); } catch { /* ข้าม */ }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, loading]);

  const plot = farm.plots.find((p) => p.id === plotId);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const next: ChatMsg[] = [...msgs, { id: mid(), role: 'user', text: q }];
    setMsgs(next);
    setInput('');
    setLoading(true);
    try {
      const age = plot ? ageDays(plot.plantedOn) : undefined;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.filter((m) => !m.error).slice(-10).map((m) => ({ role: m.role, text: m.text })),
          plot: plot ? { name: plot.name, ageDays: age, stage: age !== undefined ? stageForAge(age)?.name : undefined, province: plot.province } : undefined,
        }),
      });
      const data = await res.json().catch(() => ({ success: false, error: 'ได้รับคำตอบที่อ่านไม่ได้' }));
      if (!res.ok || !data.success) {
        setMsgs((m) => [...m, { id: mid(), role: 'ai', text: data.error || 'ตอบไม่สำเร็จ ลองใหม่อีกครั้งนะครับ', error: true }]);
      } else {
        setMsgs((m) => [...m, { id: mid(), role: 'ai', text: data.answer, links: data.links, followUps: data.followUps }]);
        speakResult(data.answer); // อ่านให้ฟังอัตโนมัติถ้าเปิดไว้ในผู้ช่วยเสียง
      }
    } catch {
      setMsgs((m) => [...m, { id: mid(), role: 'ai', text: 'เชื่อมต่อไม่ได้ ลองเช็กอินเทอร์เน็ตแล้วถามใหม่นะครับ', error: true }]);
    } finally {
      setLoading(false);
      taRef.current?.focus();
    }
  }, [msgs, loading, plot]);

  const toggleMic = () => {
    if (listening) { recRef.current?.stop(); return; }
    const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const rec = new Ctor();
    rec.lang = 'th-TH'; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e) => { const t = e.results[0][0].transcript; setInput((cur) => (cur ? `${cur} ${t}` : t)); setMicMsg(''); };
    rec.onerror = (e) => setMicMsg(e.error === 'not-allowed' ? 'ยังไม่ได้อนุญาตให้ใช้ไมโครโฟน' : e.error === 'no-speech' ? 'ไม่ได้ยินเสียง ลองพูดอีกครั้ง' : 'ฟังไม่สำเร็จ ลองอีกครั้ง');
    rec.onend = () => setListening(false);
    recRef.current = rec; setMicMsg(''); setListening(true);
    try { rec.start(); } catch { setListening(false); }
  };

  return (
    <SiteShell>
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-leaf-200 via-leaf-100 to-corn-100 px-6 py-9 sm:px-12 sm:py-12 animate-rise">
        <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-white/40" aria-hidden />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-[13.5px] font-medium text-leaf-800"><Sparkles size={15} className="text-leaf-600" /> ถามน้องข้าวโพด (AI)</p>
          <h1 className="mt-4 text-[34px] sm:text-[46px] leading-[1.12] text-leaf-950">สงสัยอะไรเรื่องข้าวโพด<br />ถามได้เลย</h1>
          <p className="mt-3 text-[16px] text-soil-700 max-w-xl leading-relaxed">พิมพ์หรือพูดก็ได้ ตอบจากคลังความรู้ในเว็บนี้ พร้อมลิงก์ไปอ่านต่อ และอ่านคำตอบให้ฟังได้</p>
        </div>
      </header>

      <div className="mt-6 mx-auto max-w-3xl">
        {farm.plots.length > 0 && (
          <label className="flex flex-wrap items-center gap-3 rounded-2xl bg-white border border-[#f1e7d3] px-4 py-3 text-[14.5px]">
            <span className="flex items-center gap-2 font-medium text-leaf-900"><NotebookPen size={16} className="text-leaf-600" /> ถามเกี่ยวกับแปลง</span>
            <select value={plotId} onChange={(e) => setPlotId(e.target.value)} className="flex-1 min-w-[10rem] rounded-xl bg-soil-50 ring-1 ring-soil-200 px-3 py-2 focus-ring">
              <option value="">— ไม่ระบุ —</option>
              {farm.plots.map((p) => <option key={p.id} value={p.id}>{p.name} · อายุ {Math.max(ageDays(p.plantedOn), 0)} วัน</option>)}
            </select>
          </label>
        )}

        <div className="mt-4 rounded-[2rem] bg-white border border-[#f1e7d3] shadow-[0_14px_32px_-22px_rgb(122_82_12_/_0.35)] overflow-hidden">
          <div className="px-4 sm:px-6 py-6 min-h-[22rem] max-h-[60vh] overflow-y-auto space-y-5" role="log" aria-live="polite" aria-label="บทสนทนา">
            {msgs.length === 0 && (
              <div className="text-center py-6">
                <span className="mx-auto grid place-items-center w-14 h-14 rounded-3xl bg-leaf-100 text-leaf-700"><Sprout size={26} /></span>
                <p className="mt-3 font-display text-[20px] text-leaf-950">สวัสดีครับ ผมน้องข้าวโพด</p>
                <p className="text-[14.5px] text-soil-600">ลองถามอย่างใดอย่างหนึ่งนี้ดูก็ได้</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)} className="rounded-full bg-corn-100 px-4 py-2 text-[14px] text-leaf-900 hover:bg-corn-200 transition focus-ring">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-3xl px-5 py-3.5 ${m.role === 'user' ? 'bg-leaf-700 text-white rounded-br-lg' : m.error ? 'bg-rose-50 text-rose-800 rounded-bl-lg' : 'bg-soil-50 text-leaf-950 rounded-bl-lg'}`}>
                  <p className="text-[15.5px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  {m.role === 'ai' && !m.error && (
                    <>
                      {m.links && m.links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.links.map((l) => (
                            <Link key={l.href} href={l.href} className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[13.5px] font-medium text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50 focus-ring">{l.label} <ArrowUpRight size={13} /></Link>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => speakResult(m.text, true)} className="inline-flex items-center gap-1.5 rounded-full bg-corn-200 px-3.5 py-1.5 text-[13px] font-medium text-leaf-950 hover:bg-corn-300 focus-ring"><Volume2 size={14} /> ฟัง</button>
                      </div>
                      {m.followUps && m.followUps.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.followUps.map((f) => (
                            <button key={f} type="button" onClick={() => send(f)} disabled={loading} className="rounded-full bg-white px-3.5 py-1.5 text-[13.5px] text-soil-700 ring-1 ring-soil-200 hover:bg-soil-100 disabled:opacity-50 focus-ring">{f}</button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start" role="status" aria-label="กำลังพิมพ์คำตอบ">
                <div className="rounded-3xl rounded-bl-lg bg-soil-50 px-5 py-4 flex items-center gap-2 text-soil-500 text-[14px]"><Loader2 size={16} className="animate-spin" /> กำลังหาคำตอบ…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-[#f1e7d3] p-3 sm:p-4 bg-[#fffdf8]">
            {micMsg && <p role="status" className="mb-2 px-2 text-[13px] text-rose-600">{micMsg}</p>}
            <div className="flex items-end gap-2">
              <textarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)} rows={1} maxLength={1000}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input); } }}
                placeholder={listening ? 'กำลังฟัง… พูดได้เลย' : 'พิมพ์คำถามที่นี่ (Enter เพื่อส่ง)'} aria-label="พิมพ์คำถาม"
                className="flex-1 resize-none rounded-3xl bg-white ring-1 ring-soil-300 px-5 py-3.5 text-[16px] max-h-36 focus-ring" />
              {srOk && (
                <button type="button" onClick={toggleMic} aria-pressed={listening} aria-label={listening ? 'หยุดฟัง' : 'พูดแทนการพิมพ์'}
                  className={`grid place-items-center w-12 h-12 rounded-full shrink-0 transition focus-ring ${listening ? 'bg-rose-600 text-white animate-pulse' : 'bg-corn-300 text-leaf-950 hover:bg-corn-400'}`}>
                  {listening ? <MicOff size={19} /> : <Mic size={19} />}
                </button>
              )}
              <button type="submit" disabled={loading || !input.trim()} aria-label="ส่ง" className="grid place-items-center w-12 h-12 rounded-full bg-leaf-700 text-white hover:bg-leaf-800 disabled:bg-soil-300 disabled:cursor-not-allowed shrink-0 focus-ring"><Send size={18} /></button>
            </div>
            <div className="mt-2 flex items-center justify-between px-2 text-[12px] text-soil-500">
              <span>AI อาจตอบพลาดได้ ก่อนใช้สารเคมีให้ถามเจ้าหน้าที่เกษตรในพื้นที่อีกที</span>
              {msgs.length > 0 && <button type="button" onClick={() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setMsgs([]); }} className="inline-flex items-center gap-1 text-soil-500 hover:text-rose-600 focus-ring rounded"><Trash2 size={13} /> ล้างแชท</button>}
            </div>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}
