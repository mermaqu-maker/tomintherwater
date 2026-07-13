"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 border-b ${
        solid
          ? "bg-[rgba(11,13,14,0.72)] backdrop-blur-xl border-line"
          : "border-transparent"
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-8 h-[74px] flex items-center gap-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-en)] text-[17px] font-semibold tracking-[0.16em] text-tx"
        >
          TOM IN THE WATER
        </Link>

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
      </div>
    </header>
  );
}
