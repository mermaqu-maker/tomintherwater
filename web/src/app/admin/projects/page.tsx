import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "프로젝트 관리" };

export default async function AdminProjectsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id,slug,title,category,published")
    .order("sort_order", { ascending: true });

  const projects = data ?? [];

  return (
    <div className="max-w-[1000px] mx-auto px-8 pt-[120px] pb-[140px]">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent">
            Admin
          </p>
          <h1 className="font-en font-semibold text-[32px] tracking-[-0.02em] mt-1">
            프로젝트 관리
          </h1>
        </div>
        <Link href="/admin/projects/new" className="cta-solid">
          ＋ 새 프로젝트
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-tx3 text-sm py-16 text-center border border-dashed border-line2">
          아직 프로젝트가 없습니다. ‘새 프로젝트’로 시작하세요.
        </p>
      ) : (
        <div className="border-t border-line">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/admin/projects/${p.id}/edit`}
              className="flex items-center justify-between py-4 border-b border-line hover:bg-white/[0.02] px-2 -mx-2 transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="text-tx">{p.title}</span>
                <span className="text-tx3 text-xs">/{p.slug}</span>
              </span>
              <span className="flex items-center gap-4 text-[11px] tracking-[0.1em] uppercase">
                <span className="text-tx3">
                  {p.category === "in_water" ? "수중" : "지상"}
                </span>
                <span
                  className={
                    p.published ? "text-accent" : "text-tx3"
                  }
                >
                  {p.published ? "공개" : "비공개"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
