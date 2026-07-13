import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getGalleryProjects,
  getFacets,
  CATEGORIES,
  TYPES,
  type Category,
  type GalleryCard,
} from "@/lib/gallery";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Gallery" };

type SP = {
  cat?: string;
  type?: string;
  place?: string;
  year?: string;
};

function href(patch: Partial<SP>, base: SP = {}): string {
  const merged = { ...base, ...patch };
  const qs = new URLSearchParams();
  if (merged.cat) qs.set("cat", merged.cat);
  if (merged.type) qs.set("type", merged.type);
  if (merged.place) qs.set("place", merged.place);
  if (merged.year) qs.set("year", merged.year);
  const s = qs.toString();
  return s ? `/gallery?${s}` : "/gallery";
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const category: Category = sp.cat === "on_water" ? "on_water" : "in_water";
  const type = ["editorial", "event", "commercial"].includes(sp.type ?? "")
    ? (sp.type as "editorial" | "event" | "commercial")
    : undefined;
  const place = sp.place || undefined;
  const year = sp.year ? Number(sp.year) : undefined;

  const [projects, facets, admin] = await Promise.all([
    getGalleryProjects({ category, type, place, year }),
    getFacets(category),
    getAdmin(),
  ]);

  const hasAnyPublished =
    projects.length > 0 || !!type || !!place || !!year || facets.places.length > 0 || facets.years.length > 0;
  const isFiltered = !!type || !!place || !!year;
  const baseSP: SP = { cat: category, type: sp.type, place, year: sp.year };

  return (
    <section className="border-t border-line pt-[150px] pb-[120px]">
      <div className="max-w-[1180px] mx-auto px-8">
        {admin && (
          <div className="flex justify-end mb-4">
            <Link href="/admin/projects/new" className="btn-line">
              ＋ 새 프로젝트
            </Link>
          </div>
        )}
        {/* 타이틀 + 카테고리 탭 */}
        <div className="text-center mb-11">
          <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent">
            Portfolio
          </p>
          <h1 className="font-en font-semibold text-[44px] tracking-[-0.02em] mt-2 mb-[30px]">
            Gallery
          </h1>

          <div className="inline-flex border border-line2">
            {CATEGORIES.map((c) => {
              const on = c.key === category;
              return (
                <Link
                  key={c.key}
                  href={href({ cat: c.key, type: undefined, place: undefined, year: undefined })}
                  className={`px-[30px] py-3.5 font-en text-[13px] tracking-[0.14em] uppercase transition-colors ${
                    on ? "bg-tx text-bg font-semibold" : "text-tx2 hover:text-tx"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>

          {/* 필터 — 카테고리에 공개 작업이 있을 때만 */}
          {hasAnyPublished && (
            <div className="flex gap-2.5 flex-wrap justify-center items-center mt-7">
              {/* 성격 토글 */}
              <Chip href={href({ type: undefined, place, year: sp.year }, { cat: category })} on={!type}>
                All
              </Chip>
              {TYPES.map((t) => (
                <Chip
                  key={t.key}
                  href={href({ type: t.key }, baseSP)}
                  on={type === t.key}
                >
                  {t.label}
                </Chip>
              ))}

              {/* PLACE ▾ — 값이 있을 때만 */}
              {facets.places.length > 0 && (
                <Facet
                  label="Place"
                  active={place}
                  allHref={href({ place: undefined }, baseSP)}
                  items={facets.places.map((p) => ({
                    label: p,
                    href: href({ place: p }, baseSP),
                    on: place === p,
                  }))}
                />
              )}

              {/* YEAR ▾ — 값이 있을 때만 */}
              {facets.years.length > 0 && (
                <Facet
                  label="Year"
                  active={year ? String(year) : undefined}
                  allHref={href({ year: undefined }, baseSP)}
                  items={facets.years.map((y) => ({
                    label: String(y),
                    href: href({ year: String(y) }, baseSP),
                    on: year === y,
                  }))}
                />
              )}
            </div>
          )}
        </div>

        {/* 그리드 / 빈 상태 */}
        {projects.length > 0 ? (
          <div className="[column-count:2] [column-gap:22px] max-[780px]:[column-count:1]">
            {projects.map((p) => (
              <GalleryTile key={p.slug} card={p} />
            ))}
          </div>
        ) : isFiltered ? (
          <EmptyState
            message="해당 조건의 작업이 없습니다."
            action={{ label: "필터 초기화", href: href({ cat: category }) }}
          />
        ) : (
          <EmptyState message="아직 공개된 작업이 없습니다." />
        )}
      </div>
    </section>
  );
}

function Chip({
  href,
  on,
  children,
}: {
  href: string;
  on: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`font-en text-[11px] tracking-[0.12em] uppercase border px-4 py-[7px] transition-colors ${
        on ? "text-tx border-line2" : "text-tx3 border-line hover:text-tx hover:border-line2"
      }`}
    >
      {children}
    </Link>
  );
}

function Facet({
  label,
  active,
  allHref,
  items,
}: {
  label: string;
  active?: string;
  allHref: string;
  items: { label: string; href: string; on: boolean }[];
}) {
  return (
    <details className="relative group">
      <summary className="font-en text-[11px] tracking-[0.12em] uppercase border px-4 py-[7px] cursor-pointer list-none [&::-webkit-details-marker]:hidden transition-colors text-tx3 border-line hover:text-tx hover:border-line2 data-[active=true]:text-tx data-[active=true]:border-line2"
        data-active={active ? "true" : "false"}
      >
        {active ?? label} ▾
      </summary>
      <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 min-w-[160px] bg-bg2 border border-line p-1.5 z-30 flex flex-col shadow-[0_12px_34px_rgba(0,0,0,0.45)]">
        <Link
          href={allHref}
          className={`px-3.5 py-[9px] text-xs text-left whitespace-nowrap transition-colors ${
            active ? "text-tx2 hover:text-tx hover:bg-white/5" : "text-tx bg-white/5"
          }`}
        >
          All {label.toLowerCase()}s
        </Link>
        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            className={`px-3.5 py-[9px] text-xs text-left whitespace-nowrap transition-colors ${
              it.on ? "text-tx bg-white/5" : "text-tx2 hover:text-tx hover:bg-white/5"
            }`}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

function GalleryTile({ card }: { card: GalleryCard }) {
  return (
    <Link
      href={`/gallery/${card.slug}`}
      className="group relative block mb-[22px] overflow-hidden break-inside-avoid"
    >
      {card.cover ? (
        <Image
          src={card.cover.url}
          alt={card.title}
          width={card.cover.width}
          height={card.cover.height}
          sizes="(max-width: 780px) 100vw, 580px"
          className="w-full h-auto transition-transform duration-[1100ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.045]"
        />
      ) : (
        <div className="w-full aspect-[4/3] bg-[linear-gradient(155deg,#08202c,#0f465b_60%,#08202c)]" />
      )}
      <div className="absolute inset-0 flex flex-col justify-end p-[26px] bg-[linear-gradient(180deg,transparent_45%,rgba(4,10,12,0.72))] opacity-0 transition-opacity duration-[550ms] group-hover:opacity-100">
        <div className="font-en text-[22px] font-medium tracking-[-0.01em] translate-y-2.5 transition-transform duration-[550ms] group-hover:translate-y-0">
          {card.title}
        </div>
        {card.year && (
          <div className="text-[11px] tracking-[0.2em] uppercase text-tx2 mt-1.5 translate-y-2.5 transition-transform duration-[550ms] delay-[50ms] group-hover:translate-y-0">
            {card.year}
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="py-[100px] text-center">
      <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent mb-4">
        Gallery
      </p>
      <p className="text-tx2 text-[15px]">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-block mt-6 font-en text-[11px] tracking-[0.18em] uppercase text-tx border-b border-line2 pb-1 hover:text-accent hover:border-accent transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
