import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import {
  COSTUME_TYPES,
  COSTUME_SIZES,
  COSTUME_COURSES,
  sortColors,
  type CostumeType,
} from "@/lib/costume-meta";

export type { CostumeType } from "@/lib/costume-meta";
export {
  COSTUME_TYPES,
  COSTUME_SIZES,
  COSTUME_COURSES,
  typeLabel,
  courseLabel,
  priceText,
  priceAmount,
  sizeRange,
  colorSwatch,
  sortColors,
} from "@/lib/costume-meta";

export type Costume = {
  id: string;
  name: string;
  type: CostumeType;
  sizes: string[];
  colors: string[];
  courses: string[];
  price: number;
  description: string | null;
  images: string[];
  is_available: boolean;
  sort_order: number;
};

type Row = Omit<Costume, "images"> & { image_paths: string[] };

export type CostumeFilters = {
  type?: string;
  size?: string;
  course?: string;
  color?: string;
};

/** 공개 의상 목록 (+ 선택 필터). RLS: published or admin. */
export async function getCostumes(f: CostumeFilters = {}): Promise<Costume[]> {
  const supabase = await createClient();
  let q = supabase
    .from("costumes")
    .select(
      "id,name,type,sizes,colors,courses,price,description,image_paths,is_available,sort_order",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (f.type) q = q.eq("type", f.type);
  if (f.size) q = q.contains("sizes", [f.size]);
  if (f.course) q = q.contains("courses", [f.course]);
  if (f.color) q = q.contains("colors", [f.color]);

  const { data } = await q.returns<Row[]>();
  return (data ?? []).map((r) => ({
    ...r,
    images: (r.image_paths ?? []).map(mediaUrl),
  }));
}

/** 필터 후보 — 등록된 공개 의상에서 실제 존재하는 값만 노출. */
export async function getCostumeFacets(): Promise<{
  types: string[];
  sizes: string[];
  courses: string[];
  colors: string[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("costumes")
    .select("type,sizes,courses,colors")
    .eq("published", true)
    .returns<
      { type: string; sizes: string[]; courses: string[]; colors: string[] }[]
    >();
  const rows = data ?? [];
  const types = new Set<string>();
  const sizes = new Set<string>();
  const courses = new Set<string>();
  const colors = new Set<string>();
  for (const r of rows) {
    types.add(r.type);
    (r.sizes ?? []).forEach((s) => sizes.add(s));
    (r.courses ?? []).forEach((c) => courses.add(c));
    (r.colors ?? []).forEach((c) => colors.add(c));
  }
  return {
    types: COSTUME_TYPES.map((t) => t.key).filter((k) => types.has(k)),
    sizes: [...COSTUME_SIZES].filter((s) => sizes.has(s)),
    courses: COSTUME_COURSES.map((c) => c.key).filter((k) => courses.has(k)),
    colors: sortColors([...colors]),
  };
}
