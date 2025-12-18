# 🔐 환경 변수 설정 해결 방법

Firebase Console에서 환경 변수 설정이 보이지 않을 때 사용하는 방법입니다.

---

## ✅ 방법 1: Google Cloud Console에서 설정 (권장)

### 1단계: Google Cloud Console 접속
https://console.cloud.google.com/functions?project=attract--web

### 2단계: 함수 선택 및 환경 변수 설정
1. **Cloud Functions** 메뉴 클릭
2. `sendVerificationSMS` 함수 클릭
3. **편집** 버튼 클릭
4. **환경 변수, 시크릿 및 네트워크** 섹션 확장
5. **환경 변수 추가** 클릭
6. 다음 변수들을 하나씩 추가:
   - `SSODAA_API_KEY` = (값 입력)
   - `SSODAA_TOKEN_KEY` = (값 입력)
   - `SSODAA_SENDER` = (값 입력)
   - `TOSS_SECRET_KEY` = (값 입력)
7. **배포** 버튼 클릭

---

## ✅ 방법 2: Firebase CLI로 Secrets 설정

```powershell
# 각 명령어 실행 시 값 입력 프롬프트가 나타납니다
firebase functions:secrets:set SSODAA_API_KEY --project attract--web
firebase functions:secrets:set SSODAA_TOKEN_KEY --project attract--web
firebase functions:secrets:set SSODAA_SENDER --project attract--web
firebase functions:secrets:set TOSS_SECRET_KEY --project attract--web
```

그리고 코드를 수정해서 Secrets를 사용하도록 해야 합니다.

---

## ✅ 방법 3: .env 파일을 배포에 포함 (간단하지만 보안 주의)

`.env` 파일을 배포에 포함시키면 코드 수정 없이 바로 작동합니다.

### 1단계: firebase.json 수정
`firebase.json`의 `functions` 섹션에 `.env` 파일을 포함하도록 설정합니다.

### 2단계: .env 파일 확인
`functions/.env` 파일에 다음이 있는지 확인:
```
SSODAA_API_KEY=your_api_key
SSODAA_TOKEN_KEY=your_token_key
SSODAA_SENDER=01012345678
TOSS_SECRET_KEY=test_sk_...
```

### 3단계: 재배포
```powershell
firebase deploy --only functions --project attract--web
```

**⚠️ 주의**: 이 방법은 `.env` 파일이 배포 패키지에 포함되므로 보안상 권장하지 않습니다. 하지만 빠르게 테스트하기에는 좋습니다.

---

## 🎯 추천 방법

**방법 1 (Google Cloud Console)**을 가장 추천합니다. 가장 안전하고 관리하기 쉽습니다.

