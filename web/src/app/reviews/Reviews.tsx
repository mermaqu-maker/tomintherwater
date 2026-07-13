"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/reviews";
import Lightbox from "@/components/Lightbox";
import { submitReview, adminDeleteReview, loadMoreReviews } from "./actions";

const field =
  "w-full bg-bg border border-line text-tx text-sm px-3.5 py-3 font-[300] placeholder:text-tx3 focus:outline-none focus:border-line2";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-accent text-[13px] tracking-[1px]" aria-label={`별점 ${value}점`}>
      {"★".repeat(value)}
      <span className="text-tx3">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n}점`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition-colors ${
            n <= shown ? "text-accent" : "text-tx3"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Reviews({
  initial,
  initialHasMore,
  productId,
  productOptions,
  isAdmin,
}: {
  initial: Review[];
  initialHasMore: boolean;
  productId?: string;
  productOptions: { id: string; label: string }[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [items, setItems] = useState<Review[]>(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [open, setOpen] = useState(false);

  // 작성 폼 상태
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [product, setProduct] = useState(productOptions[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function loadMore() {
    start(async () => {
      const r = await loadMoreReviews({ productId, offset: items.length });
      setItems((prev) => [...prev, ...r.items]);
      setHasMore(r.hasMore);
    });
  }

  function submit() {
    setError(null);
    start(async () => {
      const r = await submitReview({ authorName: name, rating, productId: product, body });
      if (!r.ok) return setError(r.error ?? "오류가 발생했습니다.");
      setName("");
      setRating(0);
      setBody("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex justify-center mb-12">
        <button type="button" onClick={() => setOpen(true)} className="cta-solid">
          후기 작성하기
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-tx3 text-sm text-center py-16">
          아직 등록된 후기가 없습니다. 첫 후기를 남겨보세요.
        </p>
      ) : (
        <div className="max-w-[780px] mx-auto flex flex-col">
          {items.map((r) => (
            <div key={r.id} className="py-6 border-b border-line">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-tx text-[14px]">{r.author_name}</span>
                  <Stars value={r.rating} />
                </div>
                <span className="text-[10px] tracking-[0.12em] uppercase text-tx3 border border-line px-2.5 py-1">
                  {r.product_label}
                </span>
              </div>
              <p className="text-tx2 text-[14px] leading-relaxed mt-3 whitespace-pre-line">
                {r.body}
              </p>
              {r.images.length > 0 && (
                <Lightbox
                  images={r.images}
                  ariaLabel="후기 사진"
                  className="inline-block mt-3 text-[11px] tracking-[0.14em] uppercase text-accent hover:opacity-80"
                >
                  사진 {r.images.length}장 보기
                </Lightbox>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span className="text-tx3 text-[11px]">
                  {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await adminDeleteReview(r.id);
                        setItems((prev) => prev.filter((x) => x.id !== r.id));
                      })
                    }
                    className="text-red-400/80 hover:text-red-400 text-[11px] cursor-pointer"
                  >
                    ✕ 관리자 삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="btn-line disabled:opacity-50"
          >
            {pending ? "불러오는 중…" : "더 보기"}
          </button>
        </div>
      )}

      {/* 작성 모달 */}
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-[rgba(4,6,7,0.86)] flex items-center justify-center p-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[520px] bg-bg2 border border-line p-7 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-en text-[18px] tracking-[0.02em] text-tx">
                후기 작성
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-tx3 hover:text-tx text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                className={field}
                placeholder="닉네임"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div>
                <label className="block text-[11px] tracking-[0.14em] uppercase text-tx3 mb-2">
                  촬영 상품
                </label>
                <select
                  className={`${field} [color-scheme:dark]`}
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                >
                  {productOptions.length === 0 && <option value="">-</option>}
                  {productOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.14em] uppercase text-tx3 mb-2">
                  별점
                </label>
                <StarInput value={rating} onChange={setRating} />
              </div>
              <textarea
                className={field}
                rows={5}
                placeholder="촬영 경험을 들려주세요."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              {error && <p className="text-[13px] text-red-400">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-line">
                  취소
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending}
                  className="cta-solid disabled:opacity-50"
                >
                  {pending ? "등록 중…" : "등록"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
