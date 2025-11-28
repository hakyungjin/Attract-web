-- 1. 스토리지 버킷 생성 (없을 경우)
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

-- 2. 기존 정책 삭제 (충돌 방지)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Users can update own images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;

-- 3. 새 정책 생성 (더 관대한 정책으로 수정)

-- 누구나 이미지 보기 가능
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'profile-images' );

-- 인증된 사용자는 누구나 업로드 가능 (자신의 폴더 제한 없이 일단 허용)
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'profile-images' and auth.role() = 'authenticated' );

-- 자신의 이미지는 수정 가능
create policy "Users can update own images"
  on storage.objects for update
  using ( bucket_id = 'profile-images' and auth.uid() = owner );

-- 자신의 이미지는 삭제 가능
create policy "Users can delete own images"
  on storage.objects for delete
  using ( bucket_id = 'profile-images' and auth.uid() = owner );
