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

// 코스 카드와 동일한 표기(₩ 접미). 숫자는 ko-KR 콤마.
export function priceAmount(price: number): string {
  return price.toLocaleString("ko-KR");
}

// 색명 → 스와치 hex. 등록 색상은 자유 텍스트라, 알려진 색만 점으로 표시.
export const COLOR_HEX: Record<string, string> = {
  화이트: "#f1f0ec",
  블랙: "#1c1c1e",
  퍼플: "#7c5cbf",
  핑크: "#e58fb5",
  블루: "#4f83c4",
  옐로우: "#e6c34a",
  레드: "#c34a44",
  그린: "#4a9d6e",
  오렌지: "#e08a3c",
  실버: "#c8ccd0",
  골드: "#c9a24a",
  네이비: "#2f3d63",
  민트: "#7fcbb4",
  라벤더: "#b6a4d8",
  아쿠아: "#6fc4d4",
};
const COLOR_ORDER = Object.keys(COLOR_HEX);

/** 색명(또는 #hex)에 대응하는 배경색. 미상이면 undefined. */
export function colorSwatch(name: string): string | undefined {
  if (/^#/.test(name)) return name;
  return COLOR_HEX[name];
}

/** 색상 목록을 알려진 순서 우선으로 정렬(미상은 뒤). */
export function sortColors(colors: string[]): string[] {
  return [...colors].sort((a, b) => {
    const ia = COLOR_ORDER.indexOf(a);
    const ib = COLOR_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}
