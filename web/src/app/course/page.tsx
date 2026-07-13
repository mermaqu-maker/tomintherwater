import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getProducts,
  GROUPS,
  type CourseGroup,
  type Product,
} from "@/lib/course";
import { getAdmin } from "@/lib/auth";
import { createProductDraft } from "@/app/admin/products/actions";
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

  const [all, admin] = await Promise.all([getProducts(), getAdmin()]);
  const items = all.filter((p) => p.group_key === group);
  const groupMeta = GROUPS.find((g) => g.key === group)!;
  const crossKey = CROSS[group];
  const crossItems = crossKey ? all.filter((p) => p.group_key === crossKey) : [];
  const crossMeta = crossKey ? GROUPS.find((g) => g.key === crossKey) : null;

  return (
    <>
      <section className="border-t border-line pt-[150px] pb-[80px]">
        <div className="max-w-[1080px] mx-auto px-8">
          <div className="flex items-center justify-between mb-11">
            <div className="text-center flex-1">
              <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent">
                Course
              </p>
              <h1 className="font-en font-semibold text-[clamp(28px,3.4vw,44px)] tracking-[-0.02em] mt-1.5">
                촬영 코스
              </h1>
            </div>
            {admin && (
              <form action={createProductDraft} className="absolute right-8">
                <button type="submit" className="btn-line">＋ 새 상품</button>
              </form>
            )}
          </div>

          {/* 그룹 탭 */}
          <div className="flex justify-center gap-2 flex-wrap mb-12">
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

          <div className="text-center mb-11">
            <h2 className="font-en text-[19px] tracking-[0.02em] text-tx">
              {groupMeta.label}
            </h2>
            <p className="text-tx3 text-sm mt-1">{groupMeta.caption}</p>
          </div>

          {items.length === 0 ? (
            <p className="text-tx3 text-sm py-16 text-center">준비 중인 코스입니다.</p>
          ) : (
            <div className="flex flex-col gap-7">
              {items.map((p) => (
                <Reveal key={p.id}>
                  <ProductRow product={p} admin={!!admin} />
                </Reveal>
              ))}
            </div>
          )}

          {/* 크로스 추천 */}
          {crossMeta && crossItems.length > 0 && (
            <Reveal>
              <div className="mt-16">
                <p className="font-en text-[11px] tracking-[0.28em] uppercase text-tx3 mb-4">
                  이런 촬영은 어떠세요?
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {crossItems.map((c) => (
                    <Link
                      key={c.id}
                      href={`/course?group=${crossMeta.key}`}
                      className="group grid grid-cols-[110px_1fr] border border-line hover:border-line2 transition-colors overflow-hidden"
                    >
                      <div className="relative bg-[linear-gradient(155deg,#08202c,#0f465b_60%,#08202c)]">
                        {c.cover && (
                          <Image src={c.cover} alt={c.title} fill sizes="110px" className="object-cover" />
                        )}
                      </div>
                      <div className="px-5 py-4">
                        <div className="font-en text-[15px] text-tx">{c.title}</div>
                        <div className="text-tx3 text-[12px] mt-1">{c.subtitle}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* 의상 대여 진입 */}
          <Reveal>
            <Link
              href="/costumes"
              className="group mt-4 flex items-center justify-between bg-bg2 px-7 py-6 hover:bg-bg3 transition-colors"
            >
              <span>
                <span className="block text-tx3 text-[11px] tracking-[0.2em] uppercase">
                  Rental
                </span>
                <span className="block font-en text-[18px] text-tx mt-1">
                  대여 가능한 의상 보기
                </span>
              </span>
              <span className="text-accent text-xl transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <KakaoInquiry />
    </>
  );
}

function ProductRow({ product: p, admin }: { product: Product; admin: boolean }) {
  const coming = p.price_kind === "coming";
  const hasEx = p.examples.length > 0 && !coming;

  const ImageSide = (
    <div className="relative min-h-[300px] md:min-h-full bg-[linear-gradient(155deg,#08202c,#0f465b_60%,#08202c)] w-full h-full">
      {p.cover && (
        <Image src={p.cover} alt={p.title} fill sizes="(max-width:820px) 100vw, 520px" className="object-cover" />
      )}
      {hasEx && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[rgba(6,12,14,0.34)] opacity-0 hover:opacity-100 transition-opacity">
          <span className="font-en text-[20px] text-white">촬영 예시</span>
          <span className="text-[11px] tracking-[0.2em] uppercase text-white/80">
            {p.examples.length}장 보기
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative grid md:grid-cols-[1.1fr_1fr] border border-line overflow-hidden ${coming ? "opacity-70" : ""}`}>
      {admin && (
        <Link
          href={`/admin/products/${p.id}/edit`}
          className="absolute top-4 right-4 z-[3] w-8 h-8 flex items-center justify-center bg-[rgba(6,8,9,0.6)] border border-line2 text-tx2 hover:border-accent hover:text-accent"
          aria-label="상품 편집"
        >
          ✎
        </Link>
      )}

      {hasEx ? (
        <Lightbox images={p.examples} ariaLabel={`${p.title} 촬영 예시`} className="block cursor-zoom-in">
          {ImageSide}
        </Lightbox>
      ) : (
        ImageSide
      )}

      <div className="p-9 md:p-11 flex flex-col">
        <h3 className="font-en font-semibold text-[24px] tracking-[-0.015em]">{p.title}</h3>
        {p.subtitle && <p className="text-tx2 text-sm mt-2 mb-5">{p.subtitle}</p>}

        <ul className="border-b border-line">
          {p.features.map((f) => (
            <li key={f} className="flex gap-3 text-[14px] text-tx2 py-3 border-t border-line">
              <span className="mt-[9px] w-[5px] h-[5px] rounded-full bg-accent shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <PriceBar product={p} />

        {hasEx && (
          <Lightbox
            images={p.examples}
            ariaLabel={`${p.title} 촬영 예시`}
            className="inline-flex items-center gap-2 text-accent text-[11px] tracking-[0.14em] uppercase mt-6 hover:opacity-80 self-start"
          >
            촬영 예시 보기 →
          </Lightbox>
        )}
      </div>
    </div>
  );
}

function PriceBar({ product: p }: { product: Product }) {
  const amount = p.price_amount?.toLocaleString("ko-KR");
  return (
    <div className="flex items-end justify-between gap-5 pt-6">
      {p.price_kind === "coming" ? (
        <>
          <span className="font-en text-[10px] tracking-[0.22em] uppercase text-tx3 pb-2">
            Signature
          </span>
          <span className="font-en font-medium text-[15px] tracking-[0.18em] uppercase text-tx2">
            Coming soon
          </span>
        </>
      ) : p.price_kind === "inquire" ? (
        <>
          <span className="font-en text-[10px] tracking-[0.22em] uppercase text-tx3 pb-2">
            촬영 문의
          </span>
          <span className="font-en text-[20px] text-tx">별도 문의</span>
        </>
      ) : (
        <>
          <span className="font-en text-[10px] tracking-[0.22em] uppercase text-tx3 pb-2">
            촬영 비용
          </span>
          <span className="flex flex-col items-end gap-1.5">
            {p.price_kind === "from" && (
              <span className="font-en text-[10px] tracking-[0.24em] uppercase text-tx3">from</span>
            )}
            <span className="font-en text-[38px] leading-none tracking-[-0.03em] text-tx flex items-start gap-[0.1em]">
              {amount}
              <span className="text-[0.34em] text-tx2 mt-[0.42em]">₩</span>
            </span>
            {p.price_note && (
              <span className="text-tx3 text-[12px] text-right max-w-[240px]">{p.price_note}</span>
            )}
          </span>
        </>
      )}
    </div>
  );
}
