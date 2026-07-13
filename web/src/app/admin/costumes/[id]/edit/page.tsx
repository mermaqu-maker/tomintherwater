import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CostumeForm from "../../CostumeForm";
import CostumeImages from "../../CostumeImages";
import { deleteCostume } from "../../actions";

export const metadata = { title: "의상 편집" };

export default async function EditCostumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: c } = await supabase
    .from("costumes")
    .select(
      "id,name,type,sizes,colors,courses,price,description,is_available,published,image_paths",
    )
    .eq("id", id)
    .maybeSingle();
  if (!c) notFound();

  const del = deleteCostume.bind(null, id);

  return (
    <div className="max-w-[1000px] mx-auto px-8 pt-[120px] pb-[140px]">
      <div className="flex items-center justify-between">
        <Link href="/admin/costumes" className="text-tx3 text-xs uppercase tracking-[0.16em] hover:text-tx">
          ← 의상 관리
        </Link>
        <Link href="/costumes" className="text-tx3 text-xs uppercase tracking-[0.16em] hover:text-accent">
          의상 페이지 보기 →
        </Link>
      </div>
      <h1 className="font-en font-semibold text-[32px] tracking-[-0.02em] mt-3 mb-8">{c.name}</h1>

      <CostumeForm
        costumeId={id}
        initial={{
          name: c.name,
          type: c.type,
          sizes: c.sizes ?? [],
          colors: c.colors ?? [],
          courses: c.courses ?? [],
          price: c.price,
          description: c.description,
          is_available: c.is_available,
          published: c.published,
        }}
      />

      <div className="mt-12 pt-8 border-t border-line">
        <CostumeImages costumeId={id} paths={c.image_paths ?? []} />
      </div>

      <div className="mt-16 pt-8 border-t border-line flex justify-end">
        <form action={del}>
          <button
            type="submit"
            className="text-[11px] tracking-[0.2em] uppercase text-red-400 border border-red-400/40 px-6 py-3 hover:bg-red-400/10 cursor-pointer"
          >
            의상 삭제
          </button>
        </form>
      </div>
    </div>
  );
}
