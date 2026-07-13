"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

type Result = { ok: boolean; error?: string };

// TODO(M4): Cloudflare Turnstile 캡차 검증을 각 액션 진입부에 추가
// (service_role RPC 는 서버에서만 호출되므로 API 직접 우회는 이미 차단됨)

export async function addComment(input: {
  projectId: string;
  slug: string;
  nickname: string;
  password: string;
  body: string;
}): Promise<Result> {
  const nickname = input.nickname.trim();
  const body = input.body.trim();
  if (!nickname || !input.password || !body)
    return { ok: false, error: "닉네임·비밀번호·내용을 모두 입력하세요." };
  if (input.password.length < 4)
    return { ok: false, error: "비밀번호는 4자 이상이어야 합니다." };

  const admin = createAdminClient();
  const { error } = await admin.rpc("add_project_comment", {
    p_project_id: input.projectId,
    p_nickname: nickname,
    p_password: input.password,
    p_body: body,
  });
  if (error) return { ok: false, error: "등록에 실패했습니다." };

  revalidatePath(`/gallery/${input.slug}`);
  return { ok: true };
}

export async function editComment(input: {
  commentId: string;
  slug: string;
  password: string;
  body: string;
}): Promise<Result> {
  const body = input.body.trim();
  if (!body) return { ok: false, error: "내용을 입력하세요." };

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("update_project_comment", {
    p_comment_id: input.commentId,
    p_password: input.password,
    p_body: body,
  });
  if (error) return { ok: false, error: "수정에 실패했습니다." };
  if (data !== true) return { ok: false, error: "비밀번호가 일치하지 않습니다." };

  revalidatePath(`/gallery/${input.slug}`);
  return { ok: true };
}

// 관리자 모더레이션 — 비밀번호 없이 삭제 (RLS is_admin 정책으로 허용)
export async function adminDeleteComment(
  commentId: string,
  slug: string,
): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_comments")
    .delete()
    .eq("id", commentId);
  if (error) return { ok: false, error: "삭제에 실패했습니다." };
  revalidatePath(`/gallery/${slug}`);
  return { ok: true };
}

export async function deleteComment(input: {
  commentId: string;
  slug: string;
  password: string;
}): Promise<Result> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("delete_project_comment", {
    p_comment_id: input.commentId,
    p_password: input.password,
  });
  if (error) return { ok: false, error: "삭제에 실패했습니다." };
  if (data !== true) return { ok: false, error: "비밀번호가 일치하지 않습니다." };

  revalidatePath(`/gallery/${input.slug}`);
  return { ok: true };
}
