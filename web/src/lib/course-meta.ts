// 클라이언트/서버 공용 상수 (서버 전용 import 없음)
export type CourseGroup = "essential" | "special" | "group";
export type PriceKind = "fixed" | "from" | "inquire" | "coming";

export const GROUPS: { key: CourseGroup; label: string; caption: string }[] = [
  { key: "essential", label: "Essential", caption: "기본 촬영" },
  { key: "special", label: "Special", caption: "특별 촬영" },
  { key: "group", label: "Group & Commercial", caption: "그룹 · 이벤트 · 상업" },
];

export const PRICE_KINDS: { key: PriceKind; label: string }[] = [
  { key: "fixed", label: "단일가" },
  { key: "from", label: "범위 (from)" },
  { key: "inquire", label: "문의" },
  { key: "coming", label: "준비 중" },
];
