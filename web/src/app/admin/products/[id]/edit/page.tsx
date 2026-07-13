import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../../ProductForm";
import ProductImages from "../../ProductImages";
import { deleteProduct } from "../../actions";

export const metadata = { title: "상품 편집" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: p } = await supabase
    .from("products")
    .select(
      "id,title,subtitle,group_key,features,price_kind,price_amount,price_note,is_active,cover_path,example_paths",
    )
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const del = deleteProduct.bind(null, id);

  return (
    <div className="max-w-[1000px] mx-auto px-8 pt-[120px] pb-[140px]">
      <div className="flex items-center justify-between">
        <Link href="/admin/products" className="text-tx3 text-xs uppercase tracking-[0.16em] hover:text-tx">
          ← 상품 관리
        </Link>
        <Link href="/course" className="text-tx3 text-xs uppercase tracking-[0.16em] hover:text-accent">
          코스 페이지 보기 →
        </Link>
      </div>
      <h1 className="font-en font-semibold text-[32px] tracking-[-0.02em] mt-3 mb-8">{p.title}</h1>

      <ProductForm
        productId={id}
        initial={{
          title: p.title,
          subtitle: p.subtitle,
          group_key: p.group_key,
          features: p.features ?? [],
          price_kind: p.price_kind,
          price_amount: p.price_amount,
          price_note: p.price_note,
          is_active: p.is_active,
        }}
      />

      <div className="mt-12 pt-8 border-t border-line">
        <ProductImages
          productId={id}
          cover={p.cover_path}
          examples={p.example_paths ?? []}
        />
      </div>

      <div className="mt-16 pt-8 border-t border-line flex justify-end">
        <form action={del}>
          <button
            type="submit"
            className="text-[11px] tracking-[0.2em] uppercase text-red-400 border border-red-400/40 px-6 py-3 hover:bg-red-400/10 cursor-pointer"
          >
            상품 삭제
          </button>
        </form>
      </div>
    </div>
  );
}
