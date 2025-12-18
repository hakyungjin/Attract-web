# ✅ Firebase Functions v2 환경 변수 해결 방법

## 🔍 확인 사항

**`process.env`가 맞습니다!** Firebase Functions v2에서는 `process.env`를 사용합니다.

문제는 **배포 환경에서 환경 변수가 설정되지 않았기 때문**입니다.

---

## ✅ 해결 방법: Google Cloud Console에서 환경 변수 설정

### 1단계: Google Cloud Console 접속

**직접 링크**:
https://console.cloud.google.com/functions/list?project=attract--web

### 2단계: 각 함수에 환경 변수 추가

다음 3개 함수 모두에 환경 변수를 추가해야 합니다:

1. **`sendVerificationSMS`**
2. **`verifyCode`**  
3. **`confirmPayment`**

### 3단계: 환경 변수 설정 방법

각 함수마다:

1. 함수 이름 클릭
2. **편집** 버튼 클릭
3. **환경 변수, 시크릿 및 네트워크** 섹션 확장
4. **환경 변수 추가** 클릭
5. 다음 4개 변수 추가:

   ```
   SSODAA_API_KEY = (값)
   SSODAA_TOKEN_KEY = (값)
   SSODAA_SENDER = (값)
   TOSS_SECRET_KEY = (값)
   ```

6. **배포** 버튼 클릭

---

## 📝 코드 확인

현재 코드는 올바릅니다:

```typescript
// ✅ 이것이 맞습니다!
const API_KEY = process.env.SSODAA_API_KEY;
const TOKEN_KEY = process.env.SSODAA_TOKEN_KEY;
const SENDER = process.env.SSODAA_SENDER;
```

Firebase Functions v2에서는:
- ✅ `process.env` 사용 (맞음)
- ❌ `functions.config()` 사용 안 함 (v1 방식)
- ❌ `im.env` 없음 (오타)

---

## 🔄 로컬 vs 배포 환경

### 로컬 개발 환경
- `.env` 파일 사용
- `dotenv.config()`로 로드
- `process.env`로 접근

### 배포 환경
- Google Cloud Console에서 환경 변수 설정
- 자동으로 `process.env`에 로드됨
- `.env` 파일은 포함되지 않음

---

## ✅ 확인 방법

환경 변수 설정 후:

```powershell
firebase functions:log --only sendVerificationSMS
```

로그에서 디버깅 정보를 확인하세요:
- `hasApiKey: true`
- `hasTokenKey: true`
- `hasSender: true`

---

## 💡 요약

1. **코드는 올바릅니다** - `process.env` 사용이 맞습니다
2. **문제는 환경 변수 미설정** - Google Cloud Console에서 설정 필요
3. **각 함수마다 설정** - 3개 함수 모두에 동일한 환경 변수 추가

