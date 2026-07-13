"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mediaUrl } from "@/lib/media";
import {
  setProductCover,
  removeProductCover,
  addProductExample,
  setProductExamples,
  removeProductExample,
} from "./actions";

const MAX_BYTES = 30 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

async function upload(productId: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return path;
}

function validate(file: File): string | null {
  if (!OK_TYPES.includes(file.type)) return "이미지 형식만 업로드할 수 있습니다.";
  if (file.size > MAX_BYTES) return "최대 30MB까지 업로드할 수 있습니다.";
  return null;
}

export default function ProductImages({
  productId,
  cover,
  examples,
}: {
  productId: string;
  cover: string | null;
  examples: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCover(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const v = validate(file);
    if (v) return setError(file.name + ": " + v);
    setError(null);
    setBusy(true);
    try {
      const path = await upload(productId, file);
      await setProductCover(productId, path);
      router.refresh();
    } catch {
      setError("업로드에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function onExamples(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const v = validate(file);
        if (v) {
          setError(file.name + ": " + v);
          continue;
        }
        const path = await upload(productId, file);
        await addProductExample(productId, path);
      }
      router.refresh();
    } catch {
      setError("업로드에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function moveEx(i: number, dir: -1 | 1) {
    const next = i + dir;
    if (next < 0 || next >= examples.length) return;
    const arr = [...examples];
    [arr[i], arr[next]] = [arr[next], arr[i]];
    start(async () => {
      await setProductExamples(productId, arr);
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      {error && <p className="text-[13px] text-red-400">{error}</p>}

      {/* 대표 이미지 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-[11px] tracking-[0.14em] uppercase text-tx3">대표 이미지</label>
          <label className="btn-line cursor-pointer">
            {busy ? "처리 중…" : cover ? "교체" : "＋ 업로드"}
            <input type="file" accept="image/*" hidden disabled={busy} onChange={(e) => onCover(e.target.files)} />
          </label>
        </div>
        {cover ? (
          <div className="relative w-full max-w-[360px] aspect-[16/10] border border-line">
            <Image src={mediaUrl(cover)} alt="" fill sizes="360px" className="object-cover" />
            <button
              type="button"
              disabled={pending}
              onClick={() => start(async () => { await removeProductCover(productId); router.refresh(); })}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-[rgba(6,8,9,0.7)] border border-line2 text-tx2 hover:text-red-400 hover:border-red-400"
            >
              ✕
            </button>
          </div>
        ) : (
          <p className="text-tx3 text-sm py-6 text-center border border-dashed border-line2">대표 이미지가 없습니다.</p>
        )}
      </div>

      {/* 촬영 예시 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-[11px] tracking-[0.14em] uppercase text-tx3">
            촬영 예시 ({examples.length}) · 라이트박스 노출
          </label>
          <label className="btn-line cursor-pointer">
            {busy ? "처리 중…" : "＋ 이미지 업로드"}
            <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => onExamples(e.target.files)} />
          </label>
        </div>
        {examples.length === 0 ? (
          <p className="text-tx3 text-sm py-8 text-center border border-dashed border-line2">예시 이미지가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {examples.map((path, i) => (
              <div key={path} className="relative border border-line">
                <div className="relative w-full aspect-square bg-bg2">
                  <Image src={mediaUrl(path)} alt="" fill sizes="200px" className="object-cover" />
                </div>
                <div className="flex items-center justify-between px-1.5 py-1 text-[11px] text-tx2">
                  <span className="flex gap-1.5">
                    <button type="button" onClick={() => moveEx(i, -1)} disabled={pending} className="hover:text-tx disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => moveEx(i, 1)} disabled={pending} className="hover:text-tx disabled:opacity-30">↓</button>
                  </span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => start(async () => { await removeProductExample(productId, path); router.refresh(); })}
                    className="hover:text-red-400"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
