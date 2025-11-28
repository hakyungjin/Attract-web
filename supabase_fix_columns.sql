-- users 테이블이 이미 존재하는 경우 컬럼만 추가
-- 테이블이 없으면 전체 생성

-- 1. 테이블이 없으면 생성
create table if not exists public.users (
  id uuid not null primary key,
  updated_at timestamp with time zone,
  name text,
  avatar_url text,
  phone_number text,
  age integer,
  gender text,
  location text,
  bio text,
  school text,
  mbti text,
  height text,
  body_type text,
  style text,
  religion text,
  smoking text,
  drinking text,
  interests text[],
  firebase_uid text
);

-- 2. 테이블이 이미 있다면 누락된 컬럼 추가 (에러 무시)
alter table public.users add column if not exists body_type text;
alter table public.users add column if not exists style text;
alter table public.users add column if not exists religion text;
alter table public.users add column if not exists smoking text;
alter table public.users add column if not exists drinking text;
alter table public.users add column if not exists height text;
alter table public.users add column if not exists mbti text;
alter table public.users add column if not exists school text;
alter table public.users add column if not exists bio text;
alter table public.users add column if not exists interests text[];

-- 3. RLS 설정
alter table public.users enable row level security;

-- 기존 정책 삭제 후 재생성
drop policy if exists "Public profiles are viewable by everyone." on public.users;
drop policy if exists "Users can insert their own profile." on public.users;
drop policy if exists "Users can update own profile." on public.users;
drop policy if exists "Anyone can insert" on public.users;
drop policy if exists "Anyone can update" on public.users;

-- 누구나 프로필 보기 가능
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

-- 누구나 프로필 생성 가능 (Firebase 인증 사용자용)
create policy "Anyone can insert"
  on public.users for insert
  with check ( true );

-- 누구나 프로필 수정 가능 (Firebase 인증 사용자용)
create policy "Anyone can update"
  on public.users for update
  using ( true );
