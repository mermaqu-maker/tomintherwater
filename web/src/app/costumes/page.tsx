import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getCostumes,
  getCostumeFacets,
  typeLabel,
  courseLabel,
  priceAmount,
  sizeRange,
  colorSwatch,
  COSTUME_TYPES,
  COSTUME_SIZES,
  COSTUME_COURSES,
  type Costume,
} from "@/lib/costumes";
import { getAdmin } from "@/lib/auth";
import { createCostumeDraft } from "@/app/admin/costumes/actions";
import Reveal from "@/components/Reveal";
import Lightbox from "@/components/Lightbox";

export const metadata: Metadata = {
  title: "의상 대여",
  description: "수중 촬영 의상 대여 카탈로그 — 드레스 · 머메이드 테일 · 컨셉 의상.",
};

type SP = { type?: string; size?: string; course?: string; color?: string };

function href(patch: Partial<SP>, base: SP): string {
  const m = { ...base, ...patch };
  const qs = new URLSearchParams();
  if (m.type) qs.set("type", m.type);
  if (m.size) qs.set("size", m.size);
  if (m.course) qs.set("course", m.course);
  if (m.color) qs.set("color", m.color);
  const s = qs.toString();
  return s ? `/costumes?${s}` : "/costumes";
}

export default async function CostumesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const base: SP = {
    type: sp.type || undefined,
    size: sp.size || undefined,
    course: sp.course || undefined,
    color: sp.color || undefined,
  };

  const [items, facets, admin] = await Promise.all([
    getCostumes(base),
    getCostumeFacets(),
    getAdmin(),
  ]);

  const isFiltered = !!(base.type || base.size || base.course || base.color);
  const hasCatalog =
    items.length > 0 || isFiltered || facets.types.length > 0;

  return (
    <section className="border-t border-line pt-[150px] pb-[120px]">
      <div className="max-w-[1180px] mx-auto px-8">
        {admin && (
          <div className="flex justify-end mb-4">
            <form action={createCostumeDraft}>
              <button type="submit" className="btn-line">
                ＋ 의상 추가
              </button>
            </form>
          </div>
        )}

        <div className="text-center mb-4">
          <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent">
            Rental
          </p>
          <h1 className="font-en font-semibold text-[clamp(28px,3.4vw,44px)] tracking-[-0.02em] mt-1.5">
            의상 대여
          </h1>
          <p className="text-tx3 text-sm mt-3 max-w-[460px] mx-auto">
            촬영에 필요한 의상을 대여할 수 있습니다.
          </p>
        </div>

        {!hasCatalog ? (
          <div className="py-[90px] text-center">
            <p className="text-tx3 text-sm">아직 등록된 대여 의상이 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 필터 (존재하는 값만) */}
            <div className="flex flex-col items-start gap-3 mt-9 mb-12 pl-1">
              <FilterRow
                label="유형"
                items={COSTUME_TYPES.filter((t) => facets.types.includes(t.key)).map(
                  (t) => ({
                    label: t.label,
                    href: href({ type: base.type === t.key ? undefined : t.key }, base),
                    on: base.type === t.key,
                  }),
                )}
              />
              <FilterRow
                label="사이즈"
                items={COSTUME_SIZES.filter((s) => facets.sizes.includes(s)).map((s) => ({
                  label: s,
                  href: href({ size: base.size === s ? undefined : s }, base),
                  on: base.size === s,
                }))}
              />
              <FilterRow
                label="코스"
                items={COSTUME_COURSES.filter((c) => facets.courses.includes(c.key)).map(
                  (c) => ({
                    label: c.label,
                    href: href(
                      { course: base.course === c.key ? undefined : c.key },
                      base,
                    ),
                    on: base.course === c.key,
                  }),
                )}
              />
              <FilterRow
                label="색상"
                items={facets.colors.map((col) => ({
                  label: col,
                  href: href(
                    { color: base.color === col ? undefined : col },
                    base,
                  ),
                  on: base.color === col,
                  swatch: colorSwatch(col),
                }))}
              />
              {isFiltered && (
                <Link
                  href="/costumes"
                  className="text-tx3 text-[11px] tracking-[0.14em] uppercase hover:text-tx mt-1"
                >
                  필터 초기화
                </Link>
              )}
            </div>

            {items.length === 0 ? (
              <p className="py-16 text-center text-tx3 text-sm">
                해당 조건의 의상이 없습니다.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {items.map((c, i) => (
                  <Reveal key={c.id} delay={Math.min(i, 7) * 40}>
                    <CostumeCard costume={c} />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function FilterRow({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string; on: boolean; swatch?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-start gap-2 w-full">
      <span className="text-[13px] tracking-[0.06em] text-tx w-16 text-right shrink-0 pt-[6px]">
        {label}
      </span>
      <div className="flex flex-wrap gap-2 flex-1">
        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            className={`inline-flex items-center gap-1.5 text-[11px] tracking-[0.06em] border px-3 py-[6px] transition-colors ${
              it.on
                ? "text-tx border-line2 bg-white/[0.04]"
                : "text-tx3 border-line hover:text-tx hover:border-line2"
            }`}
          >
            {it.swatch && (
              <span
                className="w-2.5 h-2.5 rounded-full border border-line2"
                style={{ background: it.swatch }}
              />
            )}
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CostumeCard({ costume: c }: { costume: Costume }) {
  return (
    <div className="border border-line bg-bg2 overflow-hidden flex flex-col">
      <Lightbox
        images={c.images}
        ariaLabel={`${c.name} 이미지`}
        className="relative block aspect-[3/4] bg-[linear-gradient(155deg,#08202c,#0f465b_60%,#08202c)] w-full group"
      >
        {c.images[0] ? (
          <Image
            src={c.images[0]}
            alt={c.name}
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : null}
        {!c.is_available && (
          <span className="absolute top-3 left-3 text-[10px] tracking-[0.16em] uppercase bg-[rgba(4,10,12,0.75)] text-tx2 px-2.5 py-1">
            대여중
          </span>
        )}
      </Lightbox>

      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-tx text-[15px] font-[400]">{typeLabel(c.type)}</h3>
          <span className="font-en text-[13px] text-tx whitespace-nowrap flex items-start gap-[0.1em]">
            {priceAmount(c.price)}
            <span className="text-[0.68em] text-tx2 mt-[0.15em]">₩</span>
          </span>
        </div>
        {c.sizes.length > 0 && (
          <p className="text-tx text-[12px] mt-1">{sizeRange(c.sizes)}</p>
        )}
        {c.courses.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2.5">
            {c.courses.map((co) => (
              <span
                key={co}
                className="text-[9px] tracking-[0.06em] uppercase text-tx3 border border-line px-1.5 py-[2px]"
              >
                {courseLabel(co)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
