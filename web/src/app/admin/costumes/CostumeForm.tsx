"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCostume, type CostumeInput } from "./actions";
import {
  COSTUME_TYPES,
  COSTUME_SIZES,
  COSTUME_COURSES,
} from "@/lib/costume-meta";

const field =
  "w-full bg-bg2 border border-line text-tx text-sm px-3.5 py-2.5 font-[300] placeholder:text-tx3 focus:outline-none focus:border-line2";
const lbl = "block text-[11px] tracking-[0.14em] uppercase text-tx3 mb-2";
const PRICES = [10000, 20000, 30000, 40000, 50000];

export default function CostumeForm({
  costumeId,
  initial,
}: {
  costumeId: string;
  initial: CostumeInput;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState<CostumeInput>(initial);
  const [colorsText, setColorsText] = useState(initial.colors.join(", "));

  const set = <K extends keyof CostumeInput>(k: K, v: CostumeInput[K]) =>
    setF((p) => ({ ...p, [k]: v }));
  const toggle = (k: "sizes" | "courses", v: string) =>
    set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  function submit() {
    setError(null);
    setSaved(false);
    const colors = colorsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    start(async () => {
      const r = await updateCostume(costumeId, { ...f, colors });
      if (!r.ok) return setError(r.error ?? "오류");
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className={lbl}>이름</label>
        <input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="예: 화이트 롱 드레스" />
      </div>

      <div>
        <label className={lbl}>유형</label>
        <select className={`${field} [color-scheme:dark]`} value={f.type} onChange={(e) => set("type", e.target.value)}>
          {COSTUME_TYPES.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={lbl}>대여가</label>
        <select className={`${field} [color-scheme:dark]`} value={f.price} onChange={(e) => set("price", Number(e.target.value))}>
          {PRICES.map((p) => (
            <option key={p} value={p}>{p / 10000}만 원</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className={lbl}>사이즈 (복수)</label>
        <div className="flex gap-2 flex-wrap">
          {COSTUME_SIZES.map((s) => (
            <Chip key={s} on={f.sizes.includes(s)} onClick={() => toggle("sizes", s)}>{s}</Chip>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className={lbl}>가능 코스 (복수 · 난이도)</label>
        <div className="flex gap-2 flex-wrap">
          {COSTUME_COURSES.map((c) => (
            <Chip key={c.key} on={f.courses.includes(c.key)} onClick={() => toggle("courses", c.key)}>{c.label}</Chip>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className={lbl}>컬러 (쉼표로 구분 · 색이름 또는 #HEX)</label>
        <input className={field} value={colorsText} onChange={(e) => setColorsText(e.target.value)} placeholder="예: 화이트, #1a2b3c" />
      </div>

      <div className="md:col-span-2">
        <label className={lbl}>설명</label>
        <textarea className={field} rows={2} value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div>
        <label className={lbl}>대여 가능 여부</label>
        <div className="flex gap-2">
          <Chip on={f.is_available} onClick={() => set("is_available", true)}>대여 가능</Chip>
          <Chip on={!f.is_available} onClick={() => set("is_available", false)}>대여중</Chip>
        </div>
      </div>
      <div>
        <label className={lbl}>공개 여부</label>
        <div className="flex gap-2">
          <Chip on={f.published} onClick={() => set("published", true)}>공개</Chip>
          <Chip on={!f.published} onClick={() => set("published", false)}>비공개</Chip>
        </div>
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

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
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
