'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CollectionName } from './collections';

export type WithMeta<T> = T & { official?: boolean; edited?: boolean };

export type CollectionStatus = { loading: boolean; error: string | null; reload: () => void };

/**
 * อ่านข้อมูลคลังความรู้จากฐานข้อมูลผ่าน /api/data เท่านั้น (ไม่มีข้อมูลตัวอย่างในหน้าเว็บ)
 * ระหว่างรอให้หน้าแสดงข้อความ "กำลังโหลด" ด้วย loading และแสดง error พร้อมปุ่มลองใหม่ถ้าโหลดไม่สำเร็จ
 */
export function useCollection<T extends { id: string }>(name: CollectionName) {
  const [items, setItems] = useState<WithMeta<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    // ฐานข้อมูลบน serverless อาจตื่นช้าในคำขอแรก — ลองซ้ำอัตโนมัติ 2 ครั้งก่อนแจ้งผู้ใช้
    const load = async () => {
      let lastErr = 'โหลดข้อมูลไม่สำเร็จ';
      for (let i = 0; i < 3; i++) {
        try {
          const r = await fetch(`/api/data?collection=${name}`, { cache: 'no-store' });
          const data = await r.json().catch(() => null);
          if (r.ok && data?.success && Array.isArray(data.items)) return data.items as WithMeta<T>[];
          lastErr = data?.error || `เซิร์ฟเวอร์ตอบกลับ ${r.status}`;
        } catch {
          lastErr = 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่';
        }
        if (cancelled) return null;
        await new Promise((res) => setTimeout(res, 800 * (i + 1)));
      }
      throw new Error(lastErr);
    };

    load()
      .then((list) => {
        if (cancelled || !list) return;
        setItems(list);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [name, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { items, loading, error, reload, synced: !loading && !error };
}
