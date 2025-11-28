# ✅ 로그인/회원가입 분리 완료

## 🎯 변경 사항

### 이전 동작
전화번호 인증 → 자동으로 로그인/회원가입

### 현재 동작
전화번호 인증 → **기존 사용자 확인** → 로그인 또는 회원가입

```
전화번호 입력
    ↓
인증 코드 확인
    ↓
기존 사용자? → YES → 로그인 성공 → 홈으로
    ↓
   NO
    ↓
회원가입 페이지 → 프로필 작성 → 가입 완료 → 홈으로
```

## 📝 수정된 파일

### 1. [src/services/phoneAuth.ts](src/services/phoneAuth.ts)

#### 변경 내용
- ✅ `verifyCode` 함수 수정: `isNewUser` 여부 반환
- ✅ `checkUserExists` 함수 추가: Supabase에서 사용자 확인
- ✅ `createUserProfile` 함수 추가: 회원가입 시 프로필 생성
- ❌ `syncUserToSupabase` 함수 제거: 자동 생성 중단

#### 새로운 반환값
```typescript
{
  user: FirebaseUser | null,
  error: Error | null,
  isNewUser: boolean,      // 신규 사용자 여부
  userData: any | null     // 기존 사용자 데이터
}
```

### 2. [src/pages/login/PhoneLogin.tsx](src/pages/login/PhoneLogin.tsx)

#### 변경 내용
- ✅ 인증 성공 후 `isNewUser` 확인
- ✅ 신규 사용자: `/signup` 페이지로 이동 (state 전달)
- ✅ 기존 사용자: 바로 로그인 → 홈으로 이동

#### 전달하는 State
```typescript
{
  firebaseUid: string,    // Firebase UID
  phoneNumber: string     // 전화번호
}
```

### 3. [src/pages/signup/SignupPage.tsx](src/pages/signup/SignupPage.tsx) ⭐ 신규

#### 기능
- ✅ 이름 입력 (필수)
- ✅ 나이 입력 (선택)
- ✅ 성별 선택 (필수)
- ✅ 지역 입력 (선택)
- ✅ 자기소개 입력 (선택, 최대 200자)

#### 프로필 생성
- `createUserProfile()` 함수 호출
- Supabase `users` 테이블에 데이터 저장
- 완료 후 홈으로 이동

### 4. [src/router/config.tsx](src/router/config.tsx)

#### 추가된 라우트
```typescript
{
  path: "/signup",
  element: <SignupPage />
}
```

## 🔄 플로우 다이어그램

### 신규 사용자 플로우
```
1. /login (PhoneLoginPage)
   - 전화번호 입력: 010-1234-5678

2. 인증 코드 입력
   - 코드: 123456

3. Firebase 인증 성공
   - Supabase에서 사용자 확인
   - 결과: 없음 (신규 사용자)

4. /signup (SignupPage) 이동
   - 이름: 홍길동
   - 성별: 남성
   - 나이: 25
   - 지역: 서울
   - 자기소개: 안녕하세요!

5. 가입 완료
   - Supabase users 테이블에 저장

6. / (Home) 이동
```

### 기존 사용자 플로우
```
1. /login (PhoneLoginPage)
   - 전화번호 입력: 010-1234-5678

2. 인증 코드 입력
   - 코드: 123456

3. Firebase 인증 성공
   - Supabase에서 사용자 확인
   - 결과: 있음 (기존 사용자)

4. 로그인 성공
   - 사용자 정보 로드

5. / (Home) 이동
```

## 🧪 테스트 방법

### 신규 사용자 테스트

1. **전화번호 로그인**
   ```
   전화번호: +82 10 1234 5678
   인증 코드: 123456
   ```

2. **회원가입 페이지 확인**
   - 자동으로 `/signup` 페이지로 이동
   - 전화번호 표시 확인

3. **프로필 작성**
   ```
   이름: 테스트
   성별: 남성
   나이: 25
   ```

4. **가입 완료**
   - "가입 완료" 알림
   - 홈으로 이동

### 기존 사용자 테스트

1. **같은 전화번호로 다시 로그인**
   ```
   전화번호: +82 10 1234 5678
   인증 코드: 123456
   ```

2. **즉시 로그인**
   - "로그인 성공" 알림
   - 바로 홈으로 이동 (회원가입 페이지 건너뜀)

## 📊 데이터베이스 구조

### users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE,           -- Firebase UID (고유)
  phone_number TEXT UNIQUE,           -- 전화번호 (고유)
  name TEXT NOT NULL,                 -- 이름 (필수)
  age INTEGER,                        -- 나이 (선택)
  gender TEXT,                        -- 성별 (필수)
  location TEXT,                      -- 지역 (선택)
  bio TEXT,                           -- 자기소개 (선택)
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 사용자 확인 로직
```typescript
// Firebase UID로 사용자 찾기
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('firebase_uid', firebaseUid)
  .single();

if (data) {
  // 기존 사용자 → 로그인
} else {
  // 신규 사용자 → 회원가입
}
```

## 💡 주요 기능

### 1. 중복 가입 방지
- Firebase UID로 사용자 고유 식별
- 같은 전화번호로 재가입 불가

### 2. 필수 정보 수집
- **필수**: 이름, 성별
- **선택**: 나이, 지역, 자기소개

### 3. 사용자 경험 개선
- 신규 사용자: 프로필 작성 안내
- 기존 사용자: 바로 로그인

### 4. 데이터 무결성
- Firebase와 Supabase 동기화
- 트랜잭션 처리로 안전한 생성

## 🔒 보안 고려사항

### Firebase UID 사용
- ✅ 고유 식별자로 Firebase UID 사용
- ✅ 전화번호 변경 시에도 안전

### 전화번호 저장
- ✅ `phone_number` 컬럼에 UNIQUE 제약
- ✅ 한 전화번호당 한 계정만 생성

### State 전달
- ✅ React Router `state`로 안전하게 전달
- ✅ 직접 URL 접근 시 로그인 페이지로 리다이렉트

## 🐛 문제 해결

### Q1: 회원가입 페이지가 안 뜨고 바로 로그인돼요
**A**: 이미 해당 전화번호로 가입된 계정이 있습니다. (정상 동작)

### Q2: "state가 없습니다" 오류
**A**: `/signup` 페이지를 직접 접근하면 안 됩니다. `/login`에서 인증 후 자동으로 이동합니다.

### Q3: 가입은 됐는데 로그인이 안 돼요
**A**: Firebase Auth는 성공했지만 Supabase 저장 실패일 수 있습니다. 콘솔 로그 확인하세요.

### Q4: 같은 전화번호로 다시 가입하고 싶어요
**A**: Supabase Dashboard에서 해당 사용자를 삭제한 후 다시 시도하세요.

## 📚 API 문서

### `verifyCode(confirmationResult, code)`
전화번호 인증 코드 확인

**반환값**:
```typescript
{
  user: FirebaseUser | null,
  error: Error | null,
  isNewUser: boolean,        // true: 신규, false: 기존
  userData: object | null    // 기존 사용자 데이터
}
```

### `createUserProfile(firebaseUid, phoneNumber, userData)`
신규 사용자 프로필 생성

**매개변수**:
```typescript
{
  firebaseUid: string,       // Firebase UID
  phoneNumber: string,       // 전화번호
  userData: {
    name: string,            // 이름 (필수)
    age?: number,           // 나이 (선택)
    gender?: string,        // 성별 (선택)
    location?: string,      // 지역 (선택)
    bio?: string           // 자기소개 (선택)
  }
}
```

**반환값**:
```typescript
{
  data: object | null,      // 생성된 사용자 데이터
  error: Error | null       // 오류
}
```

## ✅ 체크리스트

개발 완료 사항:
- [x] `verifyCode` 함수에서 `isNewUser` 반환
- [x] `checkUserExists` 함수로 사용자 확인
- [x] `createUserProfile` 함수로 프로필 생성
- [x] PhoneLogin에서 신규/기존 사용자 분기 처리
- [x] SignupPage 컴포넌트 생성
- [x] 회원가입 폼 (이름, 나이, 성별, 지역, 자기소개)
- [x] 라우터에 `/signup` 경로 추가
- [x] State를 통한 데이터 전달
- [x] 직접 접근 방지 로직

---

**로그인과 회원가입이 성공적으로 분리되었습니다!** 🎉

이제 신규 사용자는 회원가입 페이지에서 프로필을 작성하고, 기존 사용자는 바로 로그인됩니다.
