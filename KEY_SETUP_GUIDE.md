# 🔑 토스페이먼츠 키 설정 가이드

## 📋 필요한 키

토스페이먼츠를 사용하려면 다음 두 가지 키가 필요합니다:

1. **클라이언트 키 (Client Key)**: 프론트엔드에서 사용 (`test_ck_...` 또는 `live_ck_...`)
2. **시크릿 키 (Secret Key)**: Firebase Functions에서 사용 (`test_sk_...` 또는 `live_sk_...`)

---

## 🔑 1단계: 토스페이먼츠 키 발급

### 1. 토스페이먼츠 개발자센터 접속

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속
2. 회원가입 또는 로그인

### 2. 테스트 키 발급

1. 대시보드에서 **"내 상점"** 메뉴 클릭
2. **"테스트 모드"** 활성화
3. **"시크릿 키"** 메뉴에서 다음 키 확인:
   - **클라이언트 키**: `test_ck_...`로 시작
   - **시크릿 키**: `test_sk_...`로 시작

---

## ⚙️ 2단계: 프론트엔드 환경 변수 설정

### `.env` 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 토스페이먼츠 클라이언트 키 (테스트)
VITE_TOSS_CLIENT_KEY=test_ck_your_actual_client_key_here

# Firebase 설정 (이미 있을 수 있음)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# SMS API (Ssodaa) - 이미 있을 수 있음
VITE_SSODAA_API_KEY=your_ssodaa_api_key
VITE_SSODAA_TOKEN_KEY=your_ssodaa_token_key
VITE_SSODAA_SENDER=your_ssodaa_sender
```

**중요**: 
- `test_ck_your_actual_client_key_here`를 발급받은 실제 클라이언트 키로 교체하세요
- `.env` 파일은 절대 Git에 커밋하지 마세요 (`.gitignore`에 포함되어 있음)

### 빠른 설정 방법

1. 프로젝트 루트에서 `.env.template` 파일을 복사:
   ```bash
   cp .env.template .env
   ```

2. `.env` 파일을 열고 `VITE_TOSS_CLIENT_KEY` 값을 실제 키로 교체

3. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

---

## 🔐 3단계: Firebase Functions 환경 변수 설정

Firebase Functions에서 토스페이먼츠 시크릿 키를 설정해야 합니다.

### 방법 1: Firebase Console에서 설정 (권장)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택 (`attract--web`)
3. **Functions** 메뉴 클릭
4. **설정** (톱니바퀴 아이콘) → **환경 변수** 클릭
5. **환경 변수 추가** 클릭
6. 다음 정보 입력:
   - **이름**: `TOSS_SECRET_KEY`
   - **값**: 발급받은 시크릿 키 (`test_sk_...`로 시작)
7. **저장** 클릭

### 방법 2: Firebase CLI로 설정

```bash
# Firebase CLI 사용
firebase functions:secrets:set TOSS_SECRET_KEY
```

명령어 실행 시 값을 입력하라는 프롬프트가 나타납니다. 발급받은 시크릿 키를 입력하세요.

---

## ✅ 4단계: 설정 확인

### 프론트엔드 확인

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저 콘솔에서 확인:
   ```javascript
   console.log('TOSS_CLIENT_KEY:', import.meta.env.VITE_TOSS_CLIENT_KEY);
   ```
   
   키가 표시되면 정상입니다.

### Firebase Functions 확인

1. Firebase Console → Functions → 로그 확인
2. 또는 Functions 배포 후 테스트 결제 시도

---

## 🧪 5단계: 테스트

### 테스트 카드 정보

토스페이먼츠 테스트 모드에서는 다음 테스트 카드 정보를 사용할 수 있습니다:

**성공 케이스**:
- 카드번호: `1234-5678-9012-3456`
- 유효기간: `12/34`
- CVV: `123`
- 비밀번호: `123456`

### 테스트 절차

1. 코인샵 페이지 접속: `/coin-shop`
2. 패키지 선택
3. 결제 수단 선택 (카드 또는 토스페이)
4. 테스트 카드 정보 입력
5. 결제 완료 확인

---

## 🔒 보안 주의사항

### ❌ 절대 하면 안 되는 것

1. **시크릿 키를 클라이언트에 노출**
   - 시크릿 키는 절대 `.env` 파일에 `VITE_` 접두사로 추가하지 마세요
   - 시크릿 키는 Firebase Functions의 환경 변수로만 관리

2. **환경 변수 파일을 Git에 커밋**
   - `.env` 파일은 `.gitignore`에 포함되어 있어야 함

3. **프로덕션 키를 테스트 환경에서 사용**
   - 테스트와 프로덕션 키를 분리하여 관리

### ✅ 권장 사항

1. **환경별 키 분리**
   - 테스트: `test_ck_...`, `test_sk_...`
   - 프로덕션: `live_ck_...`, `live_sk_...`

2. **키 관리**
   - 키는 안전한 곳에 보관
   - 정기적으로 키 로테이션

---

## 🐛 문제 해결

### 환경 변수가 undefined로 표시될 때

1. **개발 서버 재시작**
   ```bash
   # .env 파일 수정 후 반드시 재시작
   npm run dev
   ```

2. **환경 변수 이름 확인**
   - Vite에서는 `VITE_` 접두사 필수
   - `VITE_TOSS_CLIENT_KEY` ✅
   - `TOSS_CLIENT_KEY` ❌ (작동 안 함)

3. **파일 위치 확인**
   - `.env` 파일은 프로젝트 루트에 있어야 함

### Firebase Functions에서 키를 찾을 수 없을 때

1. Firebase Console에서 환경 변수 확인
2. Functions 재배포:
   ```bash
   cd functions
   firebase deploy --only functions
   ```

---

## 📚 참고 자료

- [토스페이먼츠 개발자 문서](https://developers.tosspayments.com/)
- [토스페이먼츠 SDK 문서](https://docs.tosspayments.com/sdk)
- [Firebase Functions 환경 변수](https://firebase.google.com/docs/functions/config-env)

---

## ✅ 체크리스트

- [ ] 토스페이먼츠 개발자센터에서 테스트 키 발급
- [ ] `.env` 파일 생성 및 `VITE_TOSS_CLIENT_KEY` 설정
- [ ] Firebase Console에서 `TOSS_SECRET_KEY` 환경 변수 설정
- [ ] 개발 서버 재시작
- [ ] 브라우저 콘솔에서 키 확인
- [ ] 테스트 결제 성공 확인

