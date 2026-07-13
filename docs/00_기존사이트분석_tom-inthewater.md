# Tom in the Water — 기존 웹사이트 분석 리포트

> 대상: https://tom-inthewater.com (수중 사진작가 ToM)
> 조사 방법: WebFetch(메인·서브페이지) + 원본 HTML/HTTP 헤더 직접 파싱
> 조사일 기준: 2026-07-10

---

## 0. 요약 (TL;DR)

- **Adobe Portfolio(myportfolio.com)** 로 제작된 다크 테마 포트폴리오 사이트. 커스텀 개발이 아닌 빌더 기반.
- 구조는 매우 단순: **4개 카테고리(In/On the Water, Event, Commercial) + About + Contact**, 각 카테고리는 프로젝트 썸네일 그리드, 클릭 시 이미지 나열형 상세 페이지.
- 강점: 이미지 몰입도, 시적인 한 줄 카피, 일관된 미니멀 다크 무드. 약점: 얕은 정보구조, 상업 의뢰(Commercial) 동선·CTA 부재, 프로젝트 설명·크레딧 빈약, 다국어 비일관, SEO/접근성 약함.

---

## 1. 사이트 구조 / IA

### 전역 내비게이션 (헤더, 상하단 2회 반복)
| 라벨 | URL | 성격 |
|---|---|---|
| In the Water | `/work` | 수중 촬영 포트폴리오 (메인 카테고리) |
| On the Water | `/on-the-water` | 수면/스튜디오/표면 촬영 |
| Event | `/event` | 이벤트 촬영 |
| Commercial | `/commercial` | 상업/광고 의뢰 작업 |
| ABOUT | `/about` | 작가 소개 |
| Contact | `/contact` | 문의 폼 |

- `nav-social` 클래스 존재 → 헤더에 소셜 아이콘 영역 있음(Instagram 등).
- 홈(`/`)은 사실상 **In the Water 갤러리와 동일한 프로젝트 그리드** + 메인 카피를 노출하는 랜딩.

### URL 패턴
- **플랫**한 구조. 카테고리별 하위 경로 없이 프로젝트가 전부 루트 슬러그로 존재:
  `/pass-nine-2025`, `/cebu-2025`, `/singles`, `/k26-mermaid-2026`, `/miyako-jima-2025`, `/temptation-of-siren-2026`, `/fuzhou-2025`, `/lalah-2024`, `/pelican-by-zea`, `/bestdive-with-winnie` 등.
- 슬러그 = `장소/제목 + 연도` 케밥케이스. Adobe Portfolio 기본 방식.
- 계층(breadcrumb)이 URL에 없어 프로젝트가 어느 카테고리 소속인지 URL만으로는 알 수 없음.

### IA 깊이
- **2단 구조**: 카테고리 그리드 → 프로젝트 상세. 그 이상 depth 없음. 태그·필터·검색 없음.

---

## 2. 기능 / 동작

- **갤러리 방식**: 카테고리 페이지 = 프로젝트 **썸네일 그리드**(16:9 등 landscape 비율, 반응형 `rwc/carw` 사이징). 프로젝트 상세 = 이미지 **세로 나열/그리드**(프로젝트당 약 10~12장).
- **라이트박스/필터**: 카테고리 내 필터·태그·정렬 **없음**. 라이트박스 여부는 JS 렌더라 정적 분석 한계 있으나, Adobe Portfolio 기본 클릭 확대 정도로 추정.
- **관련 콘텐츠**: 상세 페이지 하단에 **"You may also like"** 6개 관련 프로젝트 추천. 명시적 이전/다음(prev/next) 버튼은 마크업에 없음.
- **문의 폼** (`/contact`): 실제 3필드 폼 확인됨.
  - `field1` = Your Name… (text, required)
  - `email` = Your Email Address… (email 검증, required)
  - `field2` = Your Message… (textarea, required)
  - 제출 후 "Thank you!" 확인 메시지. **예약/의뢰 유형 선택·일정·예산·촬영종류 필드 없음** — 순수 자유 문의 폼.
- **게시판/블로그**: 없음.
- **다국어**: 언어 스위처 **없음**. `lang="en-US"`로 선언. 실제로는 **영어 UI + 한국어 카피 혼재**(About 소개문·프로젝트 캡션이 한국어). 일관된 i18n 아님.
- **반응형**: `viewport` 메타 존재 + 반응형 이미지 파라미터 사용 → 반응형 O (Adobe Portfolio 기본 제공).
- **특이 기능**: 홈 배경에 `page-background-video` 클래스 → **배경 영상** 사용 가능성. 그 외 특이 기능 없음.

---

## 3. 디자인 언어

- **무드/톤**: 다크·시네마틱·명상적. "물 속에서 만나는 또 다른 나"라는 존재론적/서정적 콘셉트. 이미지가 주인공, 텍스트는 최소.
- **컬러 팔레트**:
  - 배경/베이스: **`#1E1E1E`** (원본 HTML에서 직접 확인된 유일한 컬러값) — 딥 차콜/니어블랙.
  - 텍스트: 다크 배경 위 밝은 회백색(추정 `#EDEDED`~`#FFFFFF`).
  - 강조색 거의 없음 — 색은 **수중 사진 이미지 자체(블루·틸·시안)**가 담당. UI는 무채색.
- **타이포그래피**: **Adobe Typekit(use.typekit.net)** 로드 → Adobe Fonts 사용. 정확한 폰트명은 난독화된 kit ID라 미확정. 위계는 얕음: 큰 프로젝트/섹션 타이틀(`gallery-title`) + 소형 캡션(연도). 본문 카피 자체가 적어 타이포 위계보다 이미지 위계에 의존.
- **레이아웃**: 넓은 여백 + 풀블리드에 가까운 이미지 그리드. 미니멀. 상/하단에 동일 내비 반복(sticky/placeholder 헤더 구조: `header-placeholder`).
- **여백감**: 넉넉함. 갤러리 카드 사이 간격 여유, 텍스트 밀도 낮음 → 갤러리 느낌.
- **이미지 사용**: 전면 주도형. 랜드스케이프 썸네일, 상세는 대형 이미지 연속. CDN(myportfolio.com) 반응형 서빙.
- **애니메이션/모션**: `main.js` 기반의 Adobe Portfolio 기본 인터랙션(호버 확대·스크롤 페이드 추정) + 홈 배경 영상. 과한 모션은 없음.

---

## 4. 콘텐츠

### 카테고리별 프로젝트
- **In the Water** (`/work`, 8개): pass nine 2025 · Cebu 2025 · singles · K26 Mermaid 2026 · Miyako-Jima 2025 · Temptation of Siren 2026 · Fuzhou 2025 · Lalah 2024
- **On the Water** (4개): Studio Concept 2 (2026) · Uljin 2025 · West Sea 2025 · Studio Concept 1 — with ZIEZIE, AQU (2025)
- **Event** (1개): Mermaid Tail Event with AQU, 2026
- **Commercial** (2개): Pelican by ZEA (`/pelican-by-zea`, 2026) · Trudive with Winnie (`/bestdive-with-winnie`, 2026)

### 카피 톤
- **시적·존재론적**. 메인: *"A journey underwater to meet another Me."* / About(KR): *"물이라는 다른 차원에서 만나는 또 다른 나. 그 여정을 기록합니다."*
- 프로젝트 캡션은 짧고 극적: 예) Temptation of Siren — *"절망 끝에서 만나는 유혹은 곧 지옥이다."* (사이렌·신화 모티프, 어두운 정서)
- 일부 프로젝트(Cebu 등)는 설명 캡션 **없음** → 순수 비주얼.

### About
- 매우 짧음. 작가명 **ToM**, 정체성 = 수중 포토그래퍼. 한 줄 콘셉트 문장 위주. **약력·수상·클라이언트·장비·경력 정보 없음.**
- 연락 수단: Instagram **@tom_freedive** (https://www.instagram.com/tom_freedive/), **KakaoTalk 오픈채팅** (https://open.kakao.com/o/sGkBEsig).

### 연락/예약 동선
- `/contact` 자유 문의 폼(3필드) + About의 Instagram DM / 카톡 오픈채팅.
- **가격·패키지·예약 캘린더·의뢰 프로세스 안내 전무.** 상업 의뢰를 받기 위한 구조적 동선(브리프 폼, 서비스 소개, 요금)이 없음.

---

## 5. 강점과 약점

### 강점
- **몰입감 있는 비주얼 우선 설계** — 다크 배경(#1E1E1E)이 수중 이미지의 블루톤을 돋보이게 함. 갤러리로서 효과적.
- **일관된 아트 디렉션과 서정적 브랜드 보이스** — 한 줄 콘셉트 카피가 작가 정체성을 명확히 전달.
- **간결한 내비게이션** — 6개 항목, 학습비용 낮음.
- **반응형 + CDN 이미지 최적화**(빌더 기본 제공).
- 상업/이벤트/수중을 카테고리로 분리해 작업 유형을 구분한 시도.

### 약점 / 개선점
- **정보구조가 얕고 평평함**: 프로젝트 URL이 카테고리 계층과 분리, breadcrumb·필터·검색 없음. 작업이 늘면 탐색성 저하.
- **CTA·전환 동선 부재**: Commercial 페이지에 "의뢰하기/견적 문의" CTA가 없음. 사이트가 "감상"에서 끝나고 "일 맡기기"로 이어지지 않음.
- **About 빈약**: 경력·클라이언트·수상·장비·촬영 가능 범위 등 신뢰 요소가 없어 상업 고객 설득력 약함.
- **다국어 비일관**: `lang=en`인데 핵심 카피가 한국어. 국내/해외 타깃 모두에게 어중간. 명시적 KR/EN 스위처 필요.
- **문의 폼이 너무 단순**: 촬영 종류·희망일·장소·예산 필드가 없어 리드 품질↓, 왕복 커뮤니케이션↑.
- **SEO 약함**: 프로젝트별 설명 텍스트 부족, 메타 최소, 빌더 종속으로 커스텀 스키마/구조화데이터 어려움.
- **접근성**: 다크 배경 대비는 양호하나, 이미지 대체텍스트·폼 라벨(placeholder만 있고 `<label>` 부재로 추정)·키보드 포커스는 빌더 기본 수준 — WCAG 관점 보강 여지.
- **프로젝트 캡션 편차**: 어떤 건 극적인 카피, 어떤 건 무캡션 — 크레딧(협업자·장소·장비) 표준 포맷 부재.
- **빌더 종속 리스크**: Adobe Portfolio는 커스텀 기능(예약, 결제, DB 연동, 권한별 관리) 확장 불가.

---

## 6. 기술 스택 (추정 → 확정)

| 항목 | 결과 | 근거 |
|---|---|---|
| 사이트 빌더 | **Adobe Portfolio (myportfolio.com)** — 확정 | 메타태그 `Adobe Portfolio` generator, 이미지 CDN `*.myportfolio.com`, `/dist/js/main.js` 번들 |
| 폰트 | **Adobe Fonts / Typekit** | `//use.typekit.net/ik/…js` 로드 |
| CDN/캐시 | **Fastly (Varnish)** | HTTP 헤더 `server: Varnish`, `via: 1.1 varnish`, `x-served-by: cache-icn…`(서울 엣지) |
| 폼 처리 | Adobe Portfolio 내장 컨택트 모듈 | `field1/email/field2` + `data-validate` 속성 |
| 배경 | 배경 영상 지원 | `page-background-video` 클래스 |
| 언어 선언 | `lang="en-US"` | HTML 루트 |
| 커스텀 프레임워크 | **아님** (Wix/Squarespace도 아님) | 순수 Adobe Portfolio 마크업/클래스 체계 |

**참고:** 프로젝트 상세 페이지의 실제 이미지·라이트박스 동작·모션은 JS 런타임 렌더라 정적 fetch로는 최종 렌더 상태를 완전히 확인 불가 — 배경 영상, 스크롤 애니메이션, 라이트박스 확대 동작은 "존재 정황상 추정".

---

## 7. 신규 사이트(Tom 새 웹사이트) 관점 시사점

- **차용할 것**: 다크·시네마틱 무드, 이미지 전면 주도, 서정적 한 줄 브랜드 카피, 카테고리 기반 포트폴리오 진열.
- **반드시 개선할 것 (Tom 사이트의 공백을 기회로)**:
  1. **프로젝트 의뢰/문의 동선 신설** — 포트폴리오 하단마다 문의 CTA + 구조화된 브리프 폼(촬영종류·일정·장소·예산·레퍼런스).
  2. **신뢰 콘텐츠 강화된 About** — 경력·클라이언트 로고·수상·장비·촬영 범위.
  3. **명시적 KR/EN 다국어**(후속 가능).
  4. **필터·태그** 가능한 확장형 IA (작업량 증가 대비).
  5. **커스텀 스택(Next.js+Supabase)** 으로 관리자 권한 기반 CRUD·게시판 확보 — Adobe Portfolio로는 불가능한 영역.
