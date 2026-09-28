'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  /** แสดง placeholder เมื่อไม่มีรูป */
  showPlaceholder?: boolean;
}

export function ImageGallery({ images, alt, showPlaceholder = false }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const gotoPrev   = useCallback(() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1)), []);
  const gotoNext   = useCallback(() => setLightboxIndex((i) => Math.min(images.length - 1, (i ?? 0) + 1)), [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  gotoPrev();
      if (e.key === 'ArrowRight') gotoNext();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, gotoPrev, gotoNext]);

  /* ── ไม่มีรูป ── */
  if (!images.length) {
    if (!showPlaceholder) return null;
    return (
      <div className="w-full h-40 rounded-3xl bg-leaf-50 ring-1 ring-dashed ring-leaf-200 flex flex-col items-center justify-center gap-2.5 text-leaf-400 select-none">
        <Images size={34} className="opacity-40" />
        <span className="text-[15px]">ยังไม่มีรูปภาพ — แอดมินสามารถเพิ่มรูปได้</span>
      </div>
    );
  }

  const single = images.length === 1;

  return (
    <>
      {/* ── แถวรูปย่อ ── */}
      <div className={`grid gap-2 ${single ? '' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {images.map((src, i) => (
          <button
            key={i} type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`ขยายรูปที่ ${i + 1}`}
            className={`group relative rounded-2xl overflow-hidden ring-1 ring-leaf-200 hover:ring-leaf-400 focus-ring transition-all ${single ? 'col-span-full' : ''}`}
          >
            <img
              src={src}
              alt={`${alt} รูปที่ ${i + 1}`}
              className={`w-full object-cover ${single ? 'max-h-72' : 'h-36'}`}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-leaf-950/0 group-hover:bg-leaf-950/20 transition">
              <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition" />
            </span>
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <p className="mt-1 text-right text-[13px] text-leaf-500">{images.length} รูป — กดเพื่อขยาย</p>
      )}

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ดูรูปภาพขยาย"
          className="fixed inset-0 z-[300] flex items-center justify-center bg-leaf-950/92 backdrop-blur-md"
          onClick={closeLightbox}
        >
          {/* รูปหลัก */}
          <img
            src={images[lightboxIndex]}
            alt={`${alt} รูปที่ ${lightboxIndex + 1}`}
            className="max-h-[88vh] max-w-[92vw] rounded-3xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* ปุ่มปิด */}
          <button
            onClick={closeLightbox}
            aria-label="ปิด"
            className="absolute top-4 right-4 grid place-items-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
          >
            <X size={24} />
          </button>

          {/* ลูกศรซ้าย */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); gotoPrev(); }}
              aria-label="รูปก่อนหน้า"
              className="absolute left-3 sm:left-6 grid place-items-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* ลูกศรขวา */}
          {lightboxIndex < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); gotoNext(); }}
              aria-label="รูปถัดไป"
              className="absolute right-3 sm:right-6 grid place-items-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* จุดนำทาง */}
          {images.length > 1 && (
            <div className="absolute bottom-6 flex items-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  aria-label={`รูปที่ ${i + 1}`}
                  className={`rounded-full transition-all ${
                    i === lightboxIndex
                      ? 'w-7 h-3 bg-white'
                      : 'w-3 h-3 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* ตำแหน่ง */}
          <span className="absolute bottom-7 right-6 text-white/50 text-[14px] tabular-nums">
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}

/** Helper: แปลง imageUrl เดิม (string) หรือ images array ใหม่ → string[] */
export function toImages(item: { images?: string[]; imageUrl?: string }): string[] {
  if (Array.isArray(item.images) && item.images.length) return item.images;
  if (item.imageUrl) return [item.imageUrl];
  return [];
}
