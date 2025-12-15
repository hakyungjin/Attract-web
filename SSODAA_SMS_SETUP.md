# 쏘다(Ssodaa) SMS API 설정 가이드

이 문서는 Attract 앱에서 쏘다 SMS API를 사용하여 전화번호 인증, 매칭 알림 등의 SMS 발송 기능을 설정하는 방법을 안내합니다.

## 📋 목차

1. [개요](#개요)
2. [사전 준비](#사전-준비)
3. [쏘다 계정 설정](#쏘다-계정-설정)
4. [환경 변수 설정](#환경-변수-설정)
5. [기능 설명](#기능-설명)
6. [테스트](#테스트)
7. [문제 해결](#문제-해결)

---

## 개요

쏘다 SMS API는 다음과 같은 기능에 사용됩니다:

- ✅ **전화번호 인증**: 회원가입/로그인 시 SMS 인증번호 발송
- 📬 **매칭 요청 알림**: 누군가 매칭을 요청했을 때 SMS 알림
- 💕 **매칭 수락 알림**: 매칭이 성사되었을 때 양쪽 모두에게 SMS 알림

### 기존 알리고 API와의 차이점

| 항목 | 알리고 API | 쏘다 API |
|------|-----------|----------|
| API 방식 | FormData | JSON REST API |
| 설치 필요 | FormData 전송 | 없음 (Full REST) |
| 인증 방식 | API Key + User ID | API Key + Token Key |
| 발신번호 관리 | 웹사이트에서만 | API로도 조회 가능 |
| 문서화 | 보통 | 상세함 |

---

## 사전 준비

1. **쏘다 계정** (https://ssodaa.com)
2. **발신번호 등록** (본인 인증 완료된 전화번호)
3. **충전된 포인트** (SMS 발송 비용)

---

## 쏘다 계정 설정

### 1. 회원가입 및 로그인

1. https://ssodaa.com 접속
2. 회원가입 후 로그인

### 2. API 토큰 발급

1. 로그인 후 **[API 연동 안내]** 메뉴 클릭
2. **[API 토큰 관리]** 페이지로 이동 (`/service/api/setting`)
3. **API 토큰 발급** 버튼 클릭
4. 발급된 정보 저장:
   - `token_key`: 회원 고유 토큰
   - `api_key`: API 요청 헤더에 사용

### 3. 발신번호 등록

1. **[문자 서비스]** → **[발신번호 관리]** 메뉴 클릭 (`/service/sms/sendphone`)
2. **발신번호 추가** 버튼 클릭
3. 인증 방법 선택:
   - **휴대전화 본인인증**: 빠른 인증 (추천)
   - **서류 인증**: 사업자 번호 등 서류 제출
4. 인증 완료 후 승인 대기 (보통 몇 분 ~ 몇 시간 소요)

### 4. 포인트 충전

1. **[요금안내/충전]** → **[발송 포인트 충전]** 메뉴 클릭
2. 필요한 만큼 충전:
   - SMS: 15원/건
   - LMS (장문): 45원/건
   - MMS (멀티미디어): 120원/건

**추천 충전 금액**: 10,000원 (SMS 약 666건)

---

## 환경 변수 설정

### 1. `.env` 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 추가합니다:

```bash
# 쏘다 SMS API Configuration
VITE_SSODAA_API_KEY=your_ssodaa_api_key_here
VITE_SSODAA_TOKEN_KEY=your_ssodaa_token_key_here
VITE_SSODAA_SENDER=01012345678
```

> 참고: 현재 Attract는 **Firebase Cloud Functions에서 쏘다 API를 호출**하도록 구성되어 있습니다.  
> 따라서 운영에서는 아래의 **Firebase 시크릿 설정**이 필수입니다. (`VITE_...`는 프론트 번들에 포함될 수 있어 운영에서는 사용하지 않는 것을 권장)

### 2. 값 설정

1. **VITE_SSODAA_API_KEY**: [API 토큰 관리]에서 발급받은 `api_key`
2. **VITE_SSODAA_TOKEN_KEY**: [API 토큰 관리]에서 발급받은 `token_key`
3. **VITE_SSODAA_SENDER**: [발신번호 관리]에서 등록한 발신번호 (하이픈 없이)

### 예시

```bash
VITE_SSODAA_API_KEY=sk_test_1234567890abcdefghijklmnop
VITE_SSODAA_TOKEN_KEY=tk_live_abcdefghijklmnopqrstuvwxyz
VITE_SSODAA_SENDER=01012345678
```

### 3. Firebase Cloud Functions 시크릿 설정 (운영 필수)

프로젝트 루트에서 아래 명령을 실행해 시크릿을 등록하세요:

```bash
firebase functions:secrets:set SSODAA_API_KEY
firebase functions:secrets:set SSODAA_TOKEN_KEY
firebase functions:secrets:set SSODAA_SENDER
```

#### 시크릿 설정이 안 될 때 (자주 나오는 원인)

- **Firebase CLI 로그인/프로젝트 선택**:
  - `firebase login`
  - `firebase use --add` (프로젝트가 맞는지 확인)
- **권한 문제**: 해당 Google 계정이 프로젝트에 **Owner/Editor** 권한이 없으면 실패합니다.
- **결제(Blaze) 미설정**: Functions v2 + Secret Manager를 쓰는 경우 **Blaze 플랜/결제 연결이 필요**한 케이스가 있습니다.
- **CLI 구버전**:
  - `npm i -g firebase-tools@latest`
  - 또는 `npx firebase-tools@latest functions:secrets:set SSODAA_API_KEY`

#### 시크릿 대신 “서버 환경변수(process.env)”로도 동작하게 해둠

현재 Functions 코드는 시크릿이 막혔을 때를 대비해서, 런타임에 다음 환경변수로도 폴백하도록 되어 있습니다:

- `SSODAA_API_KEY`
- `SSODAA_TOKEN_KEY`
- `SSODAA_SENDER`

그 다음 Functions 배포:

```bash
npm run deploy:functions
```

### 4. 인증번호 문자(템플릿) 커스터마이징

인증문자 형식은 `functions/src/index.ts`의 아래 상수를 수정하면 됩니다:

- `OTP_SMS_TEMPLATE` (예: `"[Attract] 인증번호는 [{code}]입니다. 3분 내에 입력해주세요."`)

---

## 기능 설명

### 1. 전화번호 인증 SMS

**파일**: `src/services/ssodaaSmsService.ts`

```typescript
import { sendVerificationSMS, verifyCode } from '../services/ssodaaSmsService';

// SMS 인증번호 발송
const success = await sendVerificationSMS('01012345678');

// 사용자가 입력한 인증번호 확인
const isValid = await verifyCode('01012345678', '123456');
```

**메시지 예시**:
```
[Attract] 인증번호는 [123456]입니다. 3분 내에 입력해주세요.
```

### 2. 매칭 요청 알림

**파일**: `src/pages/profile-detail/page.tsx`

매칭 요청을 보낼 때 자동으로 수신자에게 SMS가 발송됩니다.

**메시지 예시**:
```
[Attract] 홍길동님이 매칭을 요청했습니다. 앱에서 확인해주세요!
```

### 3. 매칭 수락 알림

**파일**:
- `src/pages/profile-detail/page.tsx` (상호 매칭 성사)
- `src/pages/matching-requests/page.tsx` (매칭 수락)

매칭이 성사되면 양쪽 모두에게 SMS가 발송됩니다.

**메시지 예시**:
```
[Attract] 김철수님이 매칭을 수락했습니다! 이제 채팅을 시작할 수 있어요 💬
```

---

## 테스트

### 1. 개발 환경 테스트

테스트 모드를 사용하면 실제 SMS를 발송하지 않고 콘솔에 인증번호를 출력합니다:

```typescript
import { sendVerificationSMSTest } from '../services/ssodaaSmsService';

// 콘솔에만 출력 (실제 SMS 미발송)
const code = await sendVerificationSMSTest('01012345678');
console.log('테스트 인증번호:', code);
```

**콘솔 출력 예시**:
```
========================================
📱 [테스트 모드] 인증번호: 123456
📞 전화번호: 01012345678
========================================
```

### 2. 실제 SMS 발송 테스트

1. `.env` 파일에 정확한 값 설정
2. 앱 재시작 (`npm run dev`)
3. 회원가입 또는 로그인 시도
4. 본인 전화번호로 SMS 수신 확인

---

## 문제 해결

### ❌ "SMS 설정이 완료되지 않았습니다" 오류

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. `.env` 파일 확인
2. 변수 이름 확인 (`VITE_` 접두사 필수)
3. 앱 재시작

### ❌ "SMS 발송에 실패했습니다" 오류

**원인**:
- API Key 또는 Token Key가 잘못됨
- 발신번호가 등록되지 않음
- 포인트 부족

**해결**:
1. 쏘다 웹사이트에서 API 키 재확인
2. [발신번호 관리]에서 승인 상태 확인
3. [포인트 상세 내역]에서 잔액 확인

### ❌ "전화번호 형식 오류"

**원인**: 발신번호 형식이 올바르지 않음

**해결**:
- `.env`의 `VITE_SSODAA_SENDER`를 하이픈 없이 입력 (예: `01012345678`)

### 📱 SMS가 너무 늦게 도착함

**원인**: 통신사 또는 API 서버 지연

**해결**:
1. 쏘다 웹사이트의 [발송 내역]에서 발송 상태 확인
2. 실패 시 [고객센터] → [1:1 온라인상담] 문의

---

## API 사용량 확인

### 웹사이트에서 확인

1. https://ssodaa.com 로그인
2. **[요금안내/충전]** → **[포인트 상세 내역]** 클릭
3. 발송 건수 및 잔여 포인트 확인

### API로 확인

```typescript
import { getSendPhones } from '../services/ssodaaSmsService';

// 등록된 발신번호 목록 조회
const result = await getSendPhones();
console.log('발신번호 목록:', result.content?.sendphones);
```

---

## 추가 기능

### 예약 발송

특정 시간에 SMS를 발송하려면 `sendTime` 옵션을 사용하세요:

```typescript
import { sendSMS } from '../services/ssodaaSmsService';

await sendSMS('01012345678', '안녕하세요', {
  sendTime: '2025-12-07 14:00:00'
});
```

### 광고 문자 발송

광고성 문자는 무료거부번호가 자동으로 포함됩니다:

```typescript
await sendSMS('01012345678', '특별 할인 안내', {
  isAd: true
});
```

**메시지 예시**:
```
(광고)
특별 할인 안내
무료거부 080-0000-0000
```

### 대량 발송

여러 번호로 동시 발송:

```typescript
import { sendBulkSMS } from '../services/ssodaaSmsService';

await sendBulkSMS(
  ['01012345678', '01087654321', '01011112222'],
  '대량 메시지 내용'
);
```

---

## 참고 자료

- **쏘다 공식 사이트**: https://ssodaa.com
- **API 문서**: https://ssodaa.com/service/api/smsapi
- **고객센터**: https://ssodaa.com/customer/inquiry

---

## 마이그레이션 노트

### 알리고 API → 쏘다 API

기존 `smsService.ts`는 하위 호환성을 위해 유지되지만, 내부적으로 쏘다 API를 사용합니다.

새 코드를 작성할 때는 `ssodaaSmsService.ts`를 직접 import 하세요:

```typescript
// ✅ 권장
import { sendSMS } from '../services/ssodaaSmsService';

// ⚠️ 기존 코드 호환용 (deprecated)
import { sendSMS } from '../services/smsService';
```

---

## 🎉 완료!

이제 Attract 앱에서 쏘다 SMS API를 사용할 수 있습니다!

문제가 발생하면 위의 [문제 해결](#문제-해결) 섹션을 참고하세요.
