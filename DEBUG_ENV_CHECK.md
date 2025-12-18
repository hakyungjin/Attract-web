# 🔍 환경 변수 디버깅 가이드

## 문제 상황

환경 변수가 로드되었다고 나오지만 실제로는 값이 없는 경우

## 해결 방법

### 1단계: Functions 재배포

디버깅 로그가 추가된 코드를 배포합니다:

```powershell
cd functions
npm run build
firebase deploy --only functions --project attract--web
```

### 2단계: 로그 확인

```powershell
firebase functions:log --only sendVerificationSMS
```

로그에서 다음 정보를 확인하세요:
- `hasApiKey`: true/false
- `hasTokenKey`: true/false  
- `hasSender`: true/false
- `allEnvKeys`: 실제로 로드된 환경 변수 이름 목록

### 3단계: 원인 파악

#### 경우 1: `allEnvKeys`가 비어있음
→ Firebase Console 또는 Google Cloud Console에서 환경 변수를 설정해야 합니다.

#### 경우 2: `allEnvKeys`에 다른 이름의 변수가 있음
→ 변수 이름이 다를 수 있습니다. 예: `SSODAA_API_KEY` 대신 `SSODAA_APIKEY`

#### 경우 3: 값이 있지만 빈 문자열
→ 환경 변수는 설정되어 있지만 값이 비어있습니다. 값을 다시 확인하세요.

---

## 예상되는 로그 출력

### 정상적인 경우:
```
환경 변수 확인: {
  hasApiKey: true,
  hasTokenKey: true,
  hasSender: true,
  apiKeyLength: 32,
  tokenKeyLength: 64,
  senderValue: "01012345678",
  allEnvKeys: ["SSODAA_API_KEY", "SSODAA_TOKEN_KEY", "SSODAA_SENDER", "TOSS_SECRET_KEY"]
}
```

### 문제가 있는 경우:
```
환경 변수 확인: {
  hasApiKey: false,
  hasTokenKey: false,
  hasSender: false,
  apiKeyLength: 0,
  tokenKeyLength: 0,
  senderValue: "없음",
  allEnvKeys: []  // 또는 다른 이름의 변수들
}
```

---

## 다음 단계

로그를 확인한 후 결과를 알려주시면 정확한 해결 방법을 제시하겠습니다!

