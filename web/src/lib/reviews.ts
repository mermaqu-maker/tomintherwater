import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";

export const REVIEWS_PAGE_SIZE = 8;

export type Review = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  product_id: string | null;
  product_label: string;
  images: string[];
  created_at: string;
};

type Row = Omit<Review, "images"> & { image_paths: string[] };

/** 공개 후기 목록 (상품 필터 + load-more 페이징). RLS: not hidden or admin. */
export async function getReviews(opts: {
  productId?: string;
  offset?: number;
  limit?: number;
}): Promise<{ items: Review[]; hasMore: boolean }> {
  const supabase = await createClient();
  const offset = opts.offset ?? 0;
  const limit = opts.limit ?? REVIEWS_PAGE_SIZE;

  let q = supabase
    .from("reviews")
    .select(
      "id,author_name,rating,body,product_id,product_label,image_paths,created_at",
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit); // +1로 다음 페이지 존재 여부 판단

  if (opts.productId) q = q.eq("product_id", opts.productId);

  const { data } = await q.returns<Row[]>();
  const rows = data ?? [];
  const hasMore = rows.length > limit;
  return {
    items: rows.slice(0, limit).map((r) => ({
      ...r,
      images: (r.image_paths ?? []).map(mediaUrl),
    })),
    hasMore,
  };
}

/** 후기 작성 시 선택할 촬영 상품 목록 (활성 상품 기준). */
export async function getReviewProductOptions(): Promise<
  { id: string; label: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id,title,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<{ id: string; title: string; sort_order: number }[]>();
  return (data ?? []).map((p) => ({ id: p.id, label: p.title }));
}
