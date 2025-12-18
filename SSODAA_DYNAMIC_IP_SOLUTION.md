# 🔧 쏘다 SMS API 동적 IP 문제 해결 가이드

## ⚠️ 문제

Firebase Functions의 IP 주소가 계속 바뀌어서 쏘다 API에서 IP 화이트리스트 등록이 어렵습니다.

---

## ✅ 해결 방법

### 방법 1: 쏘다 API에서 IP 제한 해제 요청 (가장 간단) ⭐

**이 방법을 가장 권장합니다!**

1. **쏘다 고객센터 접속**
   - https://ssodaa.com/customer/inquiry
   - 또는 1:1 온라인 상담

2. **문의 내용 (복사해서 사용하세요)**
   ```
   안녕하세요.

   Firebase Functions(Google Cloud Functions)에서 쏘다 SMS API를 사용하려고 하는데,
   서버 IP 주소가 동적으로 변경되어 IP 화이트리스트 등록이 어렵습니다.

   현재 상황:
   - Firebase Functions 사용 중
   - 서버 IP가 계속 변경됨 (예: 34.96.44.20, 34.97.55.30 등)
   - IP 화이트리스트에 등록해도 다른 IP로 변경되면 오류 발생

   요청사항:
   IP 제한을 해제해주시거나, Google Cloud Functions IP 범위를 허용해주세요.

   API Key와 Token Key로 보안을 관리하고 있으므로,
   IP 제한 없이도 안전하게 사용할 수 있을 것 같습니다.

   감사합니다.
   ```

3. **응답 대기**
   - 보통 1-2일 내에 응답이 옵니다
   - IP 제한이 해제되면 모든 IP에서 사용 가능합니다

---

### 방법 2: Google Cloud IP 범위 등록

쏘다 API에서 IP 범위 등록을 지원한다면:

1. **쏘다 API 대시보드 접속**
   - https://ssodaa.com 로그인
   - **[API 연동 안내]** 또는 **[API 토큰 관리]** 메뉴

2. **IP 범위 등록**
   - **IP 화이트리스트** 또는 **발송서버 IP 등록** 섹션
   - 다음 IP 범위를 모두 등록:
     ```
     34.96.0.0/16
     34.97.0.0/16
     34.98.0.0/16
     34.99.0.0/16
     34.100.0.0/16
     34.101.0.0/16
     34.102.0.0/16
     34.103.0.0/16
     ```
   - 또는 더 넓은 범위: `34.0.0.0/8` (모든 Google Cloud IP)

3. **저장 및 확인**

---

### 방법 3: Cloud NAT 사용 (고급, 비용 발생)

Google Cloud NAT를 사용하여 고정 IP를 할당할 수 있습니다.

**단점**: 
- 추가 비용 발생
- 설정이 복잡함
- VPC 네트워크 구성 필요

**권장하지 않음**: 방법 1이 더 간단하고 비용이 들지 않습니다.

---

## 🎯 권장 해결 방법

### 1순위: 쏘다 고객센터에 IP 제한 해제 요청 ⭐

**이유**:
- 가장 간단하고 빠름
- 비용 없음
- IP가 바뀌어도 문제없음
- API Key와 Token Key로 보안 관리 가능

**문의 링크**: https://ssodaa.com/customer/inquiry

---

## 📝 쏘다 고객센터 문의 템플릿

아래 내용을 복사해서 사용하세요:

```
제목: Firebase Functions 사용으로 IP 제한 해제 요청

안녕하세요.

Firebase Functions(Google Cloud Functions)에서 쏘다 SMS API를 사용하려고 하는데,
서버 IP 주소가 동적으로 변경되어 IP 화이트리스트 등록이 어렵습니다.

현재 상황:
- Firebase Functions 사용 중
- 서버 IP가 계속 변경됨 (예: 34.96.44.20, 34.97.55.30 등)
- IP 화이트리스트에 등록해도 다른 IP로 변경되면 오류 발생

요청사항:
IP 제한을 해제해주시거나, Google Cloud Functions IP 범위를 허용해주세요.

API Key와 Token Key로 보안을 관리하고 있으므로,
IP 제한 없이도 안전하게 사용할 수 있을 것 같습니다.

감사합니다.
```

---

## ✅ 확인 방법

IP 제한 해제 후:

1. Functions 재배포 (필요한 경우)
2. SMS 발송 테스트
3. Functions 로그 확인:
   ```powershell
   firebase functions:log --only sendVerificationSMS
   ```

---

## 🔒 보안 고려사항

IP 제한을 해제해도 안전한 이유:

1. **API Key 보호**: 환경 변수로 관리, 코드에 노출되지 않음
2. **Token Key 보호**: 환경 변수로 관리, 코드에 노출되지 않음
3. **HTTPS 사용**: 모든 통신은 암호화됨
4. **Firebase Functions 보안**: Google의 보안 인프라 사용

---

## 💡 추가 정보

- **쏘다 공식 사이트**: https://ssodaa.com
- **쏘다 고객센터**: https://ssodaa.com/customer/inquiry
- **API 문서**: https://ssodaa.com/service/api/smsapi

---

## 🚀 빠른 해결

**지금 바로 할 일**:

1. https://ssodaa.com/customer/inquiry 접속
2. 위의 문의 템플릿 복사해서 문의하기
3. 1-2일 내 응답 대기
4. IP 제한 해제 확인 후 SMS 발송 테스트
