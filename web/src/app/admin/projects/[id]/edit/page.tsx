import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProjectForm from "../../ProjectForm";
import ProjectImagesManager, {
  type ManagedImage,
} from "../../ProjectImagesManager";
import { deleteProject } from "../../actions";

export const metadata = { title: "프로젝트 편집" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: p } = await supabase
    .from("projects")
    .select(
      "id,slug,title,category,types,shot_date,caption,location,collaborators,gear,published",
    )
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const { data: imgs } = await supabase
    .from("project_images")
    .select("id,path,width,height,is_cover")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  const del = deleteProject.bind(null, id);

  return (
    <div className="max-w-[1000px] mx-auto px-8 pt-[120px] pb-[140px]">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/projects"
          className="text-tx3 text-xs uppercase tracking-[0.16em] hover:text-tx"
        >
          ← 프로젝트 관리
        </Link>
        {p.published && (
          <Link
            href={`/gallery/${p.slug}`}
            className="text-tx3 text-xs uppercase tracking-[0.16em] hover:text-accent"
          >
            갤러리에서 보기 →
          </Link>
        )}
      </div>
      <h1 className="font-en font-semibold text-[32px] tracking-[-0.02em] mt-3 mb-8">
        {p.title}
      </h1>

      <ProjectForm
        projectId={id}
        initial={{
          title: p.title,
          category: p.category,
          types: p.types ?? [],
          shot_date: p.shot_date,
          caption: p.caption,
          location: p.location,
          collaborators: p.collaborators,
          gear: p.gear,
          published: p.published,
        }}
      />

      <div className="mt-12 pt-8 border-t border-line">
        <ProjectImagesManager
          projectId={id}
          images={(imgs ?? []) as ManagedImage[]}
        />
      </div>

      <div className="mt-16 pt-8 border-t border-line flex justify-end">
        <form action={del}>
          <button
            type="submit"
            className="text-[11px] tracking-[0.2em] uppercase text-red-400 border border-red-400/40 px-6 py-3 hover:bg-red-400/10 cursor-pointer"
          >
            프로젝트 삭제
          </button>
        </form>
      </div>
    </div>
  );
}
