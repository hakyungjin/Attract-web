# 💳 Firebase Functions 결제 승인 함수 배포 가이드

## 📋 개요

토스페이먼츠 결제 승인을 처리하는 Firebase Cloud Function을 배포합니다.

---

## 🔧 1단계: 의존성 설치

```bash
cd functions
npm install
```

이 명령어는 `@supabase/supabase-js` 패키지를 포함하여 필요한 모든 의존성을 설치합니다.

---

## 🔑 2단계: 환경 변수 설정

Firebase Functions에 다음 환경 변수를 설정해야 합니다:

### Firebase Console에서 설정

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택 (`attract--web`)
3. **Functions** 메뉴 클릭
4. **설정** (톱니바퀴 아이콘) → **환경 변수** 클릭
5. 다음 변수 추가:

| 변수 이름 | 설명 | 예시 |
|---------|------|------|
| `TOSS_SECRET_KEY` | 토스페이먼츠 시크릿 키 | `test_sk_...` 또는 `live_sk_...` |
| `SUPABASE_URL` | Supabase 프로젝트 URL | `https://ytffobltrwkgxiedorsd.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 역할 키 | `eyJhbGci...` |

### Firebase CLI로 설정

```bash
# Firebase CLI 사용
firebase functions:config:set \
  toss.secret_key="test_sk_your_secret_key" \
  supabase.url="https://ytffobltrwkgxiedorsd.supabase.co" \
  supabase.service_role_key="your_service_role_key"
```

**주의**: Firebase Functions v2에서는 환경 변수를 다르게 설정합니다:

```bash
# Firebase Functions v2 환경 변수 설정
firebase functions:secrets:set TOSS_SECRET_KEY
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_SERVICE_ROLE_KEY
```

각 명령어 실행 시 값을 입력하라는 프롬프트가 나타납니다.

---

## 🏗️ 3단계: 빌드

```bash
cd functions
npm run build
```

TypeScript 코드가 JavaScript로 컴파일됩니다.

---

## 🚀 4단계: 배포

### 전체 Functions 배포

```bash
# 루트 디렉토리에서
firebase deploy --only functions --project attract--web
```

### 특정 함수만 배포

```bash
firebase deploy --only functions:confirmPayment --project attract--web
```

---

## 🧪 5단계: 테스트

### 로컬 테스트 (에뮬레이터)

```bash
cd functions
npm run serve
```

에뮬레이터가 실행되면 다음 URL에서 테스트할 수 있습니다:
- 로컬 Functions URL: `http://localhost:5001/attract--web/us-central1/confirmPayment`

### 배포된 함수 테스트

1. Firebase Console → Functions → `confirmPayment` 함수 선택
2. **테스트** 탭에서 테스트 실행
3. 또는 프론트엔드에서 실제 결제 플로우 테스트

---

## 📝 함수 사용 방법

### 프론트엔드에서 호출

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../lib/firebase';

const functions = getFunctions(app);
const confirmPaymentFunction = httpsCallable(functions, 'confirmPayment');

const result = await confirmPaymentFunction({
  orderId: 'ORDER_1234567890',
  paymentKey: 'payment_key_from_toss',
  amount: 5000,
  userId: 'user_id',
  coins: 50,
  bonusCoins: 5,
  packageId: 'basic',
  packageName: '기본 패키지',
});

const data = result.data as any;
if (data.success) {
  console.log('결제 승인 성공:', data.data);
}
```

---

## 🔒 보안 주의사항

### ✅ 권장 사항

1. **환경 변수 보호**
   - 시크릿 키는 절대 코드에 하드코딩하지 않기
   - Firebase Functions의 환경 변수로만 관리

2. **에러 처리**
   - 민감한 정보가 에러 메시지에 포함되지 않도록 주의
   - 로그에는 최소한의 정보만 기록

3. **인증 확인**
   - Firebase Functions는 자동으로 인증된 사용자만 호출 가능
   - 추가 인증이 필요한 경우 `request.auth` 확인

### ❌ 하지 말아야 할 것

1. **시크릿 키 노출**
   - 클라이언트 코드에 시크릿 키 포함 금지
   - GitHub에 환경 변수 파일 커밋 금지

2. **금액 검증 누락**
   - 클라이언트에서 전달된 금액을 그대로 사용하지 않기
   - 서버에서 항상 금액 재확인

---

## 🐛 문제 해결

### 배포 실패 시

1. **권한 확인**
   ```bash
   firebase projects:list
   firebase use attract--web
   ```

2. **로그 확인**
   ```bash
   firebase functions:log --only confirmPayment
   ```

3. **환경 변수 확인**
   - Firebase Console에서 환경 변수가 올바르게 설정되었는지 확인

### 함수 호출 실패 시

1. **네트워크 확인**
   - 브라우저 콘솔에서 네트워크 에러 확인
   - CORS 에러가 있는지 확인

2. **인증 확인**
   - 사용자가 로그인되어 있는지 확인
   - Firebase Auth 토큰이 유효한지 확인

3. **함수 로그 확인**
   ```bash
   firebase functions:log --only confirmPayment --limit 50
   ```

---

## 📊 모니터링

### Firebase Console에서 확인

1. **Functions 대시보드**
   - 호출 횟수
   - 에러율
   - 실행 시간
   - 비용

2. **로그 확인**
   - Firebase Console → Functions → 로그
   - 또는 CLI: `firebase functions:log`

---

## 🔄 Supabase Edge Function과의 차이점

| 항목 | Firebase Functions | Supabase Edge Function |
|------|-------------------|----------------------|
| 런타임 | Node.js | Deno |
| 인증 | Firebase Auth 자동 | 수동 처리 필요 |
| 환경 변수 | Firebase Console | Supabase Dashboard |
| 배포 | `firebase deploy` | `supabase functions deploy` |
| 호출 방법 | `httpsCallable` | `fetch` API |

두 가지 모두 사용 가능하며, 프론트엔드에서 선택적으로 사용할 수 있습니다.

---

## ✅ 체크리스트

- [ ] `functions/package.json`에 `@supabase/supabase-js` 추가됨
- [ ] Firebase Functions 환경 변수 설정 완료
- [ ] `npm install` 완료
- [ ] `npm run build` 성공
- [ ] `firebase deploy --only functions` 성공
- [ ] 테스트 결제 성공 확인
- [ ] 로그에서 에러 없음 확인

---

## 📚 참고 자료

- [Firebase Functions 문서](https://firebase.google.com/docs/functions)
- [Firebase Functions 환경 변수](https://firebase.google.com/docs/functions/config-env)
- [토스페이먼츠 개발자 문서](https://developers.tosspayments.com/)

