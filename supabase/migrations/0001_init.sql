-- ============================================================
-- Tom in the Water — initial schema
-- Supabase (Postgres 15+). 기준 문서: docs/01_새사이트_기획_IA.md
-- ============================================================

-- ---------- extensions ----------
create extension if not exists pgcrypto with schema extensions; -- crypt(), gen_salt()

-- ---------- enums ----------
create type public.project_category as enum ('in_water', 'on_water');
create type public.costume_type as enum
  ('swimsuit','suit','dress','skirt','mermaid_tail','concept','prop');
create type public.course_group as enum ('essential','special','group');
create type public.price_kind as enum ('fixed','from','inquire','coming');

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- 1인 소유자지만 확장 대비 admins 테이블 + is_admin()
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ============================================================
-- projects  (갤러리 프로젝트)
-- ============================================================
create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  category     public.project_category not null,
  -- 성격 필터 기준 (EDITORIAL/EVENT/COMMERCIAL) — 관리자가 복수 지정
  types        text[] not null default '{}'
               check (types <@ array['editorial','event','commercial']::text[]),
  shot_date    date,                          -- YEAR 필터는 여기서 자동 추출
  caption      text,                          -- 서정적 한 줄
  location     text,                          -- PLACE 필터 distinct 소스 (등록 폼 자동완성)
  collaborators text,
  gear         text,
  extra_tags   text[] not null default '{}',  -- 기타 자유 태그
  like_count   integer not null default 0 check (like_count >= 0),
  published    boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

create index idx_projects_cat_pub  on public.projects (category, published);
create index idx_projects_types    on public.projects using gin (types);
create index idx_projects_location on public.projects (location) where location is not null;
create index idx_projects_shotdate on public.projects (shot_date);

-- ============================================================
-- project_images  (Masonry/CLS 대응: width/height 필수)
-- ============================================================
create table public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  path       text not null,          -- storage 'media' 버킷 내 경로
  alt        text not null default '',
  width      integer not null check (width  > 0),
  height     integer not null check (height > 0),
  is_cover   boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_pimages_project on public.project_images (project_id, sort_order);
-- 프로젝트당 대표 이미지 1장
create unique index uq_pimages_one_cover
  on public.project_images (project_id) where is_cover;

-- ============================================================
-- featured_projects  (홈 Featured — 관리자가 −/＋로 관리, 순서 보존)
-- ============================================================
create table public.featured_projects (
  project_id uuid primary key references public.projects (id) on delete cascade,
  position   integer not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- project_comments  (프로젝트 단위 · 닉네임+비밀번호, 사진 없음)
-- ============================================================
create table public.project_comments (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  nickname      text not null check (char_length(nickname) between 1 and 40),
  password_hash text not null,       -- crypt(비밀번호, gen_salt('bf'))
  body          text not null check (char_length(body) between 1 and 1000),
  is_hidden     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_pcomments_updated before update on public.project_comments
  for each row execute function public.set_updated_at();
create index idx_pcomments_project on public.project_comments (project_id, created_at desc);

-- ============================================================
-- products  (촬영 코스 · Essential/Special/Group)
-- ============================================================
create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  group_key     public.course_group not null,
  title         text not null,               -- BASIC COURSE …
  subtitle      text,                        -- 깔끔하고 직관적인 수중 프로필
  features      text[] not null default '{}',-- 불렛(비고 포함, 표시 순서 = 배열 순서)
  price_kind    public.price_kind not null default 'fixed',
  price_amount  integer,                     -- fixed/from일 때 (원)
  price_note    text,                        -- '3인 진행 · 1인 기준 …' 등
  cover_path    text,
  example_paths text[] not null default '{}',-- 촬영 예시(라이트박스)
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (price_kind not in ('fixed','from') or price_amount is not null)
);
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();
create index idx_products_group on public.products (group_key, sort_order);

-- ============================================================
-- costumes  (의상 대여 카탈로그 · /costumes)
-- ============================================================
create table public.costumes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        public.costume_type not null,
  sizes       text[] not null default '{}'
              check (sizes <@ array['44','55','66','77','FREE']::text[]),
  colors      text[] not null default '{}',  -- hex 또는 색명
  -- 난이도별 가능 코스 필터 (예: 긴 드레스 = premium 이상)
  courses     text[] not null default '{}'
              check (courses <@ array['basic','premium','blue_lagoon','signature','group']::text[]),
  price       integer not null
              check (price in (10000,20000,30000,40000,50000)),
  description text,
  image_paths text[] not null default '{}',  -- [0] = 대표
  is_available boolean not null default true, -- 대여중 표시용
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_costumes_updated before update on public.costumes
  for each row execute function public.set_updated_at();
create index idx_costumes_type    on public.costumes (type);
create index idx_costumes_sizes   on public.costumes using gin (sizes);
create index idx_costumes_courses on public.costumes using gin (courses);

-- ============================================================
-- reviews  (촬영 후기 · 방문자 공개 작성 + 상품 필터)
-- ============================================================
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  author_name   text not null check (char_length(author_name) between 1 and 40),
  rating        smallint not null check (rating between 1 and 5),
  body          text not null check (char_length(body) between 1 and 2000),
  product_id    uuid references public.products (id) on delete set null,
  product_label text not null,                -- 스냅샷(상품 삭제돼도 필터/표시 유지)
  image_paths   text[] not null default '{}', -- 선택 첨부
  is_hidden     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index idx_reviews_visible on public.reviews (created_at desc) where not is_hidden;
create index idx_reviews_product on public.reviews (product_id);

-- ============================================================
-- 갤러리 필터 자동 생성 뷰 (PLACE / YEAR)
-- ============================================================
create view public.v_gallery_places
with (security_invoker = true) as
  select category, location as place, count(*)::int as project_count
  from public.projects
  where published and location is not null
  group by category, location
  order by place;

create view public.v_gallery_years
with (security_invoker = true) as
  select category, extract(year from shot_date)::int as year, count(*)::int as project_count
  from public.projects
  where published and shot_date is not null
  group by category, extract(year from shot_date)
  order by year desc;

-- ============================================================
-- RPC — 좋아요 (익명 자유 클릭, published 프로젝트만)
-- ============================================================
create or replace function public.increment_project_like(p_project_id uuid)
returns integer language sql security definer
set search_path = public as $$
  update projects
     set like_count = like_count + 1
   where id = p_project_id and published
  returning like_count;
$$;
revoke all on function public.increment_project_like(uuid) from public;
grant execute on function public.increment_project_like(uuid) to anon, authenticated;

-- ============================================================
-- RPC — 댓글 작성/수정/삭제 (비밀번호 재검증)
--  ※ 캡차 검증 후 서버(Server Action, service_role)에서만 호출.
--    anon에게 execute를 주지 않아 캡차 우회 차단.
-- ============================================================
create or replace function public.add_project_comment(
  p_project_id uuid, p_nickname text, p_password text, p_body text
) returns uuid language plpgsql security definer
set search_path = public, extensions as $$
declare v_id uuid;
begin
  insert into project_comments (project_id, nickname, password_hash, body)
  values (p_project_id, p_nickname,
          extensions.crypt(p_password, extensions.gen_salt('bf')), p_body)
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.update_project_comment(
  p_comment_id uuid, p_password text, p_body text
) returns boolean language plpgsql security definer
set search_path = public, extensions as $$
declare ok boolean;
begin
  update project_comments
     set body = p_body
   where id = p_comment_id
     and password_hash = extensions.crypt(p_password, password_hash)
  returning true into ok;
  return coalesce(ok, false);
end $$;

create or replace function public.delete_project_comment(
  p_comment_id uuid, p_password text
) returns boolean language plpgsql security definer
set search_path = public, extensions as $$
declare ok boolean;
begin
  delete from project_comments
   where id = p_comment_id
     and password_hash = extensions.crypt(p_password, password_hash)
  returning true into ok;
  return coalesce(ok, false);
end $$;

revoke all on function public.add_project_comment(uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.update_project_comment(uuid,text,text)   from public, anon, authenticated;
revoke all on function public.delete_project_comment(uuid,text)        from public, anon, authenticated;
grant execute on function public.add_project_comment(uuid,text,text,text) to service_role;
grant execute on function public.update_project_comment(uuid,text,text)   to service_role;
grant execute on function public.delete_project_comment(uuid,text)        to service_role;

-- ============================================================
-- RLS
--  읽기: 공개 콘텐츠는 누구나 / 비공개·숨김은 관리자만
--  쓰기: 관리자(authenticated + admins)만. 방문자 쓰기(후기·댓글)는
--        캡차 검증을 거친 서버(service_role) 경유 → 정책 불필요(bypass)
-- ============================================================
alter table public.admins            enable row level security;
alter table public.projects          enable row level security;
alter table public.project_images    enable row level security;
alter table public.featured_projects enable row level security;
alter table public.project_comments  enable row level security;
alter table public.products          enable row level security;
alter table public.costumes          enable row level security;
alter table public.reviews           enable row level security;

create policy admins_self_read on public.admins
  for select using (user_id = auth.uid());

create policy projects_read on public.projects
  for select using (published or public.is_admin());
create policy projects_admin_write on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

create policy pimages_read on public.project_images
  for select using (
    exists (select 1 from public.projects p
            where p.id = project_id and (p.published or public.is_admin()))
  );
create policy pimages_admin_write on public.project_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy featured_read on public.featured_projects
  for select using (true);
create policy featured_admin_write on public.featured_projects
  for all using (public.is_admin()) with check (public.is_admin());

create policy pcomments_read on public.project_comments
  for select using (not is_hidden or public.is_admin());
create policy pcomments_admin_write on public.project_comments
  for all using (public.is_admin()) with check (public.is_admin());

create policy products_read on public.products
  for select using (is_active or public.is_admin());
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy costumes_read on public.costumes
  for select using (published or public.is_admin());
create policy costumes_admin_write on public.costumes
  for all using (public.is_admin()) with check (public.is_admin());

create policy reviews_read on public.reviews
  for select using (not is_hidden or public.is_admin());
create policy reviews_admin_write on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Storage — 단일 public 버킷 'media'
--   projects/{projectId}/…  products/…  costumes/…  reviews/…
--   읽기: 공개 CDN / 쓰기: 관리자 (후기 첨부는 서버 경유 업로드)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');
create policy media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
