"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 필요 시 로깅 연동 지점
    console.error(error);
  }, [error]);

  return (
    <section className="min-h-[72vh] flex flex-col items-center justify-center text-center px-6 pt-[74px]">
      <p className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.4em] uppercase text-accent mb-5">
        Error
      </p>
      <h1 className="font-[family-name:var(--font-en)] font-semibold text-[clamp(26px,3.6vw,42px)] tracking-[-0.02em]">
        문제가 발생했습니다
      </h1>
      <p className="text-tx2 mt-4 max-w-[380px]">
        잠시 후 다시 시도해 주세요. 계속되면 새로고침 해보세요.
      </p>
      <div className="flex gap-3 mt-9">
        <button type="button" onClick={reset} className="btn-line">
          다시 시도
        </button>
        <Link href="/" className="btn-line">
          홈으로
        </Link>
      </div>
    </section>
  );
}
