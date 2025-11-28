# Supabase 원격 설정 가이드

## 📋 현재 프로젝트 정보

- **Supabase URL**: https://agtivhggfqwjitzsqmkv.supabase.co
- **프로젝트 ID**: agtivhggfqwjitzsqmkv
- **스키마 파일**: supabase-schema.sql

## 🚀 데이터베이스 스키마 적용 방법

### 방법 1: Supabase Dashboard 사용 (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 방문
   - 로그인 후 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 버튼 클릭

3. **스키마 파일 적용**
   - `supabase-schema.sql` 파일의 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭하여 실행

4. **실행 완료 확인**
   - 에러 없이 완료되면 성공
   - Table Editor에서 테이블들이 생성되었는지 확인

### 방법 2: Supabase CLI 사용

```bash
# 1. Supabase 로그인
npx supabase login

# 2. 프로젝트 링크
npx supabase link --project-ref agtivhggfqwjitzsqmkv

# 3. 데이터베이스 비밀번호 입력
# (Supabase Dashboard > Settings > Database 에서 확인)

# 4. 스키마 적용
npx supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.agtivhggfqwjitzsqmkv.supabase.co:5432/postgres"
```

### 방법 3: psql 직접 연결

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.agtivhggfqwjitzsqmkv.supabase.co:5432/postgres" -f supabase-schema.sql
```

## 📊 생성될 테이블 목록

스키마 적용 후 다음 테이블들이 생성됩니다:

1. **users** - 사용자 프로필
2. **payments** - 결제 내역
3. **coin_packages** - 자석 패키지 (기본 데이터 포함)
4. **matches** - 매칭 정보
5. **messages** - 메시지
6. **posts** - 게시글
7. **community_posts** - 커뮤니티 게시글
8. **post_comments** - 커뮤니티 댓글
9. **comments** - 일반 댓글
10. **likes** - 좋아요
11. **notifications** - 알림

## 🔒 보안 설정 (RLS)

모든 테이블에 Row Level Security(RLS)가 자동으로 활성화됩니다:
- 사용자는 자신의 데이터만 수정 가능
- 공개 데이터는 모든 인증된 사용자가 조회 가능
- 개인 데이터는 본인만 접근 가능

## ⚙️ 자동 트리거

다음 기능들이 자동으로 작동합니다:
- 신규 회원 가입 시 프로필 자동 생성
- updated_at 필드 자동 업데이트
- 좋아요/댓글 수 자동 집계

## ✅ 설정 확인 방법

스키마 적용 후 확인 사항:

1. **테이블 확인**
   - Supabase Dashboard > Table Editor
   - 11개 테이블이 모두 생성되었는지 확인

2. **RLS 정책 확인**
   - 각 테이블의 "Policies" 탭 확인
   - 정책이 올바르게 적용되었는지 확인

3. **초기 데이터 확인**
   - coin_packages 테이블에 6개 패키지 데이터 확인

## 🔗 데이터베이스 연결 정보

애플리케이션은 이미 `.env` 파일에 설정된 정보로 연결됩니다:
```
VITE_SUPABASE_URL=https://agtivhggfqwjitzsqmkv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ZH4EvlAwWdaEvcHAkQFgYA_M2UD9Qbv
```

## 🐛 문제 해결

### 에러: relation already exists
- 테이블이 이미 존재하는 경우
- 스키마 파일의 DROP TABLE 명령이 먼저 실행되어 기존 테이블을 삭제합니다

### 에러: permission denied
- RLS 정책 충돌 가능성
- 기존 정책을 먼저 삭제 후 재실행

### 연결 실패
- 데이터베이스 비밀번호 확인
- 네트워크 연결 확인
- Supabase 프로젝트가 활성화 상태인지 확인

## 📝 다음 단계

1. ✅ 데이터베이스 스키마 적용
2. 애플리케이션 실행 테스트
3. 회원가입/로그인 기능 테스트
4. 데이터 CRUD 작업 테스트

---

**참고 문서**:
- [Supabase 공식 문서](https://supabase.com/docs)
- [SQL Editor 가이드](https://supabase.com/docs/guides/database/overview)
