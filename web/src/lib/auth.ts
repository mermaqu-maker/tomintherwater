import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

// 로그인 + admins 등재된 사용자만 반환. 아니면 null.
// cache(): 한 요청 안에서 레이아웃(AdminBar)·페이지가 각각 불러도 실제 조회는 1번.
export const getAdmin = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? user : null;
});

export async function requireAdmin(): Promise<User> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
