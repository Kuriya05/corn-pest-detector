'use client';

import { useEffect, useState } from 'react';
import type { CollectionName } from './collections';

export type WithMeta<T> = T & { official?: boolean; edited?: boolean };

/**
 * อ่านข้อมูลคลังความรู้จากเซิร์ฟเวอร์ โดยแสดงข้อมูลตั้งต้นทันทีก่อน
 * แล้วค่อยสลับเป็นข้อมูลที่แอดมินแก้ไขไว้เมื่อโหลดเสร็จ — หน้าเว็บจึงไม่กะพริบ
 */
export function useCollection<T extends { id: string }>(name: CollectionName, seed: T[]) {
  const [items, setItems] = useState<WithMeta<T>[]>(seed as WithMeta<T>[]);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/data?collection=${name}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.success || !Array.isArray(data.items)) return;
        setItems(data.items as WithMeta<T>[]);
        setSynced(true);
      })
      .catch(() => {
        /* ถ้าโหลดไม่สำเร็จ ให้ใช้ข้อมูลตั้งต้นต่อไป */
      });
    return () => { cancelled = true; };
  }, [name]);

  return { items, synced };
}
