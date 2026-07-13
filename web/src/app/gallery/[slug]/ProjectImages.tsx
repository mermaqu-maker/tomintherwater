"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ProjectImage } from "@/lib/project";

// 이미지 타일(Masonry 2열) + 감상 전용 라이트박스 (좋아요/댓글 없음, docs §2.4)
export default function ProjectImages({ images }: { images: ProjectImage[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const total = images.length;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) =>
      setOpen((i) => (i === null ? i : (i + d + total) % total)),
    [total],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  if (total === 0) return null;

  return (
    <>
      <div className="[column-count:2] [column-gap:12px] max-[780px]:[column-count:1]">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            className="block w-full mb-3 break-inside-avoid cursor-zoom-in overflow-hidden"
          >
            <Image
              src={img.url}
              alt={img.alt || ""}
              width={img.width}
              height={img.height}
              sizes="(max-width: 780px) 100vw, 580px"
              className="w-full h-auto"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-80 bg-[rgba(6,8,9,0.97)] flex items-center justify-center p-10"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-6 text-tx2 hover:text-tx text-2xl cursor-pointer"
            aria-label="닫기"
          >
            ✕
          </button>
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-8 top-1/2 -translate-y-1/2 w-[52px] h-[52px] border border-line2 text-tx hover:text-accent hover:border-accent text-xl cursor-pointer"
                aria-label="이전"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-[52px] h-[52px] border border-line2 text-tx hover:text-accent hover:border-accent text-xl cursor-pointer"
                aria-label="다음"
              >
                ›
              </button>
            </>
          )}
          <div
            className="relative max-w-[1180px] max-h-[84vh] w-full h-[84vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[open].url}
              alt={images[open].alt || ""}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-7 left-0 right-0 text-center text-tx3 text-[11px] tracking-[0.24em] uppercase">
            {open + 1} / {total}
          </div>
        </div>
      )}
    </>
  );
}
