"use client";

import { KAKAO_CHANNEL_URL } from "@/lib/links";

export default function FloatingButtons() {
  return (
    <div className="fixed right-[26px] bottom-7 z-50 flex flex-col gap-3">
      <a
        href={KAKAO_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="카카오톡 문의"
        className="w-[50px] h-[50px] rounded-full border border-line2 bg-[rgba(18,21,23,0.7)] backdrop-blur-md flex items-center justify-center text-tx2 transition-colors hover:text-accent hover:border-accent"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="w-5 h-5"
        >
          <path d="M12 4C7 4 3 7.1 3 11c0 2.5 1.7 4.7 4.2 5.9L6.5 20l3.6-2.2c.6.1 1.2.2 1.9.2 5 0 9-3.1 9-7s-4-7-9-7z" />
        </svg>
      </a>
      <button
        type="button"
        title="맨 위로"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-[50px] h-[50px] rounded-full border border-line2 bg-[rgba(18,21,23,0.7)] backdrop-blur-md flex items-center justify-center text-tx2 transition-colors hover:text-accent hover:border-accent cursor-pointer"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="w-5 h-5"
        >
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </button>
    </div>
  );
}
