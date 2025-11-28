-- 1. public.users 테이블 생성 (이미지 업로드 및 프로필 저장용)
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
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

-- 2. RLS (Row Level Security) 설정
alter table public.users enable row level security;

-- 누구나 프로필을 볼 수 있음
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

-- 사용자는 자신의 프로필을 생성(insert)할 수 있음
create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

-- 사용자는 자신의 프로필을 수정(update)할 수 있음
create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- 3. 새 유저 가입 시 자동으로 public.users에 행 추가하는 트리거 (선택 사항)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- 트리거 등록 (이미 존재하면 에러 날 수 있으므로 drop 후 create)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. 스토리지 정책 보완 (업로드 에러 해결용)
-- 기존 정책이 있다면 충돌할 수 있으므로 drop 후 재생성
drop policy if exists "Authenticated users can upload images" on storage.objects;

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'profile-images' and auth.role() = 'authenticated' );

-- 자신의 파일만 업데이트/삭제 가능
create policy "Users can update own images"
  on storage.objects for update
  using ( bucket_id = 'profile-images' and auth.uid() = owner );

create policy "Users can delete own images"
  on storage.objects for delete
  using ( bucket_id = 'profile-images' and auth.uid() = owner );
