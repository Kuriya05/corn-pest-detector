'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  Trophy, Flame, CheckCircle2, XCircle, ArrowRight, RotateCw, Play, Bug, Leaf, Sprout, FlaskConical, Lightbulb, Eye, ExternalLink,
} from 'lucide-react';
import { Chip, LoadState, SeverityBadge } from '@/components/ui';
import { toImages } from '@/components/image-gallery';
import { useCollection } from '@/lib/use-collection';
import type { Pest, Disease, Weed } from '@/lib/data/types';
import type { Deficiency } from '@/lib/data/fertilizer';

/* ---------- ชนิดคำถาม ---------- */
type ModeId = 'all' | 'pests' | 'diseases' | 'weeds' | 'deficiencies';
type Group = Exclude<ModeId, 'all'>;
const MODES: { id: ModeId; label: string }[] = [
  { id: 'all', label: 'ทุกหมวด' },
  { id: 'pests', label: 'แมลงศัตรู' },
  { id: 'diseases', label: 'โรคข้าวโพด' },
  { id: 'weeds', label: 'วัชพืช' },
  { id: 'deficiencies', label: 'ขาดธาตุอาหาร' },
];

/** รายการที่ตั้งคำถามได้ — ชื่อ คำใบ้ และความรู้ที่แสดงหลังตอบ */
type Entry = {
  key: string; group: Group; name: string; href: string; image?: string;
  clues: string[]; hide: string[];
  summary?: string; severity?: string; tips: string[]; tipLabel: string;
};
type Question = { entry: Entry; clue: string; choices: Entry[] };

const GROUP_LABEL: Record<Group, string> = { pests: 'แมลงศัตรู', diseases: 'โรค', weeds: 'วัชพืช', deficiencies: 'ขาดธาตุ' };
const PROMPT: Record<Group, string> = {
  pests: 'ลักษณะแบบนี้คือศัตรูข้าวโพดชนิดใด?',
  diseases: 'อาการแบบนี้คือโรคอะไร?',
  weeds: 'วัชพืชที่มีลักษณะแบบนี้คืออะไร?',
  deficiencies: 'อาการแบบนี้ข้าวโพดขาดธาตุอะไร?',
};
/** ภาพแทนเมื่อรายการยังไม่มีรูปในฐานข้อมูล */
const GROUP_ART: Record<Group, { Icon: ComponentType<{ size?: number; className?: string }>; bg: string; fg: string }> = {
  pests: { Icon: Bug, bg: 'from-orange-100 to-corn-100', fg: 'text-orange-600' },
  diseases: { Icon: Leaf, bg: 'from-amber-100 to-lime-100', fg: 'text-amber-700' },
  weeds: { Icon: Sprout, bg: 'from-lime-100 to-leaf-100', fg: 'text-lime-700' },
  deficiencies: { Icon: FlaskConical, bg: 'from-sky-100 to-leaf-50', fg: 'text-sky-700' },
};

const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : []);
const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v : undefined);
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** ปิดชื่อที่เป็นคำตอบในคำใบ้ ไม่ให้เฉลยตัวเอง */
function mask(text: string, hide: string[]): string {
  let out = text;
  for (const h of hide) {
    if (h.length < 2) continue;
    out = out.split(h).join('＿＿＿');
  }
  return out;
}

/** กันรายการที่ผู้ดูแลพิมพ์ทดสอบไว้ เช่น "ะะะะ" ไม่ให้โผล่เป็นตัวเลือก */
const okName = (s: unknown): s is string => typeof s === 'string' && /[ก-ฮA-Za-z].*[ก-ฮA-Za-z]/.test(s);

function stripParen(s: string) {
  return s.replace(/\s*\(.*?\)\s*/g, ' ').trim();
}

/** คะแนนสูงสุดเก็บไว้ในเครื่องผู้เล่น (ถ้าเบราว์เซอร์ไม่ให้เก็บก็เล่นได้ตามปกติ) */
const BEST_KEY = 'corn-quiz-best';
function readBest(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
}
function writeBest(v: Record<string, number>) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(v));
  } catch { /* ไม่เป็นไร */ }
}

function Picture({ entry, className = '' }: { entry: Entry; className?: string }) {
  if (entry.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={entry.image} alt="ภาพสำหรับทาย" className={`w-full object-cover bg-leaf-50 ${className}`} />;
  }
  const art = GROUP_ART[entry.group];
  return (
    <div className={`grid place-items-center bg-gradient-to-br ${art.bg} ${className}`} aria-hidden>
      <art.Icon size={56} className={`${art.fg} opacity-80`} />
    </div>
  );
}

/**
 * เกมทายศัตรูข้าวโพด — สุ่มคำถามจากคลังความรู้ในฐานข้อมูล
 * หลังตอบแต่ละข้อจะสรุปความรู้สั้น ๆ ของรายการนั้น (จุดสังเกตและวิธีจัดการเบื้องต้น)
 */
export default function PestQuiz({ rounds = 10, compact = false }: { rounds?: number; compact?: boolean }) {
  const pests = useCollection<Pest>('pests');
  const diseases = useCollection<Disease>('diseases');
  const weeds = useCollection<Weed>('weeds');
  const defs = useCollection<Deficiency>('deficiencies');
  const all = [pests, diseases, weeds, defs];
  const loading = all.some((c) => c.loading);
  const error = all.find((c) => c.error)?.error ?? null;
  const reload = () => all.forEach((c) => c.error && c.reload());

  const entries = useMemo<Entry[]>(() => {
    const out: Entry[] = [];
    for (const p of pests.items) {
      if (!okName(p.nameTh)) continue;
      out.push({
        key: `p-${p.id}`, group: 'pests', name: p.nameTh, href: `/pests#${p.id}`, image: toImages(p)[0],
        clues: [...strs(p.identify), ...strs(p.damage)],
        hide: [p.nameTh, stripParen(p.nameTh), ...strs(p.aliases)],
        summary: str(p.summary), severity: str(p.severity), tips: strs(p.cultural).slice(0, 2), tipLabel: 'วิธีจัดการเบื้องต้น',
      });
    }
    for (const d of diseases.items) {
      if (!okName(d.nameTh)) continue;
      out.push({
        key: `d-${d.id}`, group: 'diseases', name: d.nameTh, href: `/diseases#${d.id}`, image: toImages(d)[0],
        clues: strs(d.symptoms), hide: [d.nameTh, stripParen(d.nameTh)],
        summary: str(d.summary), severity: str(d.severity), tips: strs(d.cultural).slice(0, 2), tipLabel: 'วิธีป้องกันเบื้องต้น',
      });
    }
    for (const w of weeds.items) {
      if (!okName(w.nameTh)) continue;
      out.push({
        key: `w-${w.id}`, group: 'weeds', name: w.nameTh, href: `/weeds#${w.id}`, image: toImages(w)[0],
        clues: strs(w.identify), hide: [w.nameTh, stripParen(w.nameTh), ...strs(w.localNames)],
        summary: str(w.summary), tips: strs(w.cultural).slice(0, 2), tipLabel: 'วิธีกำจัดเบื้องต้น',
      });
    }
    for (const f of defs.items) {
      if (!okName(f.nutrient)) continue;
      out.push({
        key: `f-${f.id}`, group: 'deficiencies', name: f.symbol ? `${f.nutrient} (${f.symbol})` : f.nutrient, href: `/fertilizer#${f.id}`,
        image: toImages(f)[0], clues: [f.quickSign, ...strs(f.symptoms)].filter(Boolean), hide: [f.nutrient],
        summary: str(f.cause), tips: [str(f.fix)].filter((x): x is string => Boolean(x)), tipLabel: 'วิธีแก้',
      });
    }
    return out.filter((e) => e.clues.length > 0);
  }, [pests.items, diseases.items, weeds.items, defs.items]);

  const [mode, setMode] = useState<ModeId>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [best, setBest] = useState<Record<string, number>>({});
  const [newRecord, setNewRecord] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setBest(readBest()), []);

  const pool = entries.filter((e) => mode === 'all' || e.group === mode);
  const playing = questions.length > 0 && index < questions.length;
  const finished = questions.length > 0 && index >= questions.length;
  const q = playing ? questions[index] : null;
  const bestKey = `${mode}-${rounds}`;

  const start = () => {
    // ข้อที่มีรูปขึ้นก่อน เพื่อให้ได้เห็นภาพจริงบ่อยขึ้น
    const shuffled = shuffle(pool);
    const chosen = [...shuffled.filter((e) => e.image), ...shuffled.filter((e) => !e.image)].slice(0, Math.min(rounds, pool.length));
    const qs = shuffle(chosen).map<Question>((entry) => {
      // ตัวเลือกหลอกมาจากหมวดเดียวกัน คำถามจะได้ไม่ง่ายเกินไป
      const same = shuffle(entries.filter((e) => e.group === entry.group && e.key !== entry.key && e.name !== entry.name));
      const distractors: Entry[] = [];
      for (const e of same) {
        if (distractors.length >= 3) break;
        if (!distractors.some((d) => d.name === e.name)) distractors.push(e);
      }
      return { entry, clue: mask(pick(entry.clues), entry.hide), choices: shuffle([entry, ...distractors]) };
    });
    setQuestions(qs);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setNewRecord(false);
  };

  const answer = (key: string) => {
    if (!q || picked) return;
    setPicked(key);
    if (key === q.entry.key) {
      // ตอบถูกต่อเนื่องได้โบนัส สูงสุด +5
      const nextStreak = streak + 1;
      setScore((s) => s + 10 + Math.min(nextStreak - 1, 5));
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    const ni = index + 1;
    setIndex(ni);
    setPicked(null);
    if (ni >= questions.length && score > (best[bestKey] ?? 0)) {
      const updated = { ...best, [bestKey]: score };
      setBest(updated);
      writeBest(updated);
      setNewRecord(true);
    }
  };

  const maxScore = questions.length * 15;

  if (loading || error) return <LoadState loading={loading} error={error} onRetry={reload} label="คำถาม" />;

  if (playing && q) {
    const correct = picked === q.entry.key;
    // จุดสังเกตอีกข้อที่ไม่ซ้ำกับคำใบ้ที่ใช้ถาม
    const extra = q.entry.clues.map((c) => mask(c, q.entry.hide)).find((c) => c !== q.clue);
    return (
      <div className={compact ? '' : 'mx-auto max-w-3xl'}>
        <div className="mb-4 flex items-center gap-3 text-[14px] text-leaf-700">
          <span className="font-extrabold text-leaf-900">ข้อ {index + 1}/{questions.length}</span>
          <div className="h-2 flex-1 rounded-full bg-leaf-100 overflow-hidden" aria-hidden>
            <div className="h-full rounded-full bg-leaf-500 transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <span className="inline-flex items-center gap-1 tabular-nums"><Trophy size={15} className="text-corn-600" /> {score}</span>
          {streak >= 2 && <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[12.5px] font-extrabold text-orange-700"><Flame size={13} /> {streak}</span>}
        </div>

        <div className="rounded-4xl bg-white border border-leaf-100 shadow-[0_14px_32px_-22px_rgb(23_71_48_/_0.45)] overflow-hidden">
          <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Picture entry={q.entry} className="h-48 md:h-full md:min-h-[17rem]" />
            <div className="p-5 sm:p-6">
              <p className="text-[12.5px] font-extrabold uppercase tracking-wide text-leaf-600">{GROUP_LABEL[q.entry.group]}</p>
              <h3 className="mt-1 text-[19px] sm:text-[21px] font-extrabold text-leaf-900">{PROMPT[q.entry.group]}</h3>
              <blockquote className="mt-3 rounded-3xl bg-leaf-50 px-4 py-3 text-[15.5px] leading-relaxed text-leaf-900">“{q.clue}”</blockquote>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {q.choices.map((c) => {
                  const isAnswer = c.key === q.entry.key;
                  const isPicked = c.key === picked;
                  const state = !picked ? 'idle' : isAnswer ? 'right' : isPicked ? 'wrong' : 'dim';
                  const cls = {
                    idle: 'bg-white border-leaf-200 hover:border-leaf-400 hover:bg-leaf-50',
                    right: 'bg-leaf-100 border-leaf-500 text-leaf-900',
                    wrong: 'bg-rose-50 border-rose-400 text-rose-900',
                    dim: 'bg-white border-leaf-100 opacity-60',
                  }[state];
                  return (
                    <button
                      key={c.key}
                      type="button"
                      disabled={Boolean(picked)}
                      onClick={() => answer(c.key)}
                      className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-left text-[15px] font-medium transition focus-ring ${cls}`}
                    >
                      {state === 'right' && <CheckCircle2 size={18} className="shrink-0 text-leaf-600" />}
                      {state === 'wrong' && <XCircle size={18} className="shrink-0 text-rose-600" />}
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {picked && (
            <div role="status" className={`border-t px-5 py-5 sm:px-6 ${correct ? 'bg-leaf-50/70 border-leaf-100' : 'bg-corn-50/70 border-corn-100'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-[16px] font-extrabold ${correct ? 'text-leaf-700' : 'text-rose-700'}`}>
                  {correct ? <><CheckCircle2 size={18} /> ถูกต้อง!</> : <><XCircle size={18} /> ยังไม่ใช่</>}
                </span>
                <span className="text-[15.5px] text-leaf-900">คำตอบคือ <strong>{q.entry.name}</strong></span>
                {q.entry.severity && <SeverityBadge level={q.entry.severity} />}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {q.entry.summary && (
                  <div className="rounded-3xl bg-white border border-leaf-100 p-4 sm:col-span-2">
                    <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-leaf-700"><Lightbulb size={15} className="text-corn-600" /> รู้จักสั้น ๆ</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-leaf-900">{q.entry.summary}</p>
                  </div>
                )}
                {extra && (
                  <div className="rounded-3xl bg-white border border-leaf-100 p-4">
                    <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-leaf-700"><Eye size={15} /> จุดสังเกตเพิ่ม</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-leaf-900">{extra}</p>
                  </div>
                )}
                {q.entry.tips.length > 0 && (
                  <div className={`rounded-3xl bg-white border border-leaf-100 p-4 ${extra ? '' : 'sm:col-span-2'}`}>
                    <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-leaf-700"><CheckCircle2 size={15} /> {q.entry.tipLabel}</p>
                    <ul className="mt-1 space-y-1">
                      {q.entry.tips.map((t) => <li key={t} className="text-[14px] leading-relaxed text-leaf-900">• {t}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-2xl bg-leaf-900 px-5 py-2.5 text-[14.5px] font-medium text-white hover:bg-leaf-800 focus-ring">
                  {index + 1 < questions.length ? 'ข้อต่อไป' : 'ดูผลคะแนน'} <ArrowRight size={16} />
                </button>
                <Link href={q.entry.href} target="_blank" className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-[14px] text-leaf-700 hover:bg-white focus-ring">
                  อ่านข้อมูลเต็ม <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'mx-auto max-w-2xl'}>
      {finished && (
        <div className="mb-5 rounded-4xl bg-leaf-900 text-white p-6 sm:p-7 text-center">
          <Trophy size={36} className="mx-auto text-corn-300" />
          <p className="mt-2 text-[15px] text-leaf-200">คะแนนรอบนี้</p>
          <p className="font-display text-[52px] leading-none tabular-nums">{score}<span className="text-[20px] text-leaf-300"> / {maxScore}</span></p>
          <p className="mt-3 text-[14.5px] text-leaf-100">
            {score >= maxScore * 0.8 ? 'เก่งมาก! ตาแม่นระดับนักวิชาการเกษตร' : score >= maxScore * 0.5 ? 'ดีเลย อีกนิดเดียวก็แม่นแล้ว' : 'ลองอ่านคลังความรู้เพิ่มแล้วกลับมาเล่นใหม่นะ'}
            {bestStreak >= 3 && ` · ตอบถูกติดกันสูงสุด ${bestStreak} ข้อ`}
          </p>
          {newRecord && <p className="mt-3 inline-block rounded-full bg-corn-400 px-4 py-1 text-[13.5px] font-extrabold text-leaf-950">สถิติใหม่ของหมวดนี้!</p>}
        </div>
      )}

      <div className="rounded-4xl bg-white border border-leaf-100 p-5 sm:p-7">
        <p className="text-[16px] font-extrabold text-leaf-900">เลือกหมวดที่จะเล่น</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MODES.map((m) => {
            const n = entries.filter((e) => m.id === 'all' || e.group === m.id).length;
            return (
              <Chip key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
                {m.label} <span className="opacity-60">({n})</span>
              </Chip>
            );
          })}
        </div>
        <ul className="mt-4 space-y-1 text-[14px] text-leaf-700">
          <li>• รอบละ {Math.min(rounds, pool.length)} ข้อ ตอบถูกได้ 10 คะแนน ตอบถูกติดกันได้โบนัสเพิ่ม</li>
          <li>• ตอบแล้วจะมีสรุปความรู้และวิธีจัดการของข้อนั้นให้อ่าน</li>
          {best[bestKey] !== undefined && <li>• สถิติสูงสุดของหมวดนี้ในเครื่องนี้: <strong className="text-leaf-900">{best[bestKey]}</strong> คะแนน</li>}
        </ul>
        <button
          type="button"
          onClick={start}
          disabled={pool.length < 2}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-corn-400 px-6 py-3 text-[16px] font-extrabold text-leaf-950 hover:bg-corn-300 disabled:opacity-50 focus-ring"
        >
          {finished ? <><RotateCw size={18} /> เล่นอีกรอบ</> : <><Play size={18} /> เริ่มเกม</>}
        </button>
        {pool.length < 2 && <p className="mt-2 text-[13.5px] text-rose-700">หมวดนี้ยังมีข้อมูลไม่พอตั้งคำถาม</p>}
      </div>
    </div>
  );
}
