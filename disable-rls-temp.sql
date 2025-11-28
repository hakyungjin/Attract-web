-- ============================================
-- 임시 해결책: RLS 비활성화 (개발 중에만 사용!)
-- ============================================
-- ⚠️ 경고: 프로덕션에서는 사용하지 마세요!
-- 이 스크립트는 개발 중 빠른 테스트를 위해 RLS를 비활성화합니다.

-- users 테이블 RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 다른 테이블도 비활성화 (선택사항)
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'payments', 'matches', 'posts')
ORDER BY tablename;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '⚠️  RLS가 비활성화되었습니다.';
    RAISE NOTICE '개발 중에만 사용하세요!';
    RAISE NOTICE '프로덕션 배포 전에 다시 활성화하세요: ALTER TABLE users ENABLE ROW LEVEL SECURITY;';
END $$;
