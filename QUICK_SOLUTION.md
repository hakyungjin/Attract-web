# ⚡ 빠른 해결 방법

## 📱 SMS가 안 와요!

### 🎯 2분 해결책

Firebase 무료 플랜에서는 **실제 SMS가 전송되지 않습니다**.
**테스트 전화번호**를 사용하세요!

---

## 📋 3단계로 해결하기

### 1️⃣ Firebase Console 접속 (30초)

https://console.firebase.google.com/project/campus-4f167/authentication/providers

→ **Phone** 클릭

### 2️⃣ 테스트 전화번호 추가 (1분)

페이지 하단 **"Phone numbers for testing"** 섹션:

```
전화번호: +82 10 1234 5678
인증 코드: 123456
```

**Add** → **Save** 클릭

### 3️⃣ 애플리케이션에서 사용 (30초)

```
1. 전화번호 입력: +82 10 1234 5678
2. "인증 코드 전송" 클릭
3. 인증 코드 입력: 123456
4. 완료! ✅
```

---

## 💡 핵심 포인트

### ✅ 이렇게 하세요

```
테스트 전화번호 사용:
+82 10 1234 5678 → 123456

→ SMS 없이 바로 인증!
→ 무료!
→ 무제한 테스트 가능!
```

### ❌ 피하세요

```
실제 전화번호로 테스트:
→ SMS 안 옴 (무료 플랜 제한)
→ Blaze 플랜 업그레이드 필요
→ 비용 발생
```

---

## 🔗 빠른 링크

**Firebase Phone 설정**:
https://console.firebase.google.com/project/campus-4f167/authentication/providers

**자세한 가이드**:
- [SMS_NOT_ARRIVING.md](SMS_NOT_ARRIVING.md)
- [FIREBASE_PHONE_AUTH_SETUP.md](FIREBASE_PHONE_AUTH_SETUP.md)

---

## ✨ 추가 테스트 번호

여러 개 추가 가능:

| 전화번호 | 코드 |
|---------|------|
| +82 10 1111 1111 | 111111 |
| +82 10 2222 2222 | 222222 |
| +82 10 9999 9999 | 999999 |

---

**이제 개발을 계속하세요!** 🚀
