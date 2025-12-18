# ✅ Firebase Functions v2 환경 변수 설정 완료

## 🔄 변경 사항

Firebase Functions v2의 공식 방법인 `defineString`을 사용하도록 코드를 변경했습니다.

### 변경 전 (잘못된 방법)
```typescript
const API_KEY = process.env.SSODAA_API_KEY;
```

### 변경 후 (올바른 방법)
```typescript
import {defineString} from "firebase-functions/params";

// 파일 상단에서 정의
const ssodaaApiKey = defineString('SSODAA_API_KEY');

// 함수 내에서 사용
const API_KEY = ssodaaApiKey.value();
```

---

## 📝 설정된 환경 변수

다음 4개의 환경 변수가 `defineString`으로 정의되었습니다:

1. `SSODAA_API_KEY` - 쏘다 SMS API 키
2. `SSODAA_TOKEN_KEY` - 쏘다 SMS 토큰 키
3. `SSODAA_SENDER` - 쏘다 SMS 발신번호
4. `TOSS_SECRET_KEY` - 토스페이먼츠 시크릿 키

---

## 🚀 배포 방법

### 1단계: Google Cloud Console에서 환경 변수 설정

1. https://console.cloud.google.com/functions/list?project=attract--web 접속
2. 각 함수(`sendVerificationSMS`, `verifyCode`, `confirmPayment`) 클릭
3. **편집** → **환경 변수, 시크릿 및 네트워크**
4. 다음 환경 변수 추가:
   - `SSODAA_API_KEY`
   - `SSODAA_TOKEN_KEY`
   - `SSODAA_SENDER`
   - `TOSS_SECRET_KEY`
5. **배포** 버튼 클릭

### 2단계: Functions 재배포

```powershell
cd functions
npm run build
firebase deploy --only functions --project attract--web
```

---

## ✅ 장점

### `defineString` 사용의 장점

1. **타입 안전성**: TypeScript에서 타입 체크 가능
2. **자동 검증**: 환경 변수가 없으면 배포 시 경고
3. **공식 방법**: Firebase Functions v2의 권장 방법
4. **로컬 개발 지원**: `.env` 파일과 자동 연동

---

## 🔍 로컬 개발

로컬 개발 시에는 `.env` 파일을 사용합니다:

```env
SSODAA_API_KEY=your_api_key
SSODAA_TOKEN_KEY=your_token_key
SSODAA_SENDER=01012345678
TOSS_SECRET_KEY=test_sk_...
```

`defineString`은 로컬에서도 `.env` 파일의 값을 자동으로 읽습니다.

---

## 📚 참고 자료

- [Firebase Functions v2 Parameters 문서](https://firebase.google.com/docs/functions/config-env)
- [defineString API 문서](https://firebase.google.com/docs/reference/functions/params.definestring)

---

## ✅ 완료 체크리스트

- [x] `defineString` import 추가
- [x] 환경 변수 정의 (파일 상단)
- [x] `sendVerificationSMS` 함수 수정
- [x] `confirmPayment` 함수 수정
- [ ] Google Cloud Console에서 환경 변수 설정
- [ ] Functions 재배포
- [ ] 테스트 및 확인

