"use client";

import { useCallback, useEffect, useState } from "react";

// 감상 전용 전체화면 라이트박스. 트리거(children) 클릭 → 오버레이 오픈,
// 좌우 화살표/키보드/카운터/Esc·X. images 없으면 트리거를 렌더하지 않음.
export default function Lightbox({
  images,
  children,
  className = "",
  ariaLabel = "이미지 크게 보기",
}: {
  images: string[];
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const n = images.length;

  const prev = useCallback(() => setI((v) => (v - 1 + n) % n), [n]);
  const next = useCallback(() => setI((v) => (v + 1) % n), [n]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, prev, next]);

  if (n === 0) return null;

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => {
          setI(0);
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-[rgba(4,6,7,0.96)] flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-6 text-tx2 hover:text-tx text-2xl leading-none z-[2]"
          >
            ✕
          </button>
          <span className="absolute top-6 left-6 font-en text-[12px] tracking-[0.2em] text-tx3 z-[2]">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>

          {n > 1 && (
            <>
              <button
                type="button"
                aria-label="이전"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-tx2 hover:text-tx text-3xl z-[2]"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-tx2 hover:text-tx text-3xl z-[2]"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[i]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[88vh] object-contain select-none"
          />
        </div>
      )}
    </>
  );
}
