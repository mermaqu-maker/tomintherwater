"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// 좋아요 — 중복 방지 없이 자유 클릭 (docs/01 §2.4-a). RPC가 갱신된 카운트 반환.
export default function LikeButton({
  projectId,
  initial,
}: {
  projectId: string;
  initial: number;
}) {
  const [count, setCount] = useState(initial);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onLike() {
    if (busy) return;
    setBusy(true);
    setLiked(true);
    setCount((c) => c + 1); // optimistic
    const supabase = createClient();
    const { data } = await supabase.rpc("increment_project_like", {
      p_project_id: projectId,
    });
    if (typeof data === "number") setCount(data);
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={onLike}
      className={`inline-flex items-center gap-2.5 border px-[22px] py-3 text-xs tracking-[0.14em] transition-colors cursor-pointer ${
        liked
          ? "text-accent border-accent"
          : "text-tx2 border-line2 hover:text-accent hover:border-accent"
      }`}
    >
      <span>♥</span> {count}
    </button>
  );
}
