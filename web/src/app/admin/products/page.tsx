import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GROUPS } from "@/lib/course-meta";
import { createProductDraft } from "./actions";

export const metadata = { title: "상품 관리" };

export default async function AdminProductsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id,title,group_key,is_active,cover_path,example_paths")
    .order("sort_order", { ascending: true });

  const products = data ?? [];
  const groupLabel = (k: string) => GROUPS.find((g) => g.key === k)?.label ?? k;

  return (
    <div className="max-w-[1000px] mx-auto px-8 pt-[120px] pb-[140px]">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent">Admin</p>
          <h1 className="font-en font-semibold text-[32px] tracking-[-0.02em] mt-1">상품 관리</h1>
        </div>
        <form action={createProductDraft}>
          <button type="submit" className="cta-solid">＋ 새 상품</button>
        </form>
      </div>

      {products.length === 0 ? (
        <p className="text-tx3 text-sm py-16 text-center border border-dashed border-line2">
          아직 등록된 상품이 없습니다.
        </p>
      ) : (
        <div className="border-t border-line">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/admin/products/${p.id}/edit`}
              className="flex items-center justify-between py-4 border-b border-line hover:bg-white/[0.02] px-2 -mx-2 transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="text-tx">{p.title}</span>
                <span className="text-tx3 text-xs">{groupLabel(p.group_key)}</span>
              </span>
              <span className="flex items-center gap-4 text-[11px] tracking-[0.1em] uppercase">
                <span className="text-tx3">
                  {p.cover_path ? "대표✓" : "대표✕"} · 예시 {p.example_paths?.length ?? 0}
                </span>
                <span className={p.is_active ? "text-accent" : "text-tx3"}>
                  {p.is_active ? "공개" : "비공개"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
