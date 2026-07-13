-- ============================================================
-- 0003_seed_products — Course 상품 5종 시드 (docs/01 §2.5)
-- 적용 상태: 프로덕션 DB 반영 완료 (service_role upsert, 2026-07-14)
-- slug 충돌 시 갱신 (idempotent). 이미지(cover/example)는 관리자가 추후 업로드.
-- ============================================================
insert into public.products
  (slug, group_key, title, subtitle, features, price_kind, price_amount, price_note, sort_order)
values
  ('basic', 'essential', 'BASIC COURSE', '깔끔하고 직관적인 수중 프로필',
   array['수영복 / 슈트 / 머메이드 테일','1인 · 2인(커플·우정)','의상 개인 준비 (슈트·테일 대여 가능, 유료)','헬퍼 옵션 +5만 원','포프라자 / 딥스테이션 / MS다이빙풀 중 택일'],
   'fixed', 250000, null, 1),
  ('premium', 'essential', 'PREMIUM COURSE', '환상적인 드레스, 고난도의 연출',
   array['드레스 / 셔츠 / 코스프레','1인 · 2인(커플·우정)','의상 개인 준비 (대여 가능, 유료)','안전·완벽 촬영 헬퍼 기본 포함','포프라자 / 딥스테이션 / MS다이빙풀 중 택일'],
   'fixed', 350000, null, 2),
  ('blue-lagoon', 'special', 'BLUE LAGOON HALL', '여름 한정! 웨이브파크 블루라군홀 촬영',
   array['야외 수중 환경 · 2인 / 3인 전용','의상 개인 준비 (수영복·슈트·머메이드)','의상 대여 가능 (유료)'],
   'from', 100000, '2인 진행 1인 15만 원 · 3인 진행 1인 10만 원', 3),
  ('signature-moonshore', 'special', 'SIGNATURE with MOONSHORE', '언더워터웨어 브랜드 MOONSHORE 협업 컨셉',
   array['언더워터웨어 브랜드 MOONSHORE 협업','테마별 전용 의상·소품·세팅 제공'],
   'coming', null, '준비 중 · COMING SOON', 4),
  ('group-commercial', 'group', 'GROUP · EVENT & COMMERCIAL', '단체 · 행사 · 상업 촬영',
   array['단체(3인 이상) / 행사 / 상업 촬영','@tom_freedive 계정으로 별도 문의'],
   'inquire', null, '별도 문의', 5)
on conflict (slug) do update set
  group_key    = excluded.group_key,
  title        = excluded.title,
  subtitle     = excluded.subtitle,
  features     = excluded.features,
  price_kind   = excluded.price_kind,
  price_amount = excluded.price_amount,
  price_note   = excluded.price_note,
  sort_order   = excluded.sort_order;
