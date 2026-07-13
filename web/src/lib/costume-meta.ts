// 클라이언트/서버 공용 상수·라벨 (서버 전용 import 없음 — 클라이언트 컴포넌트 안전)
export type CostumeType =
  | "swimsuit"
  | "suit"
  | "dress"
  | "skirt"
  | "mermaid_tail"
  | "concept"
  | "prop";

export const COSTUME_TYPES: { key: CostumeType; label: string }[] = [
  { key: "swimsuit", label: "수영복" },
  { key: "suit", label: "슈트" },
  { key: "dress", label: "드레스" },
  { key: "skirt", label: "치마" },
  { key: "mermaid_tail", label: "머메이드 테일" },
  { key: "concept", label: "컨셉 의상" },
  { key: "prop", label: "소품" },
];

export const COSTUME_SIZES = ["44", "55", "66", "77", "FREE"] as const;

export const COSTUME_COURSES: { key: string; label: string }[] = [
  { key: "basic", label: "BASIC" },
  { key: "premium", label: "PREMIUM" },
  { key: "blue_lagoon", label: "BLUE LAGOON" },
  { key: "signature", label: "SIGNATURE" },
  { key: "group", label: "GROUP" },
];

export function typeLabel(t: string): string {
  return COSTUME_TYPES.find((x) => x.key === t)?.label ?? t;
}
export function courseLabel(c: string): string {
  return COSTUME_COURSES.find((x) => x.key === c)?.label ?? c;
}
export function priceText(price: number): string {
  return `${(price / 10000).toString()}만 원`;
}
