import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProducts, priceLabel, GROUPS, type CourseGroup, type Product } from "@/lib/course";
import Reveal from "@/components/Reveal";
import Lightbox from "@/components/Lightbox";
import KakaoInquiry from "@/components/KakaoInquiry";

export const metadata: Metadata = {
  title: "Course",
  description: "수중 촬영 코스 안내 — Essential · Special · Group & Commercial.",
};

const CROSS: Partial<Record<CourseGroup, CourseGroup>> = {
  essential: "special",
  special: "essential",
};

export default async function CoursePage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const sp = await searchParams;
  const group: CourseGroup = (["essential", "special", "group"] as const).includes(
    sp.group as CourseGroup,
  )
    ? (sp.group as CourseGroup)
    : "essential";

  const all = await getProducts();
  const items = all.filter((p) => p.group_key === group);
  const groupMeta = GROUPS.find((g) => g.key === group)!;
  const crossKey = CROSS[group];
  const crossMeta = crossKey ? GROUPS.find((g) => g.key === crossKey) : null;

  return (
    <>
      <section className="border-t border-line pt-[150px] pb-[80px]">
        <div className="max-w-[1180px] mx-auto px-8">
          <div className="text-center mb-11">
            <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent">
              Course
            </p>
            <h1 className="font-en font-semibold text-[clamp(28px,3.4vw,44px)] tracking-[-0.02em] mt-1.5">
              촬영 코스
            </h1>
          </div>

          {/* 그룹 탭 */}
          <div className="flex justify-center gap-2 flex-wrap mb-14">
            {GROUPS.map((g) => (
              <Link
                key={g.key}
                href={`/course?group=${g.key}`}
                className={`font-en text-[11px] tracking-[0.12em] uppercase border px-4 py-[9px] transition-colors ${
                  g.key === group
                    ? "text-tx border-line2"
                    : "text-tx3 border-line hover:text-tx hover:border-line2"
                }`}
              >
                {g.label}
              </Link>
            ))}
          </div>

          <div className="text-center mb-12">
            <h2 className="font-en text-[20px] tracking-[0.02em] text-tx">
              {groupMeta.label}
            </h2>
            <p className="text-tx3 text-sm mt-1">{groupMeta.caption}</p>
          </div>

          {items.length === 0 ? (
            <p className="text-tx3 text-sm py-16 text-center">
              준비 중인 코스입니다.
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 max-w-[980px] mx-auto">
              {items.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 3) * 90}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}

          {/* 크로스 추천 (Essential ↔ Special) */}
          {crossMeta && (
            <Reveal>
              <Link
                href={`/course?group=${crossMeta.key}`}
                className="group mt-14 flex items-center justify-between max-w-[980px] mx-auto border border-line px-7 py-6 hover:border-line2 transition-colors"
              >
                <span>
                  <span className="block text-tx3 text-[11px] tracking-[0.2em] uppercase">
                    이런 촬영은 어떠세요?
                  </span>
                  <span className="block font-en text-[18px] text-tx mt-1">
                    {crossMeta.label} · {crossMeta.caption}
                  </span>
                </span>
                <span className="text-accent text-xl transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </Reveal>
          )}

          {/* 의상 대여 진입 */}
          <Reveal>
            <Link
              href="/costumes"
              className="group mt-4 flex items-center justify-between max-w-[980px] mx-auto bg-bg2 px-7 py-6 hover:bg-bg3 transition-colors"
            >
              <span>
                <span className="block text-tx3 text-[11px] tracking-[0.2em] uppercase">
                  Costume Rental
                </span>
                <span className="block font-en text-[18px] text-tx mt-1">
                  대여 가능한 의상 보기
                </span>
              </span>
              <span className="text-accent text-xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <KakaoInquiry />
    </>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  const coming = p.price_kind === "coming";
  return (
    <div
      className={`border border-line bg-bg2 overflow-hidden flex flex-col ${
        coming ? "opacity-70" : ""
      }`}
    >
      <div className="relative aspect-[16/10] bg-[linear-gradient(155deg,#08202c,#0f465b_60%,#08202c)]">
        {p.cover && (
          <Image
            src={p.cover}
            alt={p.title}
            fill
            sizes="(max-width: 780px) 100vw, 490px"
            className="object-cover"
          />
        )}
        <span className="absolute top-4 left-4 font-en text-[11px] tracking-[0.16em] uppercase bg-[rgba(4,10,12,0.7)] text-tx px-3 py-1.5">
          {priceLabel(p)}
        </span>
      </div>

      <div className="p-7 flex flex-col flex-1">
        <h3 className="font-en font-semibold text-[20px] tracking-[-0.01em]">
          {p.title}
        </h3>
        {p.subtitle && (
          <p className="text-tx2 text-sm mt-1.5">{p.subtitle}</p>
        )}

        <ul className="mt-5 space-y-2 flex-1">
          {p.features.map((f) => (
            <li key={f} className="flex gap-2.5 text-[13.5px] text-tx2 leading-relaxed">
              <span className="text-accent mt-[7px] w-1 h-1 rounded-full bg-accent shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between gap-3">
          {p.price_note && (
            <span className="text-tx3 text-[12px] leading-snug">{p.price_note}</span>
          )}
          {p.examples.length > 0 && (
            <Lightbox
              images={p.examples}
              ariaLabel={`${p.title} 촬영 예시`}
              className="btn-line ml-auto whitespace-nowrap !px-5 !py-2.5"
            >
              촬영 예시 {p.examples.length}장
            </Lightbox>
          )}
        </div>
      </div>
    </div>
  );
}
