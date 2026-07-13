import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";

export type FeaturedCard = {
  projectId: string;
  slug: string;
  title: string;
  category: "in_water" | "on_water";
  year: number | null;
  cover: { url: string; width: number; height: number } | null;
};

type ImgRow = {
  path: string;
  width: number;
  height: number;
  is_cover: boolean;
  sort_order: number;
};

function coverOf(imgs: ImgRow[]) {
  const sorted = [...(imgs ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const c = sorted.find((i) => i.is_cover) ?? sorted[0];
  return c
    ? { url: mediaUrl(c.path), width: c.width, height: c.height }
    : null;
}

/** 홈 대표작 — featured_projects.position 순. 비공개 프로젝트는 제외. */
export async function getFeatured(): Promise<FeaturedCard[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("featured_projects")
    .select(
      "position, projects!inner(id,slug,title,category,shot_date,published,project_images(path,width,height,is_cover,sort_order))",
    )
    .order("position", { ascending: true })
    .returns<
      {
        position: number;
        projects: {
          id: string;
          slug: string;
          title: string;
          category: "in_water" | "on_water";
          shot_date: string | null;
          published: boolean;
          project_images: ImgRow[];
        };
      }[]
    >();

  return (data ?? [])
    .filter((r) => r.projects?.published)
    .map((r) => ({
      projectId: r.projects.id,
      slug: r.projects.slug,
      title: r.projects.title,
      category: r.projects.category,
      year: r.projects.shot_date
        ? new Date(r.projects.shot_date).getFullYear()
        : null,
      cover: coverOf(r.projects.project_images),
    }));
}

/** 관리자 ＋ 팝업용 — 아직 Featured에 없는 공개 프로젝트 (분류·연도 필터용 메타 포함). */
export async function getFeaturableProjects(): Promise<
  { id: string; title: string; category: "in_water" | "on_water"; year: number | null }[]
> {
  const supabase = await createClient();
  const [{ data: feat }, { data: projs }] = await Promise.all([
    supabase.from("featured_projects").select("project_id"),
    supabase
      .from("projects")
      .select("id,title,category,shot_date")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .returns<
        {
          id: string;
          title: string;
          category: "in_water" | "on_water";
          shot_date: string | null;
        }[]
      >(),
  ]);
  const taken = new Set((feat ?? []).map((f) => f.project_id));
  return (projs ?? [])
    .filter((p) => !taken.has(p.id))
    .map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      year: p.shot_date ? new Date(p.shot_date).getFullYear() : null,
    }));
}
