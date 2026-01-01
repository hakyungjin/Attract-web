# 🔥 Firebase 설정 완료

## ✅ 설정된 Firebase 프로젝트

**프로젝트 ID**: `campus-4f167`
**프로젝트 이름**: Campus
**Region**: Asia (기본)

## 📋 설정 정보

### Firebase Config
```javascript
{
  apiKey: "AIzaSyAKUD99sVYnK5irQey028CmYUE-ZeiWh18",
  authDomain: "campus-4f167.firebaseapp.com",
  projectId: "campus-4f167",
  storageBucket: "campus-4f167.firebasestorage.app",
  messagingSenderId: "874089973237",
  appId: "1:874089973237:web:f9ade8cb63a9bf00c64cbc",
  measurementId: "G-0BRQDHMJME"
}
```

## 🔐 환경 변수 (.env)

프로젝트의 `.env` 파일에 다음 설정이 추가되었습니다:

```env
VITE_FIREBASE_API_KEY=AIzaSyAKUD99sVYnK5irQey028CmYUE-ZeiWh18
VITE_FIREBASE_AUTH_DOMAIN=campus-4f167.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=campus-4f167
VITE_FIREBASE_STORAGE_BUCKET=campus-4f167.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=874089973237
VITE_FIREBASE_APP_ID=1:874089973237:web:f9ade8cb63a9bf00c64cbc
VITE_FIREBASE_MEASUREMENT_ID=G-0BRQDHMJME
```

## 📱 사용 가능한 기능

### 1. Phone Authentication (전화번호 인증)
- ✅ SMS 인증
- ✅ reCAPTCHA 검증
- ✅ 한국 전화번호 지원 (+82)

### 2. Email Authentication (이메일 인증)
- ✅ 이메일/비밀번호 로그인
- ✅ 회원가입
- ✅ 비밀번호 재설정

### 3. Analytics (분석)
- ✅ 사용자 행동 추적
- ✅ 이벤트 로깅
- ✅ 실시간 통계

### 4. Storage (저장소)
- ✅ 파일 업로드
- ✅ 이미지 저장
- ✅ 공개 URL 생성

#### 🔐 Storage 보안 규칙 (Rules)
이미지 업로드를 위해 Firebase Console > Storage > Rules에 다음 내용을 적용해야 합니다:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{allPaths=**} {
      allow read: if true;
      allow write: if true; // 테스트용 (운영 시 request.auth != null 권장)
    }
    match /posts/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
    match /community/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## 💻 코드에서 사용하기

### Firebase 초기화

[src/lib/firebase.ts](src/lib/firebase.ts) 파일이 이미 설정되어 있습니다:

```typescript
import { firebaseAuth, analytics } from '@/lib/firebase';

// Auth 사용
const user = firebaseAuth.currentUser;

// Analytics 사용 (있는 경우)
if (analytics) {
  // 이벤트 로깅
}
```

### 전화번호 인증 예시

[src/services/phoneAuth.ts](src/services/phoneAuth.ts) 파일 참고:

```typescript
import { firebaseAuth } from '@/lib/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

// reCAPTCHA 설정
const recaptchaVerifier = new RecaptchaVerifier(
  firebaseAuth,
  'recaptcha-container',
  { size: 'invisible' }
);

// 인증 코드 전송
const confirmationResult = await signInWithPhoneNumber(
  firebaseAuth,
  '+821012345678',
  recaptchaVerifier
);

// 인증 코드 확인
const userCredential = await confirmationResult.confirm('123456');
```

## 🧪 테스트

### 브라우저에서 테스트

1. [test-firebase.html](test-firebase.html) 파일을 브라우저에서 열기
2. 자동으로 Firebase 연결 테스트 실행
3. 연결 상태 및 사용 가능한 기능 확인

### 개발 서버에서 테스트

```bash
npm run dev
```

브라우저 콘솔에서 Firebase 초기화 로그 확인:
```
✅ Firebase App 초기화 성공
✅ Firebase Auth 초기화 성공
✅ Firebase Analytics 초기화 성공
```

## 🔧 Firebase Console 설정

### 1. Authentication 설정

https://console.firebase.google.com/project/campus-4f167/authentication

#### Phone 인증 활성화
1. **Authentication** > **Sign-in method** 클릭
2. **Phone** 제공업체 활성화
3. 테스트 전화번호 추가 (선택사항):
   ```
   +82 10 1234 5678 → 123456
   ```

#### Email 인증 활성화
1. **Authentication** > **Sign-in method** 클릭
2. **Email/Password** 제공업체 활성화

### 2. Analytics 설정

https://console.firebase.google.com/project/campus-4f167/analytics

- ✅ Google Analytics 자동 연동됨
- Measurement ID: `G-0BRQDHMJME`

### 3. Storage 설정 (선택사항)

https://console.firebase.google.com/project/campus-4f167/storage

Firebase Storage를 사용하려면:
1. **Storage** 메뉴 클릭
2. **Get Started** 클릭
3. 기본 보안 규칙으로 시작

## 🔒 보안 규칙

### Authentication
- 기본적으로 안전한 설정
- 인증된 사용자만 접근 가능

### Storage (설정 시)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🌐 허용된 도메인

Firebase Console에서 다음 도메인들이 허용되어야 합니다:

1. **localhost** (개발 환경)
   - `http://localhost:5173`
   - `http://localhost:3000`

2. **프로덕션 도메인** (배포 시)
   - 실제 도메인 추가 필요

### 도메인 추가 방법
1. Firebase Console > Authentication > Settings
2. **Authorized domains** 섹션
3. **Add domain** 버튼 클릭

## 📊 현재 설정 상태

| 기능 | 상태 | 비고 |
|------|------|------|
| Firebase App | ✅ 설정 완료 | 환경 변수 적용됨 |
| Authentication | ✅ 설정 완료 | Phone, Email 지원 |
| Analytics | ✅ 설정 완료 | 자동 추적 활성화 |
| Storage | ⚠️ 선택사항 | 필요 시 활성화 |
| Firestore | ⚠️ 선택사항 | Supabase 사용 중 |

## 🚀 다음 단계

1. **Firebase Console에서 인증 방법 활성화**
   - Phone 인증 활성화
   - Email 인증 활성화

2. **테스트 전화번호 추가 (개발용)**
   - 실제 SMS 없이 테스트 가능
   - 인증 코드 고정 설정

3. **도메인 화이트리스트 추가**
   - localhost 추가
   - 프로덕션 도메인 추가

4. **애플리케이션 테스트**
   ```bash
   npm run dev
   ```
   - 전화번호 로그인 테스트
   - 이메일 로그인 테스트

## 💡 통합 아키텍처

이 프로젝트는 **Supabase + Firebase** 하이브리드 구조입니다:

- **Supabase**: 메인 데이터베이스, 이메일 인증
- **Firebase**: 전화번호 인증, Analytics

```
사용자 인증:
├─ 이메일 로그인 → Supabase Auth
└─ 전화번호 로그인 → Firebase Auth → Supabase 사용자 생성

데이터 저장:
└─ 모든 데이터 → Supabase Database

분석:
└─ 사용자 행동 → Firebase Analytics
```

## 📚 참고 문서

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firebase Authentication 가이드](https://firebase.google.com/docs/auth)
- [Firebase Phone Auth 가이드](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Analytics 가이드](https://firebase.google.com/docs/analytics)

## ✅ 체크리스트

- [x] Firebase 프로젝트 생성
- [x] Firebase Config 환경 변수 설정
- [x] Firebase SDK 초기화 코드 작성
- [x] Analytics 추가
- [ ] Firebase Console에서 Phone 인증 활성화
- [ ] Firebase Console에서 Email 인증 활성화
- [ ] 허용된 도메인 추가
- [ ] 전화번호 로그인 테스트
- [ ] 이메일 로그인 테스트

---

**Firebase 설정이 완료되었습니다!** 🎉

이제 Firebase Console에서 인증 방법을 활성화하고 테스트하세요.
