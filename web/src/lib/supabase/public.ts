import { createClient } from "@supabase/supabase-js";

// 인증/쿠키 불필요한 공개 읽기용 (sitemap 등 정적 컨텍스트). RLS public read 적용.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
