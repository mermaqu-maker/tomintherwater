"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProjectInput = {
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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(
  supabase: SupabaseClient,
  base: string,
  excludeId: string,
): Promise<string> {
  const root = base || "project";
  let candidate = root;
  let n = 1;
  // 충돌 시 -2, -3 …
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", candidate)
      .neq("id", excludeId)
      .maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

// "+ 새 프로젝트" → 빈 초안을 만들고 곧바로 편집 화면으로 (1단계 UX)
export async function createDraft(): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const slug = `draft-${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: "제목 없음",
      slug,
      category: "in_water",
      published: false,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("초안 생성 실패");
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${data.id}/edit`);
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const title = input.title.trim();
  if (!title) return { ok: false, error: "제목은 필수입니다." };

  const supabase = await createClient();

  // 슬러그: 백엔드에서만 관리. 초안(draft-) 상태면 제목 기준으로 확정, 이후 고정.
  const { data: cur } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", id)
    .single();
  let slug = cur?.slug ?? "";
  if (!slug || slug.startsWith("draft-")) {
    slug = await uniqueSlug(supabase, slugify(title), id);
  }

  const { error } = await supabase
    .from("projects")
    .update({
      slug,
      title,
      category: input.category,
      types: input.types,
      shot_date: input.shot_date || null,
      caption: input.caption?.trim() || null,
      location: input.location?.trim() || null,
      collaborators: input.collaborators?.trim() || null,
      gear: input.gear?.trim() || null,
      published: input.published,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "저장에 실패했습니다." };

  revalidatePath("/admin/projects");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function deleteProject(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
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
  if (img?.is_cover) {
    const { data: first } = await supabase
      .from("project_images")
      .select("id")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (first)
      await supabase.from("project_images").update({ is_cover: true }).eq("id", first.id);
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
