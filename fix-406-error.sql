-- =============================================
-- 406 오류 완전 해결 스크립트
-- =============================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/sql

-- 1단계: 현재 RLS 상태 확인
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'payments', 'matches', 'messages', 'posts', 'community_posts');

-- 2단계: 모든 기존 정책 삭제
DO $$
BEGIN
    -- users 테이블 정책 삭제
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
    DROP POLICY IF EXISTS "Anyone can view user profiles" ON public.users;
    DROP POLICY IF EXISTS "Public can view user profiles" ON public.users;
    DROP POLICY IF EXISTS "Users can update own data" ON public.users;
    DROP POLICY IF EXISTS "Anyone can create profile with firebase_uid" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile by firebase_uid" ON public.users;
    DROP POLICY IF EXISTS "Users can delete own profile by firebase_uid" ON public.users;

    RAISE NOTICE '✅ 모든 정책이 삭제되었습니다';
END $$;

-- 3단계: RLS 비활성화
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts DISABLE ROW LEVEL SECURITY;

-- post_comments 테이블이 있다면
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_comments') THEN
        EXECUTE 'ALTER TABLE public.post_comments DISABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- comments 테이블이 있다면
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
        EXECUTE 'ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- likes 테이블이 있다면
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'likes') THEN
        EXECUTE 'ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- notifications 테이블이 있다면
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        EXECUTE 'ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- 4단계: 결과 확인
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5단계: 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ RLS가 완전히 비활성화되었습니다!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '이제 다음 작업이 가능합니다:';
    RAISE NOTICE '  - 로그인 (전화번호 + 비밀번호)';
    RAISE NOTICE '  - 회원가입 (전화번호 인증)';
    RAISE NOTICE '  - 빠른 회원가입 (인증 없음)';
    RAISE NOTICE '  - 모든 데이터 조회/수정';
    RAISE NOTICE '================================================';
    RAISE NOTICE '⚠️  주의: 개발 중에만 사용하세요!';
    RAISE NOTICE '================================================';
END $$;

-- 6단계: users 테이블 데이터 샘플 확인 (첫 3개)
SELECT
    id,
    name,
    phone_number,
    gender,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 3;
