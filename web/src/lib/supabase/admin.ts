import "server-only";
import { createClient } from "@supabase/supabase-js";

// service_role 클라이언트 — 서버 전용. RLS 우회 · 후기/댓글 쓰기 RPC 호출.
// 절대 클라이언트 컴포넌트에서 import 금지 (server-only 로 강제).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
