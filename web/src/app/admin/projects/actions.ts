"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProjectInput = {
  slug: string;
  title: string;
  category: "in_water" | "on_water";
  types: string[];
  shot_date: string | null;
  caption: string | null;
  location: string | null;
  collaborators: string | null;
  gear: string | null;
  published: boolean;
};

function normalize(input: ProjectInput) {
  return {
    slug: input.slug.trim(),
    title: input.title.trim(),
    category: input.category,
    types: input.types,
    shot_date: input.shot_date || null,
    caption: input.caption?.trim() || null,
    location: input.location?.trim() || null,
    collaborators: input.collaborators?.trim() || null,
    gear: input.gear?.trim() || null,
    published: input.published,
  };
}

export async function createProject(
  input: ProjectInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const n = normalize(input);
  if (!n.slug || !n.title) return { error: "슬러그와 제목은 필수입니다." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...n, published: false })
    .select("id")
    .single();

  if (error)
    return {
      error:
        error.code === "23505"
          ? "이미 사용 중인 슬러그입니다."
          : "생성에 실패했습니다.",
    };
  revalidatePath("/admin/projects");
  return { id: data.id };
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const n = normalize(input);
  if (!n.slug || !n.title) return { ok: false, error: "슬러그와 제목은 필수입니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(n).eq("id", id);
  if (error)
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "이미 사용 중인 슬러그입니다."
          : "저장에 실패했습니다.",
    };
  revalidatePath("/admin/projects");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function deleteProject(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  // storage 파일 정리
  const { data: imgs } = await supabase
    .from("project_images")
    .select("path")
    .eq("project_id", id);
  if (imgs?.length)
    await supabase.storage.from("media").remove(imgs.map((i) => i.path));
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/admin/projects");
  revalidatePath("/gallery");
  redirect("/admin/projects");
}

export async function addProjectImage(
  projectId: string,
  img: { path: string; width: number; height: number; alt: string },
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = await createClient();
  const { count } = await supabase
    .from("project_images")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  const n = count ?? 0;
  await supabase.from("project_images").insert({
    project_id: projectId,
    path: img.path,
    alt: img.alt,
    width: img.width,
    height: img.height,
    is_cover: n === 0,
    sort_order: n,
  });
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath("/gallery");
  return { ok: true };
}

export async function removeProjectImage(
  imageId: string,
  projectId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: img } = await supabase
    .from("project_images")
    .select("path,is_cover")
    .eq("id", imageId)
    .single();
  await supabase.from("project_images").delete().eq("id", imageId);
  if (img?.path) await supabase.storage.from("media").remove([img.path]);
  // 대표가 삭제되면 남은 첫 이미지를 대표로
  if (img?.is_cover) {
    const { data: first } = await supabase
      .from("project_images")
      .select("id")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (first) await supabase.from("project_images").update({ is_cover: true }).eq("id", first.id);
  }
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath("/gallery");
}

export async function setCover(
  projectId: string,
  imageId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("project_images")
    .update({ is_cover: false })
    .eq("project_id", projectId);
  await supabase.from("project_images").update({ is_cover: true }).eq("id", imageId);
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath("/gallery");
}

export async function reorderImages(
  projectId: string,
  orderedIds: string[],
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("project_images").update({ sort_order: i }).eq("id", id),
    ),
  );
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath("/gallery");
}
