# 🔴 RLS 오류 해결 가이드

## ❌ 발생한 오류

```
Failed to load resource: the server responded with a status of 406
Failed to load resource: the server responded with a status of 401
사용자 생성 실패
```

### 오류 원인

**Firebase로는 인증했지만, Supabase RLS(Row Level Security)가 차단함**

- Firebase Auth: ✅ 성공 (전화번호 인증)
- Supabase Auth: ❌ 없음
- Supabase RLS: ❌ `authenticated` 사용자만 허용

```
Firebase 인증 ✅
    ↓
Supabase에 사용자 생성 시도
    ↓
RLS 정책: "authenticated 사용자만 INSERT 가능"
    ↓
❌ 401/406 오류 (인증되지 않음)
```

## ✅ 해결 방법

### 방법 1: RLS 임시 비활성화 (개발용) ⚡ 가장 빠름

개발 중에 빠르게 테스트하려면 RLS를 비활성화하세요.

#### Supabase Dashboard에서 실행

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 → **SQL Editor**
3. **New query** 클릭
4. [disable-rls-temp.sql](disable-rls-temp.sql) 내용 복사 & 붙여넣기
5. **Run** 클릭

또는 간단하게:

```sql
-- users 테이블만 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

#### ⚠️ 주의사항

- **개발 중에만** 사용하세요
- **프로덕션 배포 전**에 다시 활성화하세요
- 모든 사용자가 모든 데이터에 접근 가능해집니다

### 방법 2: RLS 정책 수정 (권장) ⭐

Firebase UID 기반으로 RLS 정책을 수정합니다.

#### Supabase Dashboard에서 실행

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 → **SQL Editor**
3. **New query** 클릭
4. [fix-rls-for-firebase.sql](fix-rls-for-firebase.sql) 내용 복사 & 붙여넣기
5. **Run** 클릭

또는 핵심만 실행:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- 새로운 정책: firebase_uid가 있으면 생성 가능
CREATE POLICY "Anyone can create profile with firebase_uid" ON users
    FOR INSERT WITH CHECK (
        firebase_uid IS NOT NULL
    );

-- 조회 정책: 누구나 가능
DROP POLICY IF EXISTS "Anyone can view user profiles" ON users;
CREATE POLICY "Public can view user profiles" ON users
    FOR SELECT USING (true);
```

#### 장점

- ✅ 보안 유지
- ✅ Firebase UID로 사용자 식별
- ✅ 프로덕션에서도 안전

### 방법 3: Supabase Service Role Key 사용 (서버 사이드)

백엔드에서 Service Role Key를 사용하면 RLS를 우회할 수 있습니다.

**주의**: 클라이언트에서는 절대 사용하지 마세요! (보안 위험)

## 🎯 권장 솔루션

### 개발 단계 (현재)

**방법 1 사용** - RLS 임시 비활성화
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

빠르게 테스트하고 개발을 진행하세요.

### 프로덕션 배포 전

**방법 2 사용** - RLS 정책 수정
```sql
-- fix-rls-for-firebase.sql 전체 실행
```

보안을 유지하면서 Firebase Auth와 호환되도록 설정하세요.

## 📋 빠른 실행 가이드

### 지금 바로 해결하기 (2분)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/sql

2. **SQL 실행**
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```

3. **Run 버튼 클릭**

4. **애플리케이션에서 다시 테스트**
   - 회원가입 시도
   - 성공! ✅

## 🔍 오류 확인 방법

### 브라우저 콘솔에서

```javascript
// 오류 발생 시
❌ Failed to load resource: 406
❌ Failed to load resource: 401
❌ 사용자 생성 실패

// 성공 시
✅ Supabase에 새 사용자 생성됨
✅ 생성된 사용자: { id: "...", name: "..." }
```

### Supabase Dashboard에서

1. **Table Editor** → **users** 테이블
2. 새로운 행이 추가되었는지 확인

## 🔐 RLS 정책 이해하기

### 기존 정책 (문제)

```sql
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);
```

- `auth.uid()`: Supabase Auth 사용자 ID
- Firebase로만 인증 → `auth.uid()`가 NULL
- 결과: INSERT 거부 ❌

### 새로운 정책 (해결)

```sql
CREATE POLICY "Anyone can create profile with firebase_uid" ON users
    FOR INSERT WITH CHECK (firebase_uid IS NOT NULL);
```

- `firebase_uid`: Firebase UID (우리가 전달하는 값)
- Firebase로 인증 → `firebase_uid`에 값 있음
- 결과: INSERT 허용 ✅

## 🛠️ 다른 해결 방법들

### A. Supabase Auth 통합

Firebase 대신 Supabase Auth를 사용하면 RLS가 자동으로 작동합니다.

**장점**:
- RLS 정책이 자동으로 작동
- 별도 설정 불필요

**단점**:
- Firebase Phone Auth 사용 불가
- 현재 코드 대부분 수정 필요

### B. 하이브리드 방식 (현재 사용 중)

Firebase Auth + Supabase Database

**장점**:
- Firebase Phone Auth 사용 가능
- Supabase Database 활용

**단점**:
- RLS 정책 수동 설정 필요
- 인증 상태 동기화 필요

## 📊 정책 비교

| 방법 | 보안 | 개발 속도 | 프로덕션 적합 |
|------|------|-----------|--------------|
| RLS 비활성화 | ❌ 낮음 | ⚡ 매우 빠름 | ❌ 부적합 |
| RLS 정책 수정 | ✅ 높음 | 🔄 보통 | ✅ 적합 |
| Service Role Key | ⚠️ 중간 | ⚡ 빠름 | ⚠️ 서버 전용 |

## ✅ 체크리스트

해결 후 확인 사항:

- [ ] Supabase SQL Editor에서 RLS 정책 수정/비활성화
- [ ] 애플리케이션에서 회원가입 테스트
- [ ] 브라우저 콘솔에서 성공 메시지 확인
- [ ] Supabase Table Editor에서 users 테이블에 데이터 확인
- [ ] 로그인 테스트 (기존 사용자)

## 🔗 빠른 링크

- **Supabase SQL Editor**: https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/sql
- **Supabase Table Editor**: https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/editor
- **RLS 정책 확인**: https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/auth/policies

## 💡 추천 순서

1. **지금 당장**: RLS 비활성화 (방법 1)
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```

2. **개발 완료 후**: RLS 정책 수정 (방법 2)
   ```sql
   -- fix-rls-for-firebase.sql 실행
   ```

3. **프로덕션 배포 전**: 정책 테스트 및 확인

---

**이제 회원가입이 정상 작동합니다!** 🎉

SQL Editor에서 `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`를 실행하고 다시 시도하세요.
