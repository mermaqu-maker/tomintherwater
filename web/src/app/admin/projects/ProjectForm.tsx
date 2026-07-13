"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProject, type ProjectInput } from "./actions";

const field =
  "w-full bg-bg2 border border-line text-tx text-sm px-3.5 py-2.5 font-[300] placeholder:text-tx3 focus:outline-none focus:border-line2";
const lbl = "block text-[11px] tracking-[0.14em] uppercase text-tx3 mb-2";

const ALL_TYPES = [
  { key: "editorial", label: "Editorial" },
  { key: "event", label: "Event" },
  { key: "commercial", label: "Commercial" },
] as const;

type Props = {
  projectId: string;
  initial?: Partial<ProjectInput>;
};

export default function ProjectForm({ projectId, initial }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState<ProjectInput>({
    title: initial?.title ?? "",
    category: initial?.category ?? "in_water",
    types: initial?.types ?? [],
    shot_date: initial?.shot_date ?? null,
    caption: initial?.caption ?? null,
    location: initial?.location ?? null,
    collaborators: initial?.collaborators ?? null,
    gear: initial?.gear ?? null,
    published: initial?.published ?? false,
  });

  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  function toggleType(t: string) {
    set(
      "types",
      f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t],
    );
  }

  function submit() {
    setError(null);
    setSaved(false);
    start(async () => {
      const r = await updateProject(projectId, f);
      if (!r.ok) return setError(r.error ?? "오류");
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className={lbl}>제목</label>
        <input
          className={field}
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="예: Temptation of Siren"
        />
      </div>

      <div>
        <label className={lbl}>카테고리</label>
        <div className="flex gap-2">
          {(["in_water", "on_water"] as const).map((c) => (
            <Chip key={c} on={f.category === c} onClick={() => set("category", c)}>
              {c === "in_water" ? "In the Water" : "On the Water"}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <label className={lbl}>촬영 일시</label>
        <input
          type="date"
          className={`${field} [color-scheme:dark]`}
          value={f.shot_date ?? ""}
          onChange={(e) => set("shot_date", e.target.value || null)}
        />
      </div>

      <div className="md:col-span-2">
        <label className={lbl}>성격 (복수 · 필터 기준)</label>
        <div className="flex gap-2">
          {ALL_TYPES.map((t) => (
            <Chip key={t.key} on={f.types.includes(t.key)} onClick={() => toggleType(t.key)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className={lbl}>캡션 (서정적 한 줄)</label>
        <input className={field} value={f.caption ?? ""} onChange={(e) => set("caption", e.target.value)} />
      </div>

      <div>
        <label className={lbl}>장소 (PLACE 필터 · 기존값과 표기 통일)</label>
        <input className={field} value={f.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="예: MS 다이빙풀" />
      </div>
      <div>
        <label className={lbl}>협업자</label>
        <input className={field} value={f.collaborators ?? ""} onChange={(e) => set("collaborators", e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <label className={lbl}>장비</label>
        <input className={field} value={f.gear ?? ""} onChange={(e) => set("gear", e.target.value)} />
      </div>

      <div className="md:col-span-2">
        <label className={lbl}>공개 여부</label>
        <div className="flex gap-2">
          <Chip on={f.published} onClick={() => set("published", true)}>공개</Chip>
          <Chip on={!f.published} onClick={() => set("published", false)}>비공개</Chip>
        </div>
        <p className="text-[12px] text-tx3 mt-2">
          공개로 두고 저장하면 갤러리에 바로 노출됩니다. 사진을 먼저 올리고 공개로 바꿔도 됩니다.
        </p>
      </div>

      {error && <p className="md:col-span-2 text-[13px] text-red-400">{error}</p>}
      {saved && <p className="md:col-span-2 text-[13px] text-accent">저장되었습니다.</p>}

      <div className="md:col-span-2 flex justify-end">
        <button type="button" onClick={submit} disabled={pending} className="cta-solid disabled:opacity-50">
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 border transition-colors ${
        on ? "bg-tx text-bg border-tx" : "text-tx2 border-line hover:border-line2"
      }`}
    >
      {children}
    </button>
  );
}
