import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";

export type CourseGroup = "essential" | "special" | "group";
export type PriceKind = "fixed" | "from" | "inquire" | "coming";

export const GROUPS: { key: CourseGroup; label: string; caption: string }[] = [
  { key: "essential", label: "Essential", caption: "기본 촬영" },
  { key: "special", label: "Special", caption: "특별 촬영" },
  { key: "group", label: "Group & Commercial", caption: "그룹 · 이벤트 · 상업" },
];

export type Product = {
  id: string;
  slug: string;
  group_key: CourseGroup;
  title: string;
  subtitle: string | null;
  features: string[];
  price_kind: PriceKind;
  price_amount: number | null;
  price_note: string | null;
  cover: string | null;
  examples: string[];
  sort_order: number;
};

type Row = {
  id: string;
  slug: string;
  group_key: CourseGroup;
  title: string;
  subtitle: string | null;
  features: string[];
  price_kind: PriceKind;
  price_amount: number | null;
  price_note: string | null;
  cover_path: string | null;
  example_paths: string[];
  sort_order: number;
};

function map(r: Row): Product {
  return {
    id: r.id,
    slug: r.slug,
    group_key: r.group_key,
    title: r.title,
    subtitle: r.subtitle,
    features: r.features ?? [],
    price_kind: r.price_kind,
    price_amount: r.price_amount,
    price_note: r.price_note,
    cover: r.cover_path ? mediaUrl(r.cover_path) : null,
    examples: (r.example_paths ?? []).map(mediaUrl),
    sort_order: r.sort_order,
  };
}

/** 활성 상품 전체 (그룹별 렌더는 페이지에서). RLS: is_active or admin. */
export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id,slug,group_key,title,subtitle,features,price_kind,price_amount,price_note,cover_path,example_paths,sort_order",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<Row[]>();
  return (data ?? []).map(map);
}

/** 원(₩) → 사람이 읽는 표기. 만 단위로 딱 떨어지면 "N만 원". */
function won(amount: number): string {
  if (amount % 10000 === 0) return `${amount / 10000}만 원`;
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** 가격 표시 문자열 (카드 상단 강조용). */
export function priceLabel(p: Product): string {
  switch (p.price_kind) {
    case "fixed":
      return p.price_amount != null ? won(p.price_amount) : "";
    case "from":
      return p.price_amount != null ? `${won(p.price_amount)}부터` : "";
    case "inquire":
      return "별도 문의";
    case "coming":
      return "COMING SOON";
  }
}
