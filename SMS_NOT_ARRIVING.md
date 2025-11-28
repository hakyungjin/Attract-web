# 📱 SMS가 오지 않는 문제 해결

## 🔍 현재 상황

- ✅ Firebase 연결: 정상
- ✅ Phone 인증 활성화: 완료
- ✅ reCAPTCHA 검증: 통과
- ❌ **실제 SMS**: 도착하지 않음

## 📋 SMS가 오지 않는 이유

### 1. Firebase 무료 플랜 제한

Firebase Spark (무료) 플랜에서는 **실제 SMS 전송이 제한**됩니다.

| 플랜 | SMS 전송 | 비용 |
|------|---------|------|
| Spark (무료) | ⚠️ 제한적 | 무료 |
| Blaze (종량제) | ✅ 가능 | 사용량 기준 |

### 2. 한국 SMS 전송 비활성화

Firebase에서 **한국(+82)으로의 SMS 전송**은:
- Blaze 플랜으로 업그레이드 필요
- 또는 테스트 전화번호 사용

## ✅ 해결 방법

### 방법 1: 테스트 전화번호 사용 (권장) ⭐

**개발 중에는 테스트 전화번호를 사용**하세요. 실제 SMS 없이 인증 가능합니다!

#### 설정 방법

1. **Firebase Console 접속**
   - https://console.firebase.google.com/project/campus-4f167/authentication/providers

2. **Phone 설정 열기**
   - Sign-in method → Phone 클릭

3. **테스트 전화번호 추가**
   - 페이지 하단 **"Phone numbers for testing"** 섹션
   - **전화번호**: `+82 10 1234 5678`
   - **인증 코드**: `123456`
   - **Add** 클릭 → **Save**

4. **애플리케이션에서 사용**
   ```
   전화번호 입력: +82 10 1234 5678
   → SMS 없이 바로 인증 코드 입력
   인증 코드 입력: 123456
   → 로그인 성공! ✅
   ```

#### 장점
- ✅ **무료** (SMS 비용 없음)
- ✅ **즉시 테스트** 가능 (SMS 대기 없음)
- ✅ **안정적** (네트워크/통신사 문제 없음)
- ✅ **빠른 개발** (반복 테스트 쉬움)

### 방법 2: Firebase Blaze 플랜 업그레이드

실제 SMS를 받으려면 **Blaze (종량제) 플랜**으로 업그레이드 필요합니다.

#### 업그레이드 방법

1. **Firebase Console 접속**
   - https://console.firebase.google.com/project/campus-4f167/overview

2. **왼쪽 하단 "Upgrade" 클릭**
   - Upgrade to Blaze 선택

3. **결제 정보 입력**
   - 신용카드 등록 (실제 사용량만 청구)

4. **SMS 비용 확인**
   ```
   한국 SMS 비용 (예상):
   - 인증 SMS: 약 $0.05-0.10 / 건
   - 월 100건 사용 시: 약 $5-10
   ```

#### 주의사항
- ⚠️ **비용 발생**: 사용량에 따라 청구
- ⚠️ **무료 할당량**: Blaze 플랜도 일부 무료 할당량 있음
- ⚠️ **예산 설정**: Firebase Console에서 예산 알림 설정 권장

### 방법 3: 다른 SMS 서비스 통합

Firebase 대신 다른 SMS 서비스를 사용:

- **Twilio**: 한국 SMS 지원, 유료
- **AWS SNS**: Amazon SNS, 유료
- **국내 서비스**: 알리고, 문자나라 등

> 이 방법은 추가 개발 작업이 필요하므로 권장하지 않습니다.

## 🎯 권장 솔루션

### 개발 단계 (현재)

**테스트 전화번호 사용** ⭐
```
전화번호: +82 10 1234 5678
인증 코드: 123456
→ 무료, 빠른 테스트
```

여러 개 추가 가능:
```
+82 10 1111 1111 → 111111
+82 10 2222 2222 → 222222
+82 10 9999 9999 → 999999
```

### 프로덕션 배포 시

1. **Firebase Blaze 플랜 업그레이드**
2. **예산 알림 설정** (월 $10-20 등)
3. **테스트 전화번호 제거** (보안)
4. **실제 사용자 전화번호로 SMS 전송**

## 📝 테스트 전화번호 추가 단계

### 1단계: Firebase Console

https://console.firebase.google.com/project/campus-4f167/authentication/providers

### 2단계: Phone 설정

```
Authentication → Sign-in method → Phone 클릭
```

### 3단계: 테스트 번호 추가

페이지 하단 **"Phone numbers for testing"** 섹션:

| 전화번호 | 인증 코드 | 용도 |
|---------|----------|------|
| +82 10 1234 5678 | 123456 | 기본 테스트 |
| +82 10 1111 1111 | 111111 | 테스트 계정 1 |
| +82 10 2222 2222 | 222222 | 테스트 계정 2 |

**Add** → **Save** 클릭

### 4단계: 애플리케이션 테스트

```
1. 전화번호 입력: +82 10 1234 5678
2. "인증 코드 전송" 클릭
3. SMS 없이 바로 인증 코드 입력: 123456
4. 로그인 성공! ✅
```

## 🔍 현재 상태 확인

### 브라우저 콘솔 확인

개발자 도구 (F12) → Console:

```javascript
// 성공 시 나타나야 할 로그
✅ "reCAPTCHA verified"
✅ "SMS 전송 성공" 또는 "Verification code sent"

// 테스트 번호 사용 시
✅ SMS 실제로 전송되지 않음 (정상)
✅ 인증 코드만 입력하면 됨
```

### 네트워크 탭 확인

개발자 도구 → Network:

```
POST https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode
Status: 200 OK ✅

→ 요청은 성공했으나 실제 SMS는 전송 안 됨
→ 테스트 전화번호 사용 필요
```

## 💡 FAQ

### Q1: 실제 전화번호로 테스트하고 싶어요
**A**: Firebase Blaze 플랜으로 업그레이드하세요. 하지만 개발 중에는 테스트 전화번호가 더 편리합니다.

### Q2: 테스트 전화번호는 몇 개까지 추가 가능한가요?
**A**: Firebase는 프로젝트당 최대 10개의 테스트 전화번호를 지원합니다.

### Q3: 프로덕션 배포 전에 해야 할 일은?
**A**:
1. Blaze 플랜 업그레이드
2. 테스트 전화번호 모두 제거 (보안)
3. SMS 예산 알림 설정

### Q4: SMS 비용은 얼마나 나오나요?
**A**:
- 한국 SMS: 약 $0.05-0.10 / 건
- 월 1000명 가입 시: 약 $50-100
- Firebase Console에서 실시간 모니터링 가능

### Q5: 다른 나라 전화번호는 되나요?
**A**: 네, Firebase는 전 세계 대부분의 국가를 지원합니다. 단, 무료 플랜에서는 제한적입니다.

## 🎬 빠른 시작 가이드

### 지금 바로 사용하기

1. **테스트 전화번호 추가** (2분)
   - Firebase Console → Phone 설정
   - +82 10 1234 5678 → 123456 추가

2. **애플리케이션에서 테스트** (1분)
   - 전화번호: +82 10 1234 5678 입력
   - 인증 코드: 123456 입력
   - 로그인 성공! ✅

3. **개발 계속하기**
   - 테스트 번호로 무제한 테스트 가능
   - 프로덕션 배포 시 Blaze 플랜 고려

## 📚 참고 문서

- [Firebase Phone Auth 테스트](https://firebase.google.com/docs/auth/web/phone-auth#test-with-fictional-phone-numbers)
- [Firebase 요금제](https://firebase.google.com/pricing)
- [SMS 비용 계산기](https://cloud.google.com/products/calculator)

---

## ✅ 요약

**현재 상황**:
- Firebase 연결 정상 ✅
- Phone 인증 활성화 ✅
- 실제 SMS 안 옴 ❌ (무료 플랜 제한)

**해결책**:
1. **테스트 전화번호 사용** ⭐ (권장)
   - 무료, 즉시 사용 가능
   - Firebase Console에서 추가

2. **Blaze 플랜 업그레이드**
   - 실제 SMS 전송 가능
   - 사용량 기준 과금

**추천**: 개발 중에는 **테스트 전화번호** 사용, 배포 시 **Blaze 플랜** 고려

🎉 **테스트 전화번호로 지금 바로 개발을 계속하세요!**
