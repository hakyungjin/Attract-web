# Firebase Functions 배포 가이드

## 🔐 권한 오류 해결

### 오류 메시지
```
Error: Missing permissions required for functions deploy. 
You must have permission iam.serviceAccounts.ActAs on service account yes@appspot.gserviceaccount.com.
```

### 해결 방법

#### 1. 올바른 프로젝트 확인
```powershell
firebase projects:list
firebase use attract--web
```

#### 2. Google Cloud Console에서 권한 설정

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/iam-admin/iam?project=attract--web

2. **IAM 페이지에서 권한 확인**
   - 현재 로그인한 계정 찾기
   - 역할에 "Service Account User" 또는 "Editor" 추가

3. **또는 프로젝트 소유자에게 요청**
   - 프로젝트 소유자가 다음 역할을 부여해야 합니다:
     - "Service Account User" 역할
     - 또는 "Cloud Functions Admin" 역할

#### 3. Firebase CLI 재로그인
```powershell
firebase logout
firebase login
```

#### 4. Functions 배포 재시도
```powershell
cd functions
npm install
npm run build
firebase deploy --only functions --project attract--web
```

---

## 📦 Functions 배포 단계

### 1. 의존성 설치
```powershell
cd functions
npm install
```

### 2. 환경 변수 설정

Firebase Console에서 환경 변수 설정:
1. https://console.firebase.google.com/project/attract--web/functions
2. 설정 → 환경 변수
3. 다음 변수 추가:
   - `SSODAA_API_KEY`: 쏘다 API 키
   - `SSODAA_TOKEN_KEY`: 쏘다 토큰 키
   - `SSODAA_SENDER`: 발신번호 (예: 01012345678)

또는 로컬에서 설정:
```powershell
firebase functions:config:set ssodaa.api_key="YOUR_API_KEY" ssodaa.token_key="YOUR_TOKEN_KEY" ssodaa.sender="YOUR_SENDER"
```

### 3. 빌드
```powershell
cd functions
npm run build
```

### 4. 배포
```powershell
# Functions만 배포
firebase deploy --only functions --project attract--web

# 또는 루트에서
firebase deploy --only functions
```

---

## ✅ 배포 확인

배포 후 다음 URL에서 Functions 확인:
- https://console.firebase.google.com/project/attract--web/functions

Functions 목록:
- `sendVerificationSMS` - SMS 인증번호 발송
- `verifyCode` - 인증번호 확인

---

## 🔧 문제 해결

### 권한 오류가 계속 발생하는 경우

1. **프로젝트 소유자 확인**
   ```powershell
   firebase projects:list
   ```

2. **Google Cloud Console에서 직접 확인**
   - https://console.cloud.google.com/iam-admin/iam?project=attract--web
   - 현재 계정의 역할 확인

3. **프로젝트 소유자에게 요청**
   - "Service Account User" 역할 부여 요청
   - 또는 "Cloud Functions Admin" 역할 부여 요청

### Functions가 배포되지 않는 경우

1. **빌드 오류 확인**
   ```powershell
   cd functions
   npm run build
   ```

2. **TypeScript 오류 확인**
   - `functions/src/index.ts` 파일 확인
   - 모든 import가 올바른지 확인

3. **의존성 확인**
   ```powershell
   cd functions
   npm install
   ```

---

## 📝 참고

- Functions 배포는 Google Cloud Platform 권한이 필요합니다
- 프로젝트 소유자가 아닌 경우 권한 요청이 필요합니다
- 배포 후 Functions는 자동으로 HTTPS 엔드포인트를 받습니다

