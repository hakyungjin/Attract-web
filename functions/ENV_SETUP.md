# 🔐 Firebase Functions 환경 변수 설정

## 📋 개요

Firebase Functions에서 토스페이먼츠 시크릿 키를 환경 변수로 관리합니다.

---

## ⚙️ 환경 변수 설정 방법

### 방법 1: `.env` 파일 사용 (로컬 개발 및 빌드 시)

1. `functions` 폴더에 `.env` 파일 생성:
   ```bash
   cd functions
   cp .env.example .env
   ```

2. `.env` 파일 편집하여 실제 키 입력:
   ```env
   # 토스페이먼츠 시크릿 키
   TOSS_SECRET_KEY=test_sk_your_actual_secret_key_here

   # 쏘다 SMS API (이미 있을 수 있음)
   SSODAA_API_KEY=your_ssodaa_api_key
   SSODAA_TOKEN_KEY=your_ssodaa_token_key
   SSODAA_SENDER=your_ssodaa_sender
   ```

3. 빌드 및 배포:
   ```bash
   npm run build
   firebase deploy --only functions
   ```

**중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

### 방법 2: 빌드 시 환경 변수 전달

빌드 시 환경 변수를 직접 전달:

```bash
# Windows PowerShell
$env:TOSS_SECRET_KEY="test_sk_your_secret_key"; npm run build

# Windows CMD
set TOSS_SECRET_KEY=test_sk_your_secret_key && npm run build

# Linux/Mac
TOSS_SECRET_KEY=test_sk_your_secret_key npm run build
```

### 방법 3: Firebase Console 환경 변수 (권장)

Firebase Functions는 배포 시 Firebase Console의 환경 변수를 자동으로 사용합니다:

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택 (`attract--web`)
3. **Functions** → **설정** → **환경 변수**
4. **환경 변수 추가**:
   - 이름: `TOSS_SECRET_KEY`
   - 값: 발급받은 시크릿 키

이 방법이 가장 안전하며, 코드에 키가 포함되지 않습니다.

---

## 🔒 보안 주의사항

### ⚠️ 경고

환경 변수를 빌드에 포함시키면:
- 빌드된 JavaScript 파일에 키가 포함될 수 있음
- Git에 실수로 커밋될 위험
- 코드 리뷰 시 키 노출 가능

### ✅ 권장 방법

1. **Firebase Console 환경 변수 사용** (가장 안전)
2. `.env` 파일은 `.gitignore`에 포함 확인
3. 프로덕션 키는 절대 코드에 포함하지 않기

---

## 📝 .gitignore 확인

`functions/.gitignore` 파일에 다음이 포함되어 있는지 확인:

```
.env
.env.local
.env.*.local
```

---

## 🧪 테스트

환경 변수가 제대로 로드되었는지 확인:

```typescript
// functions/src/index.ts에서
console.log('TOSS_SECRET_KEY:', process.env.TOSS_SECRET_KEY ? '설정됨' : '미설정');
```

---

## 🚀 배포

```bash
cd functions
npm install
npm run build
firebase deploy --only functions --project attract--web
```

