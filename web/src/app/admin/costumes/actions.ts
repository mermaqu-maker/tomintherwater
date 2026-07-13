"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CostumeInput = {
  name: string;
  type: string;
  sizes: string[];
  colors: string[];
  courses: string[];
  price: number;
  description: string | null;
  is_available: boolean;
  published: boolean;
};

export async function createCostumeDraft(): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("costumes")
    .insert({
      name: "새 의상",
      type: "dress",
      price: 10000,
      published: false,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("초안 생성 실패");
  revalidatePath("/admin/costumes");
  redirect(`/admin/costumes/${data.id}/edit`);
}

export async function updateCostume(
  id: string,
  input: CostumeInput,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "의상 이름은 필수입니다." };
  if (![10000, 20000, 30000, 40000, 50000].includes(input.price))
    return { ok: false, error: "대여가는 1~5만 원(1만 단위)이어야 합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("costumes")
    .update({
      name,
      type: input.type,
      sizes: input.sizes,
      colors: input.colors,
      courses: input.courses,
      price: input.price,
      description: input.description?.trim() || null,
      is_available: input.is_available,
      published: input.published,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "저장에 실패했습니다." };

  revalidatePath("/admin/costumes");
  revalidatePath("/costumes");
  return { ok: true };
}

export async function deleteCostume(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: c } = await supabase
    .from("costumes")
    .select("image_paths")
    .eq("id", id)
    .maybeSingle();
  if (c?.image_paths?.length)
    await supabase.storage.from("media").remove(c.image_paths);
  await supabase.from("costumes").delete().eq("id", id);
  revalidatePath("/admin/costumes");
  revalidatePath("/costumes");
  redirect("/admin/costumes");
}

// 이미지: costumes.image_paths 배열 관리 ([0] = 대표)
export async function addCostumeImage(id: string, path: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("costumes")
    .select("image_paths")
    .eq("id", id)
    .single();
  const paths = [...(data?.image_paths ?? []), path];
  await supabase.from("costumes").update({ image_paths: paths }).eq("id", id);
  revalidatePath(`/admin/costumes/${id}/edit`);
  revalidatePath("/costumes");
}

export async function setCostumeImages(
  id: string,
  paths: string[],
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("costumes").update({ image_paths: paths }).eq("id", id);
  revalidatePath(`/admin/costumes/${id}/edit`);
  revalidatePath("/costumes");
}

export async function removeCostumeImage(
  id: string,
  path: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("costumes")
    .select("image_paths")
    .eq("id", id)
    .single();
  const paths = (data?.image_paths ?? []).filter((p: string) => p !== path);
  await supabase.from("costumes").update({ image_paths: paths }).eq("id", id);
  await supabase.storage.from("media").remove([path]);
  revalidatePath(`/admin/costumes/${id}/edit`);
  revalidatePath("/costumes");
}
