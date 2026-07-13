import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProject,
  getAdjacent,
  getRelated,
  categoryLabel,
  type ProjectComment,
} from "@/lib/project";
import { TYPES } from "@/lib/gallery";
import ProjectImages from "./ProjectImages";
import LikeButton from "./LikeButton";
import Comments from "./Comments";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  return { title: p?.title ?? "Gallery" };
}

async function getComments(projectId: string): Promise<ProjectComment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_comments")
    .select("id,nickname,body,created_at")
    .eq("project_id", projectId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [comments, adjacent, related] = await Promise.all([
    getComments(project.id),
    getAdjacent(project),
    getRelated(project),
  ]);

  const typeLabels = TYPES.filter((t) => project.types.includes(t.key));

  return (
    <section className="border-t border-line pt-[130px] pb-[120px]">
      <div className="max-w-[1180px] mx-auto px-8">
        {/* breadcrumb */}
        <div className="text-[13px] tracking-[0.16em] uppercase text-tx3 mb-10">
          <Link href="/gallery" className="hover:text-tx">
            Gallery
          </Link>{" "}
          &nbsp;/&nbsp; {categoryLabel(project.category)} &nbsp;/&nbsp;{" "}
          <span className="text-tx2">{project.title}</span>
        </div>

        {/* spotlight: 좌 이미지 / 우 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            {project.cover ? (
              <Image
                src={project.cover.url}
                alt={project.cover.alt || project.title}
                width={project.cover.width}
                height={project.cover.height}
                sizes="(max-width: 780px) 100vw, 560px"
                priority
                className="w-full h-auto"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-[linear-gradient(155deg,#08202c,#0f465b_60%,#08202c)]" />
            )}
          </div>

          <div>
            <p className="font-en text-[11px] tracking-[0.42em] uppercase text-accent mb-[18px]">
              {categoryLabel(project.category)}
              {project.shotLabel ? ` · ${project.shotLabel}` : ""}
            </p>
            <h1 className="font-en font-semibold text-[clamp(30px,3.8vw,50px)] leading-[1.04] tracking-[-0.02em]">
              {project.title}
            </h1>
            {project.caption && (
              <p className="text-tx2 text-[19px] leading-[1.6] mt-6 mb-8">
                {project.caption}
              </p>
            )}
            <div className="flex flex-col">
              {project.location && <Credit k="Location" v={project.location} />}
              {project.collaborators && <Credit k="With" v={project.collaborators} />}
              {project.gear && <Credit k="Gear" v={project.gear} />}
            </div>
            {typeLabels.length > 0 && (
              <div className="flex gap-2 mt-5">
                {typeLabels.map((t) => (
                  <span
                    key={t.key}
                    className="text-[10px] tracking-[0.14em] uppercase text-tx2 border border-line px-2.5 py-1"
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 이미지 타일 + 라이트박스 */}
        {project.images.length > 0 && (
          <div className="mt-[90px]">
            <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent mb-3">
              Images
            </p>
            <ProjectImages images={project.images} />
          </div>
        )}

        {/* prev / next */}
        {(adjacent.prev || adjacent.next) && (
          <div className="flex justify-between mt-[60px] pt-[30px] border-t border-line text-xs tracking-[0.16em] uppercase text-tx2">
            {adjacent.prev ? (
              <Link href={`/gallery/${adjacent.prev.slug}`} className="hover:text-accent">
                ← {adjacent.prev.title}
              </Link>
            ) : (
              <span />
            )}
            {adjacent.next ? (
              <Link href={`/gallery/${adjacent.next.slug}`} className="hover:text-accent">
                {adjacent.next.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}

        {/* 프로젝트 좋아요 + 댓글 */}
        <div className="mt-20 pt-11 border-t border-line">
          <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent mb-3">
            이 프로젝트
          </p>
          <div className="flex items-center gap-4">
            <LikeButton projectId={project.id} initial={project.likeCount} />
            <span className="text-[11px] tracking-[0.2em] uppercase text-tx3">
              이 프로젝트가 좋았다면
            </span>
          </div>
        </div>
        <Comments projectId={project.id} slug={project.slug} initial={comments} />

        {/* You may also like */}
        {related.length > 0 && (
          <div className="mt-[100px]">
            <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent mb-3">
              You may also like
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[22px]">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/gallery/${r.slug}`}
                  className="group relative block overflow-hidden aspect-[4/5]"
                >
                  {r.cover ? (
                    <Image
                      src={r.cover.url}
                      alt={r.title}
                      fill
                      sizes="(max-width: 780px) 50vw, 360px"
                      className="object-cover transition-transform duration-[1100ms] group-hover:scale-[1.045]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(155deg,#08202c,#0f465b_60%,#08202c)]" />
                  )}
                  <div className="absolute inset-0 flex items-end p-4 bg-[linear-gradient(180deg,transparent_45%,rgba(4,10,12,0.72))] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-en text-base font-medium">{r.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Credit({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-3.5 border-t border-line text-[13px]">
      <span className="text-tx3 text-[11px] tracking-[0.14em] uppercase">{k}</span>
      <span className="text-tx2">{v}</span>
    </div>
  );
}
