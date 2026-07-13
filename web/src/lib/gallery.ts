import { createClient } from "@/lib/supabase/server";

export type Category = "in_water" | "on_water";
export type ProjectType = "editorial" | "event" | "commercial";

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: "in_water", label: "In the Water" },
  { key: "on_water", label: "On the Water" },
];

export const TYPES: { key: ProjectType; label: string }[] = [
  { key: "editorial", label: "Editorial" },
  { key: "event", label: "Event" },
  { key: "commercial", label: "Commercial" },
];

export type GalleryFilters = {
  category: Category;
  type?: ProjectType;
  place?: string;
  year?: number;
};

export type GalleryCard = {
  slug: string;
  title: string;
  year: number | null;
  cover: { url: string; width: number; height: number } | null;
};

type ProjectRow = {
  slug: string;
  title: string;
  shot_date: string | null;
  project_images: {
    path: string;
    width: number;
    height: number;
    is_cover: boolean;
    sort_order: number;
  }[];
};

/** 공개 프로젝트 목록 (카테고리 + 필터). 데이터 없으면 빈 배열. */
export async function getGalleryProjects(
  f: GalleryFilters,
): Promise<GalleryCard[]> {
  const supabase = await createClient();

  let q = supabase
    .from("projects")
    .select(
      "slug,title,shot_date,project_images(path,width,height,is_cover,sort_order)",
    )
    .eq("published", true)
    .eq("category", f.category)
    .order("sort_order", { ascending: true });

  if (f.type) q = q.contains("types", [f.type]);
  if (f.place) q = q.eq("location", f.place);
  if (f.year) {
    q = q
      .gte("shot_date", `${f.year}-01-01`)
      .lt("shot_date", `${f.year + 1}-01-01`);
  }

  const { data, error } = await q.returns<ProjectRow[]>();
  if (error || !data) return [];

  return data.map((p) => {
    const imgs = [...p.project_images].sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const cover = imgs.find((i) => i.is_cover) ?? imgs[0];
    return {
      slug: p.slug,
      title: p.title,
      year: p.shot_date ? new Date(p.shot_date).getFullYear() : null,
      cover: cover
        ? {
            url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${cover.path}`,
            width: cover.width,
            height: cover.height,
          }
        : null,
    };
  });
}

/** PLACE/YEAR 필터 후보 — 등록된 데이터에서 자동 생성 (뷰). 없으면 빈 배열. */
export async function getFacets(
  category: Category,
): Promise<{ places: string[]; years: number[] }> {
  const supabase = await createClient();

  const [places, years] = await Promise.all([
    supabase
      .from("v_gallery_places")
      .select("place")
      .eq("category", category)
      .returns<{ place: string }[]>(),
    supabase
      .from("v_gallery_years")
      .select("year")
      .eq("category", category)
      .returns<{ year: number }[]>(),
  ]);

  return {
    places: places.data?.map((r) => r.place) ?? [],
    years: years.data?.map((r) => r.year) ?? [],
  };
}
