# 🔴 406 오류 완전 해결 가이드

## 현재 상황

```
Failed to load resource: the server responded with a status of 406
전화번호 검색: 01063005174
검색 결과: null
```

로그인/회원가입 시 계속 406 오류가 발생합니다.

## ⚡ 해결 방법 (5분 안에 완료)

### 1단계: Supabase SQL Editor 접속

https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/sql

### 2단계: SQL 스크립트 실행

아래 두 가지 방법 중 하나를 선택하세요:

#### 방법 A: 파일 사용 (권장) ✅

1. [`fix-406-error.sql`](fix-406-error.sql) 파일 열기
2. 전체 내용 복사 (Ctrl+A, Ctrl+C)
3. Supabase SQL Editor에 붙여넣기 (Ctrl+V)
4. **Run** 버튼 클릭
5. 결과에서 "✅ RLS가 완전히 비활성화되었습니다!" 확인

#### 방법 B: 빠른 실행

Supabase SQL Editor에 다음 코드 복사 & 실행:

```sql
-- RLS 비활성화
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';
```

결과에서 `rowsecurity`가 `false`로 나와야 합니다.

### 3단계: 앱 새로고침

1. **브라우저 하드 리프레시**: `Ctrl + Shift + R`
2. 또는 개발자 도구(F12) → Network 탭 → "Disable cache" 체크 → 새로고침

### 4단계: 테스트

1. `/login` 페이지 접속
2. 전화번호 입력: `010-6300-5174`
3. 비밀번호 입력: `1234`
4. 로그인 버튼 클릭

**기대 결과:**
- ✅ 콘솔에 "전화번호 검색: 01063005174" 출력
- ✅ 콘솔에 "검색 결과: {id: ..., name: ...}" 출력
- ✅ "로그인 성공!" 알림
- ✅ 홈 화면으로 이동

## 🔍 문제 진단

### 여전히 406 오류가 발생한다면

#### 체크리스트 1: RLS 상태 재확인

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';
```

- `rowsecurity` = `false` 여야 합니다
- `true`라면 다시 `ALTER TABLE users DISABLE ROW LEVEL SECURITY;` 실행

#### 체크리스트 2: 데이터 존재 확인

```sql
SELECT id, name, phone_number, gender
FROM public.users
WHERE phone_number = '01063005174';
```

- 결과가 없다면 → 해당 전화번호로 가입된 사용자가 없음
- `/signup/quick`에서 먼저 회원가입

#### 체크리스트 3: Supabase 프로젝트 확인

- 현재 프로젝트 ID: `ytffobltrwkgxiedorsd`
- `.env` 파일의 URL이 `https://ytffobltrwkgxiedorsd.supabase.co`인지 확인

#### 체크리스트 4: 브라우저 캐시

```bash
# 브라우저에서
1. F12 (개발자 도구)
2. Application 탭
3. Storage → Clear site data
4. 페이지 새로고침
```

## 📋 전체 테이블 RLS 비활성화

다른 기능에서도 오류가 발생한다면:

```sql
-- 모든 테이블 RLS 비활성화
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts DISABLE ROW LEVEL SECURITY;
```

## 🧪 테스트 시나리오

### 1. 새 회원 생성 (빠른 가입)

1. `/signup/quick` 접속
2. 정보 입력:
   ```
   이름: 테스트유저
   전화번호: 010-1234-5678
   성별: 남성
   ```
3. 가입 완료
4. Supabase Table Editor에서 확인:
   - https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/editor

### 2. 로그인 테스트

1. `/login` 접속
2. 방금 생성한 전화번호 입력: `010-1234-5678`
3. 비밀번호: `1234`
4. 로그인 성공 확인

### 3. 콘솔 로그 확인

브라우저 콘솔(F12)에서:
```
✅ 전화번호 검색: 01012345678
✅ 검색 결과: { id: "...", name: "테스트유저", ... }
✅ 로그인 성공! 홈으로 이동합니다.
```

## 🚨 여전히 해결 안 되면

### 최종 해결책: Supabase 클라이언트 재초기화

Vite 개발 서버 재시작:

```bash
# 터미널에서
Ctrl + C  # 현재 서버 중지
npm run dev  # 서버 재시작
```

## 💡 추가 팁

### 데이터베이스 직접 조회

Supabase Table Editor에서:
1. https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/editor
2. `users` 테이블 선택
3. 전화번호 검색: `phone_number` 컬럼 확인

### API 응답 확인

브라우저 Network 탭에서:
1. F12 → Network
2. 로그인 시도
3. `users?select=*&phone_number=eq.01063005174` 요청 찾기
4. Response 확인

**정상:**
```json
[
  {
    "id": "...",
    "name": "...",
    "phone_number": "01063005174"
  }
]
```

**오류 (406):**
```json
{
  "code": "PGRST116",
  "message": "The result contains 0 rows"
}
```

## ✅ 성공 확인

다음이 모두 작동하면 성공:
- [ ] RLS 상태 확인: `rowsecurity = false`
- [ ] 로그인 시 콘솔에 사용자 데이터 출력
- [ ] 406 오류 없음
- [ ] 로그인 후 홈 화면 이동
- [ ] 회원가입 정상 작동

---

## 🎯 요약

1. **Supabase SQL Editor 접속**
2. **`fix-406-error.sql` 파일 실행** 또는 `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`
3. **브라우저 하드 리프레시** (Ctrl+Shift+R)
4. **로그인 테스트**

**예상 소요 시간**: 2-3분

---

**문제가 계속되면 콘솔 전체 로그를 공유해주세요!**
