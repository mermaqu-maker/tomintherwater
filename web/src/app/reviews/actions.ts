"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { getReviews, type Review } from "@/lib/reviews";

type Result = { ok: boolean; error?: string };

// TODO(M4): Cloudflare Turnstile 캡차 검증 추가. 현재는 service_role 서버 경유만 허용.
export async function submitReview(input: {
  authorName: string;
  rating: number;
  productId: string;
  body: string;
}): Promise<Result> {
  const authorName = input.authorName.trim();
  const body = input.body.trim();
  const rating = Math.round(input.rating);

  if (!authorName || authorName.length > 40)
    return { ok: false, error: "닉네임을 입력하세요 (최대 40자)." };
  if (!(rating >= 1 && rating <= 5))
    return { ok: false, error: "별점을 선택하세요." };
  if (!body) return { ok: false, error: "후기 내용을 입력하세요." };
  if (body.length > 2000)
    return { ok: false, error: "후기는 2000자 이내로 작성해 주세요." };
  if (!input.productId)
    return { ok: false, error: "촬영 상품을 선택하세요." };

  const admin = createAdminClient();

  // 상품명 스냅샷 (상품이 삭제돼도 필터/표시 유지)
  const { data: product } = await admin
    .from("products")
    .select("id,title")
    .eq("id", input.productId)
    .maybeSingle();
  if (!product) return { ok: false, error: "선택한 상품을 찾을 수 없습니다." };

  const { error } = await admin.from("reviews").insert({
    author_name: authorName,
    rating,
    body,
    product_id: product.id,
    product_label: product.title,
  });
  if (error) return { ok: false, error: "등록에 실패했습니다." };

  revalidatePath("/reviews");
  return { ok: true };
}

export async function adminDeleteReview(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, error: "삭제에 실패했습니다." };
  revalidatePath("/reviews");
  return { ok: true };
}

export async function loadMoreReviews(input: {
  productId?: string;
  offset: number;
}): Promise<{ items: Review[]; hasMore: boolean }> {
  return getReviews({ productId: input.productId, offset: input.offset });
}
