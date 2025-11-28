-- ============================================
-- Supabase Storage 정책 설정
-- ============================================
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요
-- 먼저 Dashboard > Storage에서 버킷들을 생성해야 합니다

-- ============================================
-- 1. avatars 버킷 정책
-- ============================================

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Public Access avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- 모든 사용자가 프로필 이미지 조회 가능
CREATE POLICY "Public Access avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- 사용자는 자신의 이미지만 수정 가능
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 사용자는 자신의 이미지만 삭제 가능
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 2. posts 버킷 정책
-- ============================================

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Public Access posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own posts images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own posts images" ON storage.objects;

-- 모든 사용자가 게시글 이미지 조회 가능
CREATE POLICY "Public Access posts"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

-- 사용자는 자신의 이미지만 수정 가능
CREATE POLICY "Users can update own posts images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 사용자는 자신의 이미지만 삭제 가능
CREATE POLICY "Users can delete own posts images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 3. community 버킷 정책
-- ============================================

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Public Access community" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload community" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own community images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own community images" ON storage.objects;

-- 모든 사용자가 커뮤니티 이미지 조회 가능
CREATE POLICY "Public Access community"
ON storage.objects FOR SELECT
USING (bucket_id = 'community');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload community"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community'
  AND auth.role() = 'authenticated'
);

-- 사용자는 자신의 이미지만 수정 가능
CREATE POLICY "Users can update own community images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'community'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'community'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 사용자는 자신의 이미지만 삭제 가능
CREATE POLICY "Users can delete own community images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 정책 확인
-- ============================================

-- 모든 Storage 정책 확인
SELECT
    policyname,
    tablename,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY policyname;

-- 버킷별 정책 개수 확인
SELECT
    CASE
        WHEN policyname LIKE '%avatars%' THEN 'avatars'
        WHEN policyname LIKE '%posts%' THEN 'posts'
        WHEN policyname LIKE '%community%' THEN 'community'
        ELSE 'other'
    END as bucket,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'storage'
GROUP BY bucket
ORDER BY bucket;
