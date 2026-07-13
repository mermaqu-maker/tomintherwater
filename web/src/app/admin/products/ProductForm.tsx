"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProduct, type ProductInput } from "./actions";
import { GROUPS, PRICE_KINDS, type PriceKind } from "@/lib/course-meta";

const field =
  "w-full bg-bg2 border border-line text-tx text-sm px-3.5 py-2.5 font-[300] placeholder:text-tx3 focus:outline-none focus:border-line2";
const lbl = "block text-[11px] tracking-[0.14em] uppercase text-tx3 mb-2";

export default function ProductForm({
  productId,
  initial,
}: {
  productId: string;
  initial: ProductInput;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState<ProductInput>(initial);
  const [featText, setFeatText] = useState(initial.features.join("\n"));

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const showPrice = f.price_kind === "fixed" || f.price_kind === "from";

  function submit() {
    setError(null);
    setSaved(false);
    const features = featText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    start(async () => {
      const r = await updateProduct(productId, { ...f, features });
      if (!r.ok) return setError(r.error ?? "오류");
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className={lbl}>상품명</label>
        <input className={field} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="예: PREMIUM COURSE" />
      </div>
      <div className="md:col-span-2">
        <label className={lbl}>부제 (한 줄 설명)</label>
        <input className={field} value={f.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="예: 환상적인 드레스, 고난도의 연출" />
      </div>

      <div>
        <label className={lbl}>그룹</label>
        <div className="flex gap-2 flex-wrap">
          {GROUPS.map((g) => (
            <Chip key={g.key} on={f.group_key === g.key} onClick={() => set("group_key", g.key)}>{g.label}</Chip>
          ))}
        </div>
      </div>
      <div>
        <label className={lbl}>가격 유형</label>
        <div className="flex gap-2 flex-wrap">
          {PRICE_KINDS.map((k) => (
            <Chip key={k.key} on={f.price_kind === k.key} onClick={() => set("price_kind", k.key as PriceKind)}>{k.label}</Chip>
          ))}
        </div>
      </div>

      {showPrice && (
        <div>
          <label className={lbl}>가격 (원)</label>
          <input
            type="number"
            className={`${field} [color-scheme:dark]`}
            value={f.price_amount ?? ""}
            onChange={(e) => set("price_amount", e.target.value ? Number(e.target.value) : null)}
            placeholder="250000"
          />
        </div>
      )}
      <div className={showPrice ? "" : "md:col-span-2"}>
        <label className={lbl}>가격 비고 (선택)</label>
        <input className={field} value={f.price_note ?? ""} onChange={(e) => set("price_note", e.target.value)} placeholder="예: 3인 진행 · 1인 기준" />
      </div>

      <div className="md:col-span-2">
        <label className={lbl}>포함 사항 (한 줄에 하나씩)</label>
        <textarea className={field} rows={5} value={featText} onChange={(e) => setFeatText(e.target.value)} placeholder={"수영복 / 슈트 / 머메이드 테일\n1인 · 2인(커플·우정)\n헬퍼 옵션 +5만 원"} />
      </div>

      <div className="md:col-span-2">
        <label className={lbl}>공개 여부</label>
        <div className="flex gap-2">
          <Chip on={f.is_active} onClick={() => set("is_active", true)}>공개</Chip>
          <Chip on={!f.is_active} onClick={() => set("is_active", false)}>비공개</Chip>
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
