import type { Metadata } from "next";
import Link from "next/link";
import { getReviews, getReviewProductOptions } from "@/lib/reviews";
import { getAdmin } from "@/lib/auth";
import Reviews from "./Reviews";

export const metadata: Metadata = {
  title: "Reviews",
  description: "TOM in the Water 수중 촬영을 경험한 분들의 후기.",
};

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const sp = await searchParams;
  const productId = sp.product || undefined;

  const [{ items, hasMore }, options, admin] = await Promise.all([
    getReviews({ productId }),
    getReviewProductOptions(),
    getAdmin(),
  ]);

  return (
    <section className="border-t border-line pt-[150px] pb-[120px]">
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="text-center mb-9">
          <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent">
            Reviews
          </p>
          <h1 className="font-en font-semibold text-[clamp(28px,3.4vw,44px)] tracking-[-0.02em] mt-1.5">
            촬영 후기
          </h1>
        </div>

        {/* 상품 필터 */}
        <div className="flex justify-center gap-2 flex-wrap mb-12">
          <Chip href="/reviews" on={!productId}>
            전체
          </Chip>
          {options.map((o) => (
            <Chip key={o.id} href={`/reviews?product=${o.id}`} on={productId === o.id}>
              {o.label}
            </Chip>
          ))}
        </div>

        <Reviews
          key={productId ?? "all"}
          initial={items}
          initialHasMore={hasMore}
          productId={productId}
          productOptions={options}
          isAdmin={!!admin}
        />
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
      className={`font-en text-[11px] tracking-[0.1em] uppercase border px-4 py-[7px] transition-colors ${
        on ? "text-tx border-line2" : "text-tx3 border-line hover:text-tx hover:border-line2"
      }`}
    >
      {children}
    </Link>
  );
}
