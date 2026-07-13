"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "About", href: "/about" },
  {
    label: "Gallery",
    href: "/gallery",
    children: [
      { label: "In the Water", href: "/gallery?cat=in_water" },
      { label: "On the Water", href: "/gallery?cat=on_water" },
    ],
  },
  {
    label: "Course",
    href: "/course",
    children: [
      { label: "Essential", href: "/course?group=essential" },
      { label: "Special", href: "/course?group=special" },
      { label: "Group & Commercial", href: "/course?group=group" },
    ],
  },
  { label: "Reviews", href: "/reviews" },
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 라우트 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 border-b ${
        solid || open
          ? "bg-[rgba(11,13,14,0.72)] backdrop-blur-xl border-line"
          : "border-transparent"
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 h-[64px] md:h-[74px] flex items-center gap-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-en)] text-[15px] md:text-[17px] font-semibold tracking-[0.12em] md:tracking-[0.16em] text-tx"
          onClick={() => setOpen(false)}
        >
          TOM IN THE WATER
        </Link>

        {/* 데스크톱 내비 */}
        <nav className="ml-auto hidden md:flex">
          {NAV.map((item) => (
            <div key={item.label} className="relative group">
              <Link
                href={item.href}
                className="block px-[15px] py-[26px] font-[family-name:var(--font-en)] text-[11.5px] tracking-[0.04em] uppercase text-tx2 transition-colors hover:text-tx"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[210px] bg-[rgba(18,21,23,0.94)] backdrop-blur-xl border border-line p-2 flex-col opacity-0 invisible translate-y-1.5 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 flex">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="px-3.5 py-[11px] font-[family-name:var(--font-en)] text-xs tracking-[0.1em] uppercase text-tx2 transition-colors hover:text-tx hover:bg-[rgba(255,255,255,0.04)] whitespace-nowrap"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          className="ml-auto md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
        >
          <span
            className={`block w-5 h-px bg-tx transition-transform duration-300 ${
              open ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-5 h-px bg-tx transition-opacity duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-px bg-tx transition-transform duration-300 ${
              open ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>
    </header>

      {/* 모바일 메뉴 오버레이 — 헤더 밖(backdrop-filter 영향 회피) */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 top-[64px] z-30 bg-[rgba(11,13,14,0.98)] transition-all duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <nav className="flex flex-col px-5 py-8 overflow-y-auto h-full">
          {NAV.map((item) => (
            <div key={item.label} className="border-b border-line py-4">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-en)] text-[22px] tracking-[0.02em] text-tx"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="flex flex-col gap-2.5 mt-3 pl-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="text-tx2 text-sm tracking-[0.04em]"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
