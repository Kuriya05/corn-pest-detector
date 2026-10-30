'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Trophy, Flame, CheckCircle2, XCircle, ArrowRight, RotateCw, Play } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Chip, LoadState } from '@/components/ui';
import { toImages } from '@/components/image-gallery';
import { useCollection } from '@/lib/use-collection';
import type { Pest, Disease, Weed } from '@/lib/data/types';
import type { Deficiency } from '@/lib/data/fertilizer';

/* ---------- ชนิดคำถาม ---------- */
type ModeId = 'all' | 'pests' | 'diseases' | 'weeds' | 'deficiencies';
const MODES: { id: ModeId; label: string }[] = [
  { id: 'all', label: 'ทุกหมวด' },
  { id: 'pests', label: 'แมลงศัตรู' },
  { id: 'diseases', label: 'โรคข้าวโพด' },
  { id: 'weeds', label: 'วัชพืช' },
  { id: 'deficiencies', label: 'ขาดธาตุอาหาร' },
];

/** รายการที่ตั้งคำถามได้ — ชื่อ คำใบ้ และลิงก์ไปอ่านต่อ */
type Entry = { key: string; group: Exclude<ModeId, 'all'>; name: string; clues: string[]; image?: string; href: string; hide: string[] };
type Question = { entry: Entry; clue: string; useImage: boolean; choices: Entry[] };

const ROUND = 10;
const GROUP_LABEL: Record<Entry['group'], string> = { pests: 'แมลงศัตรู', diseases: 'โรค', weeds: 'วัชพืช', deficiencies: 'ขาดธาตุ' };
const PROMPT: Record<Entry['group'], string> = {
  pests: 'ลักษณะแบบนี้คือศัตรูข้าวโพดชนิดใด?',
  diseases: 'อาการแบบนี้คือโรคอะไร?',
  weeds: 'วัชพืชที่มีลักษณะแบบนี้คืออะไร?',
  deficiencies: 'อาการแบบนี้ข้าวโพดขาดธาตุอะไร?',
};

const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : []);
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

export default function QuizPage() {
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
      });
    }
    for (const d of diseases.items) {
      if (!okName(d.nameTh)) continue;
      out.push({
        key: `d-${d.id}`, group: 'diseases', name: d.nameTh, href: `/diseases#${d.id}`, image: toImages(d)[0],
        clues: strs(d.symptoms), hide: [d.nameTh, stripParen(d.nameTh)],
      });
    }
    for (const w of weeds.items) {
      if (!okName(w.nameTh)) continue;
      out.push({
        key: `w-${w.id}`, group: 'weeds', name: w.nameTh, href: `/weeds#${w.id}`, image: toImages(w)[0],
        clues: strs(w.identify), hide: [w.nameTh, stripParen(w.nameTh), ...strs(w.localNames)],
      });
    }
    for (const f of defs.items) {
      if (!okName(f.nutrient)) continue;
      out.push({
        key: `f-${f.id}`, group: 'deficiencies', name: f.symbol ? `${f.nutrient} (${f.symbol})` : f.nutrient, href: `/fertilizer#${f.id}`,
        image: toImages(f)[0], clues: [f.quickSign, ...strs(f.symptoms)].filter(Boolean), hide: [f.nutrient],
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

  const start = () => {
    const chosen = shuffle(pool).slice(0, Math.min(ROUND, pool.length));
    const qs = chosen.map<Question>((entry) => {
      // ตัวเลือกหลอกมาจากหมวดเดียวกัน คำถามจะได้ไม่ง่ายเกินไป
      const same = shuffle(entries.filter((e) => e.group === entry.group && e.key !== entry.key && e.name !== entry.name));
      const distractors: Entry[] = [];
      for (const e of same) {
        if (distractors.length >= 3) break;
        if (!distractors.some((d) => d.name === e.name)) distractors.push(e);
      }
      return {
        entry,
        clue: mask(pick(entry.clues), entry.hide),
        useImage: Boolean(entry.image) && Math.random() < 0.5,
        choices: shuffle([entry, ...distractors]),
      };
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
    if (ni >= questions.length && score > (best[mode] ?? 0)) {
      const updated = { ...best, [mode]: score };
      setBest(updated);
      writeBest(updated);
      setNewRecord(true);
    }
  };

  const maxScore = questions.length * 15;

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Quiz"
        title="เกมทายศัตรูข้าวโพด"
        description="อ่านอาการหรือดูภาพ แล้วทายว่าเป็นแมลง โรค วัชพืช หรือขาดธาตุอะไร — ฝึกตาให้แม่นก่อนลงแปลงจริง คำถามสุ่มจากคลังความรู้ในฐานข้อมูล"
        icon={<Gamepad2 size={26} strokeWidth={2.3} />}
      />

      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} label="คำถาม" />
      ) : playing && q ? (
        <section className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center gap-3 text-[14px] text-leaf-700">
            <span className="font-extrabold text-leaf-900">ข้อ {index + 1}/{questions.length}</span>
            <div className="h-2 flex-1 rounded-full bg-leaf-100 overflow-hidden" aria-hidden>
              <div className="h-full rounded-full bg-leaf-500 transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
            </div>
            <span className="inline-flex items-center gap-1 tabular-nums"><Trophy size={15} className="text-corn-600" /> {score}</span>
            {streak >= 2 && <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[12.5px] font-extrabold text-orange-700"><Flame size={13} /> {streak}</span>}
          </div>

          <div className="rounded-4xl bg-white border border-leaf-100 shadow-[0_14px_32px_-22px_rgb(23_71_48_/_0.45)] p-5 sm:p-7">
            <p className="text-[12.5px] font-extrabold uppercase tracking-wide text-leaf-600">{GROUP_LABEL[q.entry.group]}</p>
            <h2 className="mt-1 text-[20px] sm:text-[22px] font-extrabold text-leaf-900">{PROMPT[q.entry.group]}</h2>
            {q.useImage && q.entry.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={q.entry.image} alt="ภาพสำหรับทาย" className="mt-4 w-full max-h-72 object-cover rounded-3xl bg-leaf-50" />
            ) : (
              <blockquote className="mt-4 rounded-3xl bg-leaf-50 px-5 py-4 text-[16px] leading-relaxed text-leaf-900">“{q.clue}”</blockquote>
            )}

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
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
                    className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left text-[15.5px] font-medium transition focus-ring ${cls}`}
                  >
                    {state === 'right' && <CheckCircle2 size={18} className="shrink-0 text-leaf-600" />}
                    {state === 'wrong' && <XCircle size={18} className="shrink-0 text-rose-600" />}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>

            {picked && (
              <div role="status" className="mt-5 flex flex-wrap items-center gap-3 border-t border-leaf-100 pt-4">
                <p className="flex-1 min-w-[12rem] text-[14.5px] text-leaf-800">
                  {picked === q.entry.key ? 'ถูกต้อง! ' : 'ยังไม่ใช่ — '}คำตอบคือ <strong className="text-leaf-900">{q.entry.name}</strong>{' '}
                  <Link href={q.entry.href} target="_blank" className="underline text-leaf-700 hover:text-leaf-900">อ่านเพิ่ม</Link>
                </p>
                <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-2xl bg-leaf-900 px-5 py-2.5 text-[14.5px] font-medium text-white hover:bg-leaf-800 focus-ring">
                  {index + 1 < questions.length ? 'ข้อต่อไป' : 'ดูผลคะแนน'} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-2xl">
          {finished && (
            <div className="mb-6 rounded-4xl bg-leaf-900 text-white p-6 sm:p-7 text-center">
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
            <h2 className="text-[20px] font-extrabold text-leaf-900">เลือกหมวดที่จะเล่น</h2>
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
              <li>• รอบละ {Math.min(ROUND, pool.length)} ข้อ ตอบถูกได้ 10 คะแนน</li>
              <li>• ตอบถูกติดกันได้โบนัสเพิ่มข้อละ 1–5 คะแนน</li>
              {best[mode] !== undefined && <li>• สถิติสูงสุดของหมวดนี้ในเครื่องนี้: <strong className="text-leaf-900">{best[mode]}</strong> คะแนน</li>}
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
        </section>
      )}
    </SiteShell>
  );
}
