import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import type { Category, ProjectType } from "@/lib/gallery";

export type ProjectImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type ProjectComment = {
  id: string;
  nickname: string;
  body: string;
  created_at: string;
};

export type ProjectDetail = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  types: ProjectType[];
  year: number | null;
  shotLabel: string | null;
  caption: string | null;
  location: string | null;
  collaborators: string | null;
  gear: string | null;
  likeCount: number;
  cover: ProjectImage | null;
  images: ProjectImage[];
};

export type RelatedCard = {
  slug: string;
  title: string;
  cover: ProjectImage | null;
};

const CATEGORY_LABEL: Record<Category, string> = {
  in_water: "In the Water",
  on_water: "On the Water",
};

function toImage(i: {
  path: string;
  alt: string | null;
  width: number;
  height: number;
}): ProjectImage {
  return {
    url: mediaUrl(i.path),
    alt: i.alt ?? "",
    width: i.width,
    height: i.height,
  };
}

// cache(): generateMetadata + 페이지 본문이 같은 요청에서 두 번 불러도 조회는 1번.
export const getProject = cache(async (
  slug: string,
): Promise<ProjectDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,slug,title,category,types,shot_date,caption,location,collaborators,gear,like_count,project_images(path,alt,width,height,is_cover,sort_order)",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  const imgs = [...(data.project_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const cover = imgs.find((i) => i.is_cover) ?? imgs[0] ?? null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    category: data.category,
    types: data.types ?? [],
    year: data.shot_date ? new Date(data.shot_date).getFullYear() : null,
    shotLabel: data.shot_date
      ? new Date(data.shot_date).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
        })
      : null,
    caption: data.caption,
    location: data.location,
    collaborators: data.collaborators,
    gear: data.gear,
    likeCount: data.like_count ?? 0,
    cover: cover ? toImage(cover) : null,
    images: imgs.map(toImage),
  };
});

export function categoryLabel(c: Category): string {
  return CATEGORY_LABEL[c];
}

/** 이전/다음 프로젝트 (같은 카테고리, sort_order 순) */
export async function getAdjacent(
  project: ProjectDetail,
): Promise<{ prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("slug,title")
    .eq("published", true)
    .eq("category", project.category)
    .order("sort_order", { ascending: true });

  const list = data ?? [];
  const idx = list.findIndex((p) => p.slug === project.slug);
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
  };
}

/** You may also like — 같은 카테고리, 성격 겹침 우선, 자기 제외, 최대 3 */
export async function getRelated(
  project: ProjectDetail,
): Promise<RelatedCard[]> {
  const supabase = await createClient();
  let q = supabase
    .from("projects")
    .select("slug,title,project_images(path,alt,width,height,is_cover,sort_order)")
    .eq("published", true)
    .eq("category", project.category)
    .neq("slug", project.slug)
    .limit(3);

  if (project.types.length > 0) q = q.overlaps("types", project.types);

  const { data } = await q;
  return (data ?? []).map((p) => {
    const imgs = [...(p.project_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const cover = imgs.find((i) => i.is_cover) ?? imgs[0] ?? null;
    return { slug: p.slug, title: p.title, cover: cover ? toImage(cover) : null };
  });
}
