"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mediaUrl } from "@/lib/media";
import { addCostumeImage, removeCostumeImage, setCostumeImages } from "./actions";

const MAX_BYTES = 30 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export default function CostumeImages({
  costumeId,
  paths,
}: {
  costumeId: string;
  paths: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    try {
      for (const file of Array.from(files)) {
        if (!OK_TYPES.includes(file.type)) {
          setError(`${file.name}: 이미지 형식만 업로드할 수 있습니다.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          setError(`${file.name}: 최대 30MB까지 업로드할 수 있습니다.`);
          continue;
        }
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `costumes/${costumeId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        await addCostumeImage(costumeId, path);
      }
      router.refresh();
    } catch {
      setError("업로드에 실패했습니다. (권한/파일 확인)");
    } finally {
      setUploading(false);
    }
  }

  function move(i: number, dir: -1 | 1) {
    const next = i + dir;
    if (next < 0 || next >= paths.length) return;
    const arr = [...paths];
    [arr[i], arr[next]] = [arr[next], arr[i]];
    start(async () => {
      await setCostumeImages(costumeId, arr);
      router.refresh();
    });
  }
  function makeCover(i: number) {
    const arr = [...paths];
    const [p] = arr.splice(i, 1);
    arr.unshift(p);
    start(async () => {
      await setCostumeImages(costumeId, arr);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-[11px] tracking-[0.14em] uppercase text-tx3">
          이미지 ({paths.length}) · 첫 이미지가 대표(★)
        </label>
        <label className="btn-line cursor-pointer">
          {uploading ? "업로드 중…" : "＋ 이미지 업로드"}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={uploading}
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      </div>
      {error && <p className="text-[13px] text-red-400 mb-3">{error}</p>}

      {paths.length === 0 ? (
        <p className="text-tx3 text-sm py-8 text-center border border-dashed border-line2">
          아직 이미지가 없습니다. 업로드하세요.
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {paths.map((path, i) => (
            <div key={path} className="relative border border-line">
              <div className="relative w-full aspect-[3/4] bg-bg2">
                <Image src={mediaUrl(path)} alt="" fill sizes="200px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] bg-accent text-bg px-1.5 py-0.5">
                    ★ 대표
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between px-1.5 py-1 text-[11px] text-tx2">
                <span className="flex gap-1.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={pending} className="hover:text-tx disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={pending} className="hover:text-tx disabled:opacity-30">↓</button>
                </span>
                <span className="flex gap-2">
                  {i !== 0 && (
                    <button type="button" onClick={() => makeCover(i)} disabled={pending} className="hover:text-accent">대표</button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await removeCostumeImage(costumeId, path);
                        router.refresh();
                      })
                    }
                    className="hover:text-red-400"
                  >
                    삭제
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
