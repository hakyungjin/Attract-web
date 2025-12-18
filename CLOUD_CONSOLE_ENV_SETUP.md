# 🚀 Google Cloud Console에서 환경 변수 설정하기

Firebase Console에서 환경 변수 설정이 보이지 않을 때 사용하는 방법입니다.

---

## 📍 단계별 가이드

### 1단계: Google Cloud Console 접속

**직접 링크**:
https://console.cloud.google.com/functions/list?project=attract--web

또는:
1. https://console.cloud.google.com 접속
2. 프로젝트 선택: `attract--web`
3. 왼쪽 메뉴에서 **Cloud Functions** 클릭

### 2단계: 함수 선택

1. 함수 목록에서 **`sendVerificationSMS`** 클릭
2. 또는 **`verifyCode`**, **`confirmPayment`** 함수도 동일하게 설정

### 3단계: 환경 변수 추가

1. 함수 상세 페이지에서 **편집** 버튼 클릭
2. **환경 변수, 시크릿 및 네트워크** 섹션 찾기
3. **환경 변수 추가** 버튼 클릭
4. 다음 변수들을 **하나씩** 추가:

   ```
   이름: SSODAA_API_KEY
   값: (쏘다 API 키 입력)
   ```

   ```
   이름: SSODAA_TOKEN_KEY
   값: (쏘다 토큰 키 입력)
   ```

   ```
   이름: SSODAA_SENDER
   값: (발신번호, 예: 01012345678)
   ```

   ```
   이름: TOSS_SECRET_KEY
   값: (토스페이먼츠 시크릿 키)
   ```

5. **배포** 버튼 클릭 (각 함수마다)

---

## 🔄 모든 함수에 적용하기

다음 3개 함수 모두에 동일한 환경 변수를 설정해야 합니다:

1. `sendVerificationSMS`
2. `verifyCode`
3. `confirmPayment`

각 함수마다 위의 3단계를 반복하세요.

---

## ✅ 확인 방법

설정 후 Functions 로그 확인:

```powershell
firebase functions:log --only sendVerificationSMS
```

오류가 사라졌는지 확인하세요!

---

## 💡 팁

- 환경 변수는 각 함수마다 개별적으로 설정해야 합니다
- 한 번 설정하면 재배포 시에도 유지됩니다
- 값 변경 시 함수를 다시 배포해야 합니다

