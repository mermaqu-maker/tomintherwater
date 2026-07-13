"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CourseGroup, PriceKind } from "@/lib/course-meta";

export type ProductInput = {
  title: string;
  subtitle: string | null;
  group_key: CourseGroup;
  features: string[];
  price_kind: PriceKind;
  price_amount: number | null;
  price_note: string | null;
  is_active: boolean;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createProductDraft(): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const slug = `draft-${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await supabase
    .from("products")
    .insert({
      slug,
      title: "새 상품",
      group_key: "essential",
      price_kind: "inquire",
      is_active: false,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("초안 생성 실패");
  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}/edit`);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const title = input.title.trim();
  if (!title) return { ok: false, error: "상품명은 필수입니다." };
  if (
    (input.price_kind === "fixed" || input.price_kind === "from") &&
    (input.price_amount == null || input.price_amount <= 0)
  )
    return { ok: false, error: "단일가/범위는 가격(원)을 입력해야 합니다." };

  const supabase = await createClient();
  const { data: cur } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .single();
  let slug = cur?.slug ?? "";
  if (!slug || slug.startsWith("draft-")) {
    const base = slugify(title) || "product";
    slug = base;
    let n = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();
      if (!data) break;
      n += 1;
      slug = `${base}-${n}`;
    }
  }

  const { error } = await supabase
    .from("products")
    .update({
      slug,
      title,
      subtitle: input.subtitle?.trim() || null,
      group_key: input.group_key,
      features: input.features,
      price_kind: input.price_kind,
      price_amount:
        input.price_kind === "fixed" || input.price_kind === "from"
          ? input.price_amount
          : null,
      price_note: input.price_note?.trim() || null,
      is_active: input.is_active,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "저장에 실패했습니다." };

  revalidatePath("/admin/products");
  revalidatePath("/course");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("products")
    .select("cover_path,example_paths")
    .eq("id", id)
    .maybeSingle();
  const paths = [
    ...(p?.cover_path ? [p.cover_path] : []),
    ...(p?.example_paths ?? []),
  ];
  if (paths.length) await supabase.storage.from("media").remove(paths);
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/course");
  redirect("/admin/products");
}

// 대표 이미지 (cover_path 단일)
export async function setProductCover(id: string, path: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("cover_path")
    .eq("id", id)
    .single();
  await supabase.from("products").update({ cover_path: path }).eq("id", id);
  if (data?.cover_path) await supabase.storage.from("media").remove([data.cover_path]);
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/course");
}

export async function removeProductCover(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("cover_path")
    .eq("id", id)
    .single();
  await supabase.from("products").update({ cover_path: null }).eq("id", id);
  if (data?.cover_path) await supabase.storage.from("media").remove([data.cover_path]);
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/course");
}

// 촬영 예시 (example_paths 배열)
export async function addProductExample(id: string, path: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("example_paths")
    .eq("id", id)
    .single();
  const paths = [...(data?.example_paths ?? []), path];
  await supabase.from("products").update({ example_paths: paths }).eq("id", id);
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/course");
}

export async function setProductExamples(id: string, paths: string[]): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("products").update({ example_paths: paths }).eq("id", id);
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/course");
}

export async function removeProductExample(id: string, path: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("example_paths")
    .eq("id", id)
    .single();
  const paths = (data?.example_paths ?? []).filter((p: string) => p !== path);
  await supabase.from("products").update({ example_paths: paths }).eq("id", id);
  await supabase.storage.from("media").remove([path]);
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/course");
}
