"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { FeaturedCard } from "@/lib/featured";
import { addFeatured, removeFeatured } from "@/app/admin/featured/actions";

type Featurable = {
  id: string;
  title: string;
  category: "in_water" | "on_water";
  year: number | null;
};

// 관리자용 Featured 편집 — 각 대표작 −(제외) / ＋ 타일(프로젝트 선택 팝업).
export default function FeaturedManager({
  featured,
  featurable,
}: {
  featured: FeaturedCard[];
  featurable: Featurable[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [picking, setPicking] = useState(false);
  const [cat, setCat] = useState<"all" | "in_water" | "on_water">("all");
  const [year, setYear] = useState<number | "all">("all");

  const years = [...new Set(featurable.map((f) => f.year).filter(Boolean))].sort(
    (a, b) => (b as number) - (a as number),
  ) as number[];

  const filtered = featurable.filter(
    (f) =>
      (cat === "all" || f.category === cat) &&
      (year === "all" || f.year === year),
  );

  return (
    <>
      <div className="grid gap-[22px] sm:grid-cols-2">
        {featured.map((c) => (
          <div key={c.projectId} className="relative group">
            <Tile card={c} />
            <button
              type="button"
              aria-label="대표작에서 제외"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await removeFeatured(c.projectId);
                  router.refresh();
                })
              }
              className="absolute top-3 right-3 z-[3] w-8 h-8 flex items-center justify-center bg-[rgba(4,10,12,0.8)] text-tx border border-line2 hover:border-red-400 hover:text-red-400 text-lg leading-none"
            >
              −
            </button>
          </div>
        ))}

        {/* ＋ 추가 타일 */}
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="aspect-[3/2] border border-dashed border-line2 text-tx3 hover:text-tx hover:border-accent transition-colors flex flex-col items-center justify-center gap-2"
        >
          <span className="text-3xl leading-none">＋</span>
          <span className="text-[11px] tracking-[0.16em] uppercase">대표작 추가</span>
        </button>
      </div>

      {picking && (
        <div
          className="fixed inset-0 z-[90] bg-[rgba(4,6,7,0.86)] flex items-center justify-center p-5"
          onClick={() => setPicking(false)}
        >
          <div
            className="w-full max-w-[560px] bg-bg2 border border-line p-7 max-h-[86vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-en text-[18px] tracking-[0.02em] text-tx">
                대표작 추가
              </h2>
              <button
                type="button"
                onClick={() => setPicking(false)}
                aria-label="닫기"
                className="text-tx3 hover:text-tx text-xl"
              >
                ✕
              </button>
            </div>

            {/* 필터 */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(["all", "in_water", "on_water"] as const).map((c) => (
                <Mini key={c} on={cat === c} onClick={() => setCat(c)}>
                  {c === "all" ? "전체" : c === "in_water" ? "수중" : "지상"}
                </Mini>
              ))}
              {years.length > 0 && <span className="w-px bg-line mx-1" />}
              {years.length > 0 && (
                <Mini on={year === "all"} onClick={() => setYear("all")}>
                  연도 전체
                </Mini>
              )}
              {years.map((y) => (
                <Mini key={y} on={year === y} onClick={() => setYear(y)}>
                  {y}
                </Mini>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-tx3 text-sm py-8 text-center">
                추가할 수 있는 공개 프로젝트가 없습니다.
              </p>
            ) : (
              <div className="flex flex-col">
                {filtered.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await addFeatured(f.id);
                        setPicking(false);
                        router.refresh();
                      })
                    }
                    className="flex items-center justify-between py-3 border-b border-line text-left hover:bg-white/[0.03] px-2 -mx-2"
                  >
                    <span className="text-tx text-sm">{f.title}</span>
                    <span className="text-tx3 text-[11px] uppercase tracking-[0.1em]">
                      {f.category === "in_water" ? "수중" : "지상"}
                      {f.year ? ` · ${f.year}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Mini({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] tracking-[0.06em] border px-3 py-[5px] transition-colors ${
        on ? "text-tx border-line2 bg-white/[0.04]" : "text-tx3 border-line hover:text-tx"
      }`}
    >
      {children}
    </button>
  );
}

export function Tile({ card }: { card: FeaturedCard }) {
  return (
    <Link
      href={`/gallery/${card.slug}`}
      className="group relative block overflow-hidden aspect-[3/2] bg-[linear-gradient(155deg,#08202c,#0f465b_60%,#08202c)]"
    >
      {card.cover && (
        <Image
          src={card.cover.url}
          alt={card.title}
          fill
          sizes="(max-width: 780px) 100vw, 580px"
          className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.045]"
        />
      )}
      <div className="absolute inset-0 flex flex-col justify-end p-[26px] bg-[linear-gradient(180deg,transparent_45%,rgba(4,10,12,0.72))] opacity-0 transition-opacity duration-[550ms] group-hover:opacity-100">
        <div className="font-en text-[22px] font-medium tracking-[-0.01em]">
          {card.title}
        </div>
        {card.year && (
          <div className="text-[11px] tracking-[0.2em] uppercase text-tx2 mt-1.5">
            {card.year}
          </div>
        )}
      </div>
    </Link>
  );
}
