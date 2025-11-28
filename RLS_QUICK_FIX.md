# 🔴 406 오류 해결 - RLS 비활성화

## 현재 오류

```
Failed to load resource: the server responded with a status of 406
전화번호 검색: 01063005174
검색 결과: null
```

로그인 시 전화번호로 사용자를 찾을 수 없습니다. 이는 **RLS(Row Level Security)**가 활성화되어 있어서 발생합니다.

## ⚡ 빠른 해결 방법 (1분)

### Supabase Dashboard에서 실행

1. **Supabase SQL Editor 접속**
   https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/sql

2. **다음 SQL 실행**

```sql
-- users 테이블 RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

3. **Run 버튼 클릭**

4. **앱에서 다시 로그인 시도**

## 완료! ✅

이제 다음이 가능합니다:
- ✅ 로그인 (전화번호 + 비밀번호)
- ✅ 회원가입 (전화번호 인증)
- ✅ 빠른 회원가입 (인증 없음)
- ✅ 사용자 데이터 조회

## 📋 전체 테이블 RLS 비활성화 (선택사항)

다른 기능에서도 406 오류가 발생한다면:

```sql
-- 모든 테이블 RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
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
ORDER BY tablename;
```

## ⚠️ 주의사항

- **개발 중에만** 사용하세요
- **프로덕션 배포 전**에 RLS 정책을 다시 설정하세요
- 모든 사용자가 모든 데이터에 접근 가능해집니다

## 🔄 나중에 다시 활성화하기

프로덕션 배포 전:

```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Firebase UID 기반 정책 생성
CREATE POLICY "Anyone can create profile with firebase_uid" ON users
    FOR INSERT WITH CHECK (firebase_uid IS NOT NULL OR phone_number IS NOT NULL);

CREATE POLICY "Public can view user profiles" ON users
    FOR SELECT USING (true);
```

## 🎯 빠른 링크

- **SQL Editor**: https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/sql
- **Table Editor**: https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/editor

---

**지금 바로 실행하세요!**

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```
