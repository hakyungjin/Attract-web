-- 기존 정책 모두 삭제
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Users can update own images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;

-- 누구나 업로드/수정/삭제 가능하도록 변경 (개발 단계용)
create policy "Anyone can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'profile-images' );

create policy "Anyone can view images"
  on storage.objects for select
  using ( bucket_id = 'profile-images' );

create policy "Anyone can update images"
  on storage.objects for update
  using ( bucket_id = 'profile-images' );

create policy "Anyone can delete images"
  on storage.objects for delete
  using ( bucket_id = 'profile-images' );
