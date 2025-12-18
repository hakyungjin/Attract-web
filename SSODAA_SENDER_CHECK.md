# 🔍 쏘다 SMS 발신번호 확인 가이드

## ⚠️ 문제

개인 번호가 승인되어 있는데도 "회신번호 차단(개인)" 오류가 발생합니다.

---

## 🔍 확인 사항

### 1. 쏘다 대시보드에서 승인된 발신번호 확인

1. **쏘다 웹사이트 접속**
   - https://ssodaa.com 로그인

2. **발신번호 관리 페이지로 이동**
   - **[문자 서비스]** → **[발신번호 관리]** 메뉴 클릭
   - 또는 직접: https://ssodaa.com/service/sms/sendphone

3. **승인된 발신번호 확인**
   - 목록에서 **"승인"** 상태인 발신번호 확인
   - 정확한 번호를 복사 (하이픈 포함 여부 확인)

---

### 2. Firebase Functions 환경 변수 확인

#### Google Cloud Console에서 확인

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/functions/list?project=attract--web

2. **각 함수의 환경 변수 확인**
   - `sendVerificationSMS` 함수 클릭
   - **편집** → **환경 변수, 시크릿 및 네트워크**
   - `SSODAA_SENDER` 값 확인

3. **발신번호 형식 확인**
   - ✅ 올바른 형식: `01012345678` (하이픈 없이)
   - ❌ 잘못된 형식: `010-1234-5678` (하이픈 포함)
   - ❌ 잘못된 형식: `+821012345678` (+82 포함)

---

### 3. Functions 로그에서 확인

```powershell
firebase functions:log --only sendVerificationSMS
```

로그에서 다음을 확인:
- `originalSender`: 환경 변수에서 읽은 원본 값
- `normalizedSender`: 하이픈 제거 후 실제 사용되는 값
- 쏘다 대시보드의 승인된 번호와 일치하는지 확인

---

## ✅ 해결 방법

### 방법 1: 환경 변수 발신번호 수정

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/functions/list?project=attract--web

2. **각 함수의 환경 변수 수정**
   - `sendVerificationSMS` 함수 클릭
   - **편집** → **환경 변수, 시크릿 및 네트워크**
   - `SSODAA_SENDER` 값 수정:
     - 쏘다 대시보드의 승인된 발신번호와 정확히 일치하도록
     - 하이픈 없이 입력 (예: `01012345678`)
   - **배포** 버튼 클릭

3. **다른 함수들도 동일하게 수정**
   - `verifyCode` 함수
   - `confirmPayment` 함수

---

### 방법 2: 발신번호 형식 확인

쏘다 대시보드에서 승인된 발신번호가:
- `010-1234-5678` 형식이면 → 환경 변수에 `01012345678`로 입력
- `01012345678` 형식이면 → 환경 변수에 `01012345678`로 입력
- `+821012345678` 형식이면 → 환경 변수에 `01012345678`로 입력

**중요**: 항상 하이픈 없이 숫자만 입력하세요!

---

### 방법 3: 쏘다 대시보드에서 발신번호 재확인

1. **발신번호 관리 페이지**
   - https://ssodaa.com/service/sms/sendphone

2. **승인된 발신번호 확인**
   - 상태가 "승인"인지 확인
   - 발신번호를 정확히 복사

3. **환경 변수와 비교**
   - Google Cloud Console의 `SSODAA_SENDER` 값
   - 쏘다 대시보드의 승인된 발신번호
   - 두 값이 정확히 일치하는지 확인

---

## 🔍 디버깅 로그 확인

Functions 로그에서 다음 정보를 확인하세요:

```powershell
firebase functions:log --only sendVerificationSMS
```

로그에서 확인할 항목:
- `originalSender`: 환경 변수 원본 값
- `normalizedSender`: 실제 API에 전송되는 값
- `send_phone`: API 요청에 포함된 발신번호

이 값들이 쏘다 대시보드의 승인된 발신번호와 일치해야 합니다.

---

## 📝 체크리스트

- [ ] 쏘다 대시보드에서 승인된 발신번호 확인
- [ ] Google Cloud Console에서 `SSODAA_SENDER` 환경 변수 확인
- [ ] 발신번호 형식 확인 (하이픈 없이 숫자만)
- [ ] 두 값이 정확히 일치하는지 확인
- [ ] Functions 로그에서 실제 사용되는 발신번호 확인
- [ ] 불일치 시 환경 변수 수정 후 재배포

---

## 💡 주의사항

1. **발신번호 형식**
   - 쏘다 API는 하이픈 없이 숫자만 받습니다
   - `01012345678` 형식으로 입력하세요

2. **대소문자 구분 없음**
   - 발신번호는 숫자이므로 대소문자 문제 없음

3. **공백 주의**
   - 발신번호 앞뒤에 공백이 없어야 합니다
   - ` 01012345678 ` (X)
   - `01012345678` (O)

---

## 🚀 빠른 확인

1. 쏘다 대시보드: 승인된 발신번호 복사
2. Google Cloud Console: `SSODAA_SENDER` 값 확인
3. 두 값 비교: 정확히 일치하는지 확인
4. 불일치 시: 환경 변수 수정 후 재배포

