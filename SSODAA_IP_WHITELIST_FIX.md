# 🔧 쏘다 SMS API IP 화이트리스트 설정 가이드

## ⚠️ 오류 메시지

```
"token에 등록되지 않은 발송서버 ip입니다. (34.96.44.20)"
```

## 🔍 원인

Firebase Functions가 실행되는 서버의 IP 주소(`34.96.44.20`)가 쏘다 API의 IP 화이트리스트에 등록되지 않았습니다.

---

## ✅ 해결 방법

### 방법 1: 쏘다 API 대시보드에서 IP 등록 (권장)

1. **쏘다 웹사이트 접속**
   - https://ssodaa.com 로그인

2. **API 설정 페이지로 이동**
   - **[API 연동 안내]** 또는 **[API 토큰 관리]** 메뉴 클릭
   - 또는 직접: https://ssodaa.com/service/api/setting

3. **IP 화이트리스트 설정**
   - **발송서버 IP 등록** 또는 **IP 화이트리스트** 섹션 찾기
   - 다음 IP 주소 추가:
     ```
     34.96.44.20
     ```

4. **Google Cloud Functions IP 범위 추가 (선택사항)**
   
   Firebase Functions는 Google Cloud Functions를 사용하므로, IP 주소가 변경될 수 있습니다. 
   다음 IP 범위를 모두 등록하는 것을 권장합니다:
   
   ```
   # us-central1 리전 (기본)
   34.96.0.0/16
   34.97.0.0/16
   34.98.0.0/16
   34.99.0.0/16
   
   # 또는 모든 Google Cloud IP 허용 (보안상 권장하지 않음)
   # 쏘다 API에서 지원하는 경우에만 사용
   ```

5. **저장 및 확인**
   - IP 주소 추가 후 **저장** 클릭
   - 설정이 적용되는데 몇 분 정도 걸릴 수 있습니다

---

### 방법 2: 쏘다 API 고객센터에 문의

IP 화이트리스트 설정이 보이지 않거나 어려운 경우:

1. **쏘다 고객센터 접속**
   - https://ssodaa.com/customer/inquiry
   - 또는 1:1 온라인 상담

2. **문의 내용**
   ```
   Firebase Functions에서 쏘다 SMS API를 사용하려고 하는데,
   IP 주소 등록 오류가 발생합니다.
   
   발송서버 IP: 34.96.44.20
   리전: us-central1 (Google Cloud Functions)
   
   IP 화이트리스트에 등록해주시거나, 
   IP 제한을 해제해주실 수 있나요?
   ```

---

### 방법 3: Firebase Functions 리전 변경 (임시 해결책)

다른 리전의 IP 주소가 이미 등록되어 있다면:

1. **functions/src/index.ts** 수정
   ```typescript
   // 현재 (us-central1)
   export const sendVerificationSMS = onCall(async (request) => {
   
   // 리전 지정 (예: asia-northeast1 - 서울)
   export const sendVerificationSMS = onCall(
     { region: 'asia-northeast1' },
     async (request) => {
   ```

2. **Functions 재배포**
   ```powershell
   cd functions
   npm run build
   firebase deploy --only functions --project attract--web
   ```

3. **새 IP 주소 확인**
   - Functions 로그에서 새로운 IP 주소 확인
   - 쏘다 API에 새 IP 주소 등록

---

## 🔍 현재 IP 주소 확인 방법

### Firebase Functions 로그에서 확인

```powershell
firebase functions:log --only sendVerificationSMS
```

로그에서 오류 메시지에 표시된 IP 주소를 확인할 수 있습니다.

### Google Cloud Console에서 확인

1. https://console.cloud.google.com/functions 접속
2. `sendVerificationSMS` 함수 클릭
3. **로그** 탭에서 IP 주소 확인

---

## 📝 체크리스트

- [ ] 쏘다 API 대시보드 접속
- [ ] IP 화이트리스트 설정 페이지 찾기
- [ ] `34.96.44.20` IP 주소 추가
- [ ] Google Cloud Functions IP 범위 추가 (선택)
- [ ] 설정 저장
- [ ] Functions 재배포 (필요한 경우)
- [ ] SMS 발송 테스트

---

## ⚠️ 주의사항

1. **IP 주소 변경 가능성**
   - Firebase Functions의 IP 주소는 변경될 수 있습니다
   - IP 범위를 등록하는 것이 더 안전합니다

2. **보안**
   - IP 화이트리스트는 보안을 강화합니다
   - 모든 IP를 허용하는 것은 권장하지 않습니다

3. **적용 시간**
   - IP 등록 후 즉시 적용되지 않을 수 있습니다
   - 몇 분 정도 기다린 후 다시 시도하세요

---

## 🚀 빠른 해결

가장 빠른 방법:

1. 쏘다 웹사이트 로그인
2. API 설정 → IP 화이트리스트
3. `34.96.44.20` 추가
4. 저장
5. 5분 후 SMS 발송 재시도

---

## 📞 추가 도움

문제가 계속되면:
- 쏘다 고객센터: https://ssodaa.com/customer/inquiry
- 쏘다 API 문서: https://ssodaa.com/service/api/smsapi

