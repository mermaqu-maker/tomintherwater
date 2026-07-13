import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import ProjectForm from "../ProjectForm";

export const metadata = { title: "새 프로젝트" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <div className="max-w-[1000px] mx-auto px-8 pt-[120px] pb-[140px]">
      <Link href="/admin/projects" className="text-tx3 text-xs uppercase tracking-[0.16em] hover:text-tx">
        ← 프로젝트 관리
      </Link>
      <h1 className="font-en font-semibold text-[32px] tracking-[-0.02em] mt-3 mb-8">
        새 프로젝트
      </h1>
      <p className="text-tx3 text-sm mb-6">
        기본 정보를 저장하면 편집 화면에서 이미지를 추가할 수 있습니다. (생성 시 ‘비공개’로 시작)
      </p>
      <ProjectForm mode="new" />
    </div>
  );
}
