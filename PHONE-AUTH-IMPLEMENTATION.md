# 전화번호 기반 인증 시스템 구현 완료

## 📋 변경사항 요약

### 1. 데이터베이스 스키마 변경 (`supabase-schema.sql`)
- ✅ `firebase_uid`, `auth_user_id` 컬럼 제거
- ✅ `phone_number` 필드를 PRIMARY 로그인 수단으로 변경
- ✅ `password` → `password_hash`로 변경 (SHA-256 해시 저장)
- ✅ `last_login` 타임스탬프 추가

### 2. 인증 Context 구현 (`src/contexts/AuthContext.tsx`)
- ✅ 전화번호 기반 로그인: `signInPhone(phoneNumber, password)`
- ✅ 전화번호 기반 회원가입: `signUpPhone(phoneNumber, password, name)`
- ✅ SHA-256 해시 기반 비밀번호 암호화 (브라우저 WebCrypto API 사용)
- ✅ localStorage를 이용한 세션 관리
- ✅ 로그인 시간 자동 업데이트

### 3. 로그인 페이지 수정 (`src/pages/login/page.tsx`)
- ✅ 이메일 필드 → 전화번호 필드 변경
- ✅ 닉네임 → 이름 필드로 변경
- ✅ 새로운 인증 API 호출 (`signInPhone`, `signUpPhone`)

## 🔐 보안 사항

- **비밀번호 해싱**: SHA-256 (웹 표준 WebCrypto API 사용)
- **저장소**: localStorage (토큰이 아닌 사용자 정보만 저장)
- **비밀번호 해싱**: 클라이언트 측에서 수행 (HTTPS 필수)

## 🚀 배포 전 필수 작업

### 1. Supabase 데이터베이스 마이그레이션

```sql
-- 아래 파일의 SQL을 Supabase SQL Editor에서 실행:
MIGRATION-PHONE-AUTH.sql
```

또는 개별 명령어:

```sql
-- 기존 테이블 수정
ALTER TABLE users 
  DROP COLUMN IF EXISTS firebase_uid,
  DROP COLUMN IF EXISTS auth_user_id,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- phone_number를 NOT NULL로 설정
ALTER TABLE users
  ALTER COLUMN phone_number SET NOT NULL;

-- 이메일 UNIQUE 제약
ALTER TABLE users
  ADD CONSTRAINT users_email_unique UNIQUE (email);

-- 인덱스 생성
CREATE INDEX users_phone_number_idx ON users(phone_number);
CREATE INDEX users_email_idx ON users(email);
```

### 2. 기존 사용자 데이터 처리

기존 사용자가 있는 경우:
```sql
-- 임시 비밀번호 설정 (예시)
UPDATE users 
SET password_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'  -- 빈 문자열의 SHA-256
WHERE password_hash IS NULL;

-- 그 후 password_hash NOT NULL 제약 추가
ALTER TABLE users 
  ALTER COLUMN password_hash SET NOT NULL;
```

## 📝 API 사용 예시

### 로그인
```typescript
const { error } = await signInPhone('010-1234-5678', 'password123');
if (!error) {
  // 로그인 성공
  navigate('/');
}
```

### 회원가입
```typescript
const { error } = await signUpPhone('010-1234-5678', 'password123', '김철수');
if (!error) {
  // 회원가입 성공
}
```

### 로그아웃
```typescript
await signOut();
```

## ⚠️ 주의사항

1. **HTTPS 필수**: 비밀번호는 클라이언트에서 해시되지만, HTTPS 전송은 필수입니다.
2. **기존 인증 제거됨**: 이제 Supabase Auth를 사용하지 않습니다. 커스텀 인증만 사용합니다.
3. **비밀번호 재설정**: 현재 비밀번호 재설정 기능이 없습니다. 필요하면 별도 구현 필요.

## 🔧 향후 개선사항

- [ ] 비밀번호 재설정 기능
- [ ] 이메일 기반 추가 인증
- [ ] 2FA (Two-Factor Authentication)
- [ ] 더 강력한 해싱 알고리즘 (bcrypt 등)
- [ ] 비밀번호 변경 기능

## 📚 참고자료

- [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript/introduction)
- [SHA-256 해싱](https://en.wikipedia.org/wiki/SHA-2)
