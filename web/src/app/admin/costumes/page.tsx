import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { typeLabel, priceText } from "@/lib/costumes";
import { createCostumeDraft } from "./actions";

export const metadata = { title: "의상 관리" };

export default async function AdminCostumesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("costumes")
    .select("id,name,type,price,published,image_paths")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const costumes = data ?? [];

  return (
    <div className="max-w-[1000px] mx-auto px-8 pt-[120px] pb-[140px]">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent">Admin</p>
          <h1 className="font-en font-semibold text-[32px] tracking-[-0.02em] mt-1">의상 관리</h1>
        </div>
        <form action={createCostumeDraft}>
          <button type="submit" className="cta-solid">＋ 의상 추가</button>
        </form>
      </div>

      {costumes.length === 0 ? (
        <p className="text-tx3 text-sm py-16 text-center border border-dashed border-line2">
          아직 등록된 의상이 없습니다. ‘의상 추가’로 시작하세요.
        </p>
      ) : (
        <div className="border-t border-line">
          {costumes.map((c) => (
            <Link
              key={c.id}
              href={`/admin/costumes/${c.id}/edit`}
              className="flex items-center justify-between py-4 border-b border-line hover:bg-white/[0.02] px-2 -mx-2 transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="text-tx">{c.name}</span>
                <span className="text-tx3 text-xs">{typeLabel(c.type)} · {priceText(c.price)}</span>
              </span>
              <span className="flex items-center gap-4 text-[11px] tracking-[0.1em] uppercase">
                <span className="text-tx3">{(c.image_paths?.length ?? 0)}장</span>
                <span className={c.published ? "text-accent" : "text-tx3"}>
                  {c.published ? "공개" : "비공개"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
