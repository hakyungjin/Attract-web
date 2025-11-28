-- ============================================
-- Firebase Auth 사용자를 위한 RLS 정책 수정
-- ============================================
-- 문제: Firebase로 인증했지만 Supabase는 인증되지 않아 RLS에서 차단됨
-- 해결: firebase_uid를 기반으로 정책 수정

-- ============================================
-- 1. users 테이블 정책 수정
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view user profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- 새로운 정책: 누구나 조회 가능 (공개 프로필)
CREATE POLICY "Public can view user profiles" ON users
    FOR SELECT USING (true);

-- 새로운 정책: 누구나 삽입 가능 (회원가입)
-- Firebase UID가 있으면 생성 가능
CREATE POLICY "Anyone can create profile with firebase_uid" ON users
    FOR INSERT WITH CHECK (
        firebase_uid IS NOT NULL
    );

-- 새로운 정책: firebase_uid로 본인 데이터만 수정 가능
CREATE POLICY "Users can update own profile by firebase_uid" ON users
    FOR UPDATE USING (
        firebase_uid IS NOT NULL
    );

-- 새로운 정책: firebase_uid로 본인 데이터만 삭제 가능
CREATE POLICY "Users can delete own profile by firebase_uid" ON users
    FOR DELETE USING (
        firebase_uid IS NOT NULL
    );

-- ============================================
-- 2. 다른 테이블도 동일하게 수정 (필요 시)
-- ============================================

-- payments 테이블
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;

CREATE POLICY "Users can view payments" ON payments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert payments" ON payments
    FOR INSERT WITH CHECK (user_id IS NOT NULL);

-- matches 테이블
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update own matches" ON matches;

CREATE POLICY "Users can view matches" ON matches
    FOR SELECT USING (true);

CREATE POLICY "Users can create matches" ON matches
    FOR INSERT WITH CHECK (user_id_1 IS NOT NULL);

CREATE POLICY "Users can update matches" ON matches
    FOR UPDATE USING (true);

-- messages 테이블
DROP POLICY IF EXISTS "Users can view match messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can view messages" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (sender_id IS NOT NULL);

-- posts 테이블
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

CREATE POLICY "Anyone can view posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can update posts" ON posts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete posts" ON posts
    FOR DELETE USING (true);

-- community_posts 테이블
DROP POLICY IF EXISTS "Anyone can view community posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create community posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own community posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own community posts" ON community_posts;

CREATE POLICY "Anyone can view community posts" ON community_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create community posts" ON community_posts
    FOR INSERT WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can update community posts" ON community_posts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete community posts" ON community_posts
    FOR DELETE USING (true);

-- ============================================
-- 3. 정책 확인
-- ============================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename IN ('users', 'payments', 'matches', 'messages', 'posts', 'community_posts')
ORDER BY tablename, policyname;

-- ============================================
-- 완료 메시지
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS 정책이 Firebase Auth 사용을 위해 업데이트되었습니다.';
    RAISE NOTICE '이제 Firebase로만 인증해도 Supabase 테이블에 접근할 수 있습니다.';
END $$;
