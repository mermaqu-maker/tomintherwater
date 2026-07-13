import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 비밀번호 재설정/매직링크의 code 를 세션으로 교환 후 next 로 이동
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
