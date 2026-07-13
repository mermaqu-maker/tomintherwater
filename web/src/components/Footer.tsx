import Link from "next/link";
import { KAKAO_CHANNEL_URL, INSTAGRAM_URL } from "@/lib/links";

const SITEMAP = [
  {
    heading: "Gallery",
    links: [
      { label: "In the Water", href: "/gallery?cat=in_water" },
      { label: "On the Water", href: "/gallery?cat=on_water" },
    ],
  },
  {
    heading: "Course",
    links: [
      { label: "Essential", href: "/course?group=essential" },
      { label: "Special", href: "/course?group=special" },
      { label: "Group & Commercial", href: "/course?group=group" },
    ],
  },
  {
    heading: "More",
    links: [
      { label: "About", href: "/about" },
      { label: "Reviews", href: "/reviews" },
      { label: "의상 대여", href: "/costumes" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line py-[70px]">
      <div className="max-w-[1180px] mx-auto px-8 flex justify-between items-start flex-wrap gap-10">
        <div>
          <div className="font-[family-name:var(--font-en)] font-semibold text-base tracking-[0.16em]">
            TOM IN THE WATER
          </div>
          <div className="flex gap-[18px] mt-[18px]">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="inline-flex text-tx2 transition-colors hover:text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-5 h-5"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href={KAKAO_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="카카오톡 채널"
              className="inline-flex text-tx2 transition-colors hover:text-accent"
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
          </div>
        </div>

        <nav className="flex gap-14">
          {SITEMAP.map((col) => (
            <div key={col.heading} className="flex flex-col gap-[11px]">
              <span className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.2em] uppercase text-tx3 mb-[3px]">
                {col.heading}
              </span>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[13px] text-tx2 transition-colors hover:text-tx"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="max-w-[1180px] mx-auto px-8 mt-14 pt-6 border-t border-line/60 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.14em] text-tx3">
          © 2026 TOM IN THE WATER
        </span>
        <Link
          href="/admin/login"
          className="text-[11px] tracking-[0.16em] uppercase text-tx3/70 transition-colors hover:text-tx2"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
