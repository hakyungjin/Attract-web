# 🔐 Firebase Functions 환경 변수 설정 가이드

## ⚠️ 문제 상황

Firebase Functions 배포 후 환경 변수가 로드되지 않는 오류:
```
Error: 쏘다 SMS API 설정이 누락되었습니다.
{"hasApiKey":false,"hasTokenKey":false,"hasSender":false}
```

## 🔍 원인

Firebase Functions는 배포 시 `.env` 파일을 자동으로 포함하지 않습니다. `.env` 파일은 로컬 개발용이며, 배포된 함수에서는 Firebase Console의 환경 변수를 사용해야 합니다.

---

## ✅ 해결 방법

### 방법 1: Firebase Console에서 설정 (가장 간단)

1. **Firebase Console 접속**
   - https://console.firebase.google.com/project/attract--web/functions

2. **환경 변수 설정**
   - 왼쪽 메뉴에서 **Functions** 클릭
   - 상단의 **설정** (톱니바퀴 아이콘) 클릭
   - **환경 변수** 탭 클릭
   - **환경 변수 추가** 버튼 클릭

3. **다음 변수들을 하나씩 추가**:

   | 변수 이름 | 설명 | 예시 |
   |----------|------|------|
   | `SSODAA_API_KEY` | 쏘다 API 키 | `your_api_key_here` |
   | `SSODAA_TOKEN_KEY` | 쏘다 토큰 키 | `your_token_key_here` |
   | `SSODAA_SENDER` | 발신번호 | `01012345678` |
   | `TOSS_SECRET_KEY` | 토스페이먼츠 시크릿 키 | `test_sk_...` |

4. **각 변수 추가 후 저장**

5. **Functions 재배포** (환경 변수 변경 후 필수)
   ```powershell
   firebase deploy --only functions --project attract--web
   ```

---

### 방법 2: Firebase CLI로 설정 (PowerShell)

```powershell
# 쏘다 SMS API 설정
firebase functions:config:set ssodaa.api_key="YOUR_API_KEY" --project attract--web
firebase functions:config:set ssodaa.token_key="YOUR_TOKEN_KEY" --project attract--web
firebase functions:config:set ssodaa.sender="YOUR_SENDER" --project attract--web

# 토스페이먼츠 시크릿 키 설정
firebase functions:config:set toss.secret_key="YOUR_SECRET_KEY" --project attract--web

# Functions 재배포
firebase deploy --only functions --project attract--web
```

**주의**: Firebase Functions v2에서는 `functions:config:set` 대신 **Firebase Console**에서 직접 설정하는 것이 더 안전합니다.

---

### 방법 3: Firebase Secrets 사용 (보안 강화)

민감한 정보는 Secrets로 관리하는 것이 더 안전합니다:

```powershell
# Secret 생성 (각각 실행 시 값 입력 프롬프트)
firebase functions:secrets:set SSODAA_API_KEY --project attract--web
firebase functions:secrets:set SSODAA_TOKEN_KEY --project attract--web
firebase functions:secrets:set SSODAA_SENDER --project attract--web
firebase functions:secrets:set TOSS_SECRET_KEY --project attract--web
```

그리고 `functions/src/index.ts`에서 Secrets를 사용하도록 수정해야 합니다:

```typescript
// Secrets 사용 예시 (현재는 일반 환경 변수 사용)
const API_KEY = process.env.SSODAA_API_KEY;
```

---

## 🔄 코드 수정 필요 여부

현재 코드는 `process.env.SSODAA_API_KEY`를 사용하므로, **방법 1 (Firebase Console)**을 사용하면 코드 수정 없이 바로 작동합니다.

---

## ✅ 설정 확인 방법

### 1. Firebase Console에서 확인

1. Firebase Console → Functions → 설정 → 환경 변수
2. 설정한 변수들이 모두 표시되는지 확인

### 2. Functions 로그 확인

```powershell
firebase functions:log --only sendVerificationSMS
```

환경 변수가 제대로 설정되었다면 오류가 사라집니다.

### 3. 실제 테스트

앱에서 SMS 인증을 시도하여 정상 작동하는지 확인합니다.

---

## 📝 빠른 설정 체크리스트

- [ ] Firebase Console 접속
- [ ] Functions → 설정 → 환경 변수
- [ ] `SSODAA_API_KEY` 추가
- [ ] `SSODAA_TOKEN_KEY` 추가
- [ ] `SSODAA_SENDER` 추가
- [ ] `TOSS_SECRET_KEY` 추가 (결제 기능 사용 시)
- [ ] Functions 재배포: `firebase deploy --only functions`
- [ ] 로그 확인: `firebase functions:log --only sendVerificationSMS`

---

## 🚨 주의사항

1. **환경 변수 변경 후 반드시 재배포 필요**
   - 환경 변수를 변경한 후 Functions를 재배포하지 않으면 변경사항이 적용되지 않습니다.

2. **`.env` 파일은 로컬 개발용**
   - `.env` 파일은 로컬에서 `firebase emulators:start`로 테스트할 때만 사용됩니다.
   - 배포된 함수에서는 Firebase Console의 환경 변수를 사용합니다.

3. **보안**
   - 환경 변수에 민감한 정보가 포함되어 있으므로 절대 Git에 커밋하지 마세요.
   - `.env` 파일은 이미 `.gitignore`에 포함되어 있습니다.

---

## 🔗 참고 링크

- [Firebase Functions 환경 변수 문서](https://firebase.google.com/docs/functions/config-env)
- [Firebase Console](https://console.firebase.google.com/project/attract--web/functions)

