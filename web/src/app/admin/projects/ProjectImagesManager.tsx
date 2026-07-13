"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mediaUrl } from "@/lib/media";
import {
  addProjectImage,
  removeProjectImage,
  setCover,
  reorderImages,
} from "./actions";

export type ManagedImage = {
  id: string;
  path: string;
  width: number;
  height: number;
  is_cover: boolean;
};

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ProjectImagesManager({
  projectId,
  images,
}: {
  projectId: string;
  images: ManagedImage[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_BYTES = 30 * 1024 * 1024; // 30MB (사진용)
  const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    try {
      for (const file of Array.from(files)) {
        if (!OK_TYPES.includes(file.type)) {
          setError(`${file.name}: 이미지 형식만 업로드할 수 있습니다 (jpg/png/webp/avif/gif).`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          setError(
            `${file.name}: ${(file.size / 1024 / 1024).toFixed(1)}MB — 최대 30MB까지 업로드할 수 있습니다.`,
          );
          continue;
        }
        const { width, height } = await readDimensions(file);
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `projects/${projectId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        await addProjectImage(projectId, { path, width, height, alt: "" });
      }
      router.refresh();
    } catch {
      setError("업로드에 실패했습니다. (권한/파일 확인)");
    } finally {
      setUploading(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= images.length) return;
    const ids = images.map((i) => i.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    start(async () => {
      await reorderImages(projectId, ids);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-[11px] tracking-[0.14em] uppercase text-tx3">
          이미지 ({images.length}) · 첫 이미지가 대표(★)
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

      {images.length === 0 ? (
        <p className="text-tx3 text-sm py-8 text-center border border-dashed border-line2">
          아직 이미지가 없습니다. 업로드하세요.
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={img.id} className="relative border border-line group">
              <div className="relative w-full aspect-square bg-bg2">
                <Image
                  src={mediaUrl(img.path)}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {img.is_cover && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] bg-accent text-bg px-1.5 py-0.5">
                    ★ 대표
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between px-1.5 py-1 text-[11px] text-tx2">
                <span className="flex gap-1.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={pending} className="hover:text-tx disabled:opacity-30">
                    ↑
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={pending} className="hover:text-tx disabled:opacity-30">
                    ↓
                  </button>
                </span>
                <span className="flex gap-2">
                  {!img.is_cover && (
                    <button
                      type="button"
                      onClick={() =>
                        start(async () => {
                          await setCover(projectId, img.id);
                          router.refresh();
                        })
                      }
                      className="hover:text-accent"
                    >
                      대표
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      start(async () => {
                        await removeProjectImage(img.id, projectId);
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
