# 🚀 빠른 해결: Firebase Functions 환경 변수 설정

## ⚡ 3분 안에 해결하기

### 1단계: Firebase Console 접속
https://console.firebase.google.com/project/attract--web/functions

### 2단계: 환경 변수 설정
1. 왼쪽 메뉴: **Functions** 클릭
2. 상단: **설정** (⚙️) 클릭  
3. **환경 변수** 탭 클릭
4. **환경 변수 추가** 버튼 클릭

### 3단계: 다음 4개 변수 추가

각각 따로 추가하세요:

```
변수 이름: SSODAA_API_KEY
값: (쏘다 API 키 입력)
```

```
변수 이름: SSODAA_TOKEN_KEY
값: (쏘다 토큰 키 입력)
```

```
변수 이름: SSODAA_SENDER
값: (발신번호, 예: 01012345678)
```

```
변수 이름: TOSS_SECRET_KEY
값: (토스페이먼츠 시크릿 키)
```

### 4단계: Functions 재배포

```powershell
firebase deploy --only functions --project attract--web
```

### 5단계: 확인

```powershell
firebase functions:log --only sendVerificationSMS
```

오류가 사라졌는지 확인하세요!

---

## 💡 왜 이렇게 해야 하나요?

- `.env` 파일은 로컬 개발용입니다
- 배포된 함수는 Firebase Console의 환경 변수를 사용합니다
- 환경 변수 변경 후 반드시 재배포해야 합니다

