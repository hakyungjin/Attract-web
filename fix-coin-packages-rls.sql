-- Coin Packages 테이블 RLS 정책 수정
-- 모든 사용자가 패키지 정보를 조회할 수 있도록 허용

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Anyone can view coin packages" ON coin_packages;
DROP POLICY IF EXISTS "Public can view active packages" ON coin_packages;

-- RLS 활성화 확인
ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;

-- 새로운 정책 생성: 모든 사용자가 활성 패키지 조회 가능
CREATE POLICY "Public can view active packages" ON coin_packages
    FOR SELECT
    USING (active = TRUE);

-- 관리자만 삽입/수정/삭제 가능 (service_role 키 필요)
CREATE POLICY "Service role can manage packages" ON coin_packages
    FOR ALL
    USING (auth.role() = 'service_role');

-- 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'coin_packages';
