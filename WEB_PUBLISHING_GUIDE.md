# 🌐 웹 앱 퍼블리싱 가이드

## 📋 개요

모바일 앱 배포 전에 웹으로 먼저 퍼블리싱하는 가이드입니다.

---

## ✅ 현재 설정 상태

- ✅ Firebase Hosting 설정 완료
- ✅ 빌드 스크립트 설정 완료
- ✅ 프로젝트: `attract--web`
- ✅ 배포 폴더: `out`

---

## 🚀 빠른 배포 (3단계)

### 1단계: 빌드

```powershell
npm run build
```

빌드 결과가 `out` 폴더에 생성됩니다.

### 2단계: 배포

```powershell
npm run deploy
```

또는

```powershell
firebase deploy --only hosting --project attract--web
```

### 3단계: 확인

배포 완료 후 다음 URL에서 확인:
- **프로덕션**: https://attract--web.web.app
- **또는**: https://attract--web.firebaseapp.com

---

## 📝 배포 전 체크리스트

### 필수 확인 사항

- [ ] `.env` 파일에 Firebase 설정이 있는지 확인
- [ ] Functions 환경 변수가 설정되어 있는지 확인
- [ ] 빌드 오류가 없는지 확인
- [ ] 로컬에서 `npm run build` 성공 확인

### 환경 변수 확인

`.env` 파일에 다음이 있어야 합니다:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=attract--web.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=attract--web
VITE_FIREBASE_STORAGE_BUCKET=attract--web.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# 쏘다 SMS API (Functions에서 사용)
# Functions 환경 변수에 별도로 설정 필요
```

---

## 🔧 배포 명령어

### 전체 배포 (Hosting + Functions)

```powershell
firebase deploy --project attract--web
```

### Hosting만 배포

```powershell
firebase deploy --only hosting --project attract--web
```

### Functions만 배포

```powershell
firebase deploy --only functions --project attract--web
```

### npm 스크립트 사용

```powershell
npm run deploy
```

이 명령어는 `vite build && firebase deploy --only hosting`을 실행합니다.

---

## 🌐 배포 후 확인

### 1. 웹사이트 접속

- https://attract--web.web.app
- 또는 https://attract--web.firebaseapp.com

### 2. 기능 테스트

- [ ] 회원가입/로그인
- [ ] SMS 인증
- [ ] 프로필 수정
- [ ] 매칭 요청
- [ ] 코인 구매
- [ ] 개인정보 삭제 요청

### 3. 브라우저 개발자 도구 확인

- **F12** → **Console** 탭에서 에러 확인
- **Network** 탭에서 API 호출 확인

---

## 📱 모바일에서 웹 앱 접속

### PWA (Progressive Web App) 설정

웹 앱을 모바일에서 앱처럼 사용할 수 있도록 설정할 수 있습니다.

1. **manifest.json** 파일 확인
2. **Service Worker** 설정 (선택사항)
3. 모바일 브라우저에서 "홈 화면에 추가" 가능

### 모바일 브라우저에서 접속

1. 모바일 브라우저에서 https://attract--web.web.app 접속
2. 브라우저 메뉴 → "홈 화면에 추가"
3. 앱처럼 사용 가능

---

## 🔄 업데이트 배포

코드를 수정한 후 다시 배포:

```powershell
# 1. 빌드
npm run build

# 2. 배포
firebase deploy --only hosting --project attract--web
```

또는 한 번에:

```powershell
npm run deploy
```

---

## ⚙️ Firebase Hosting 설정

현재 `firebase.json` 설정:

```json
{
  "hosting": {
    "public": "out",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

이 설정으로:
- ✅ React Router가 정상 작동
- ✅ 모든 경로가 `index.html`로 리다이렉트
- ✅ SPA(Single Page Application) 지원

---

## 🎯 배포 후 마케팅

### 1. 도메인 연결 (선택사항)

Firebase Hosting에 커스텀 도메인을 연결할 수 있습니다:

1. Firebase Console → Hosting → 도메인 추가
2. DNS 설정
3. SSL 인증서 자동 발급

### 2. SEO 최적화

- `index.html`의 메타 태그 확인
- Open Graph 태그 추가 (선택사항)
- Google Search Console 등록 (선택사항)

### 3. 소셜 공유

- 카카오톡, 페이스북 등에서 공유 시 미리보기 설정

---

## 📊 모니터링

### Firebase Console

1. https://console.firebase.google.com/project/attract--web/hosting
2. 배포 히스토리 확인
3. 트래픽 통계 확인

### Analytics (선택사항)

Firebase Analytics를 설정하면 사용자 행동을 분석할 수 있습니다.

---

## ✅ 배포 체크리스트

배포 전:
- [ ] `.env` 파일 확인
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] 로컬에서 테스트 (`npm run preview`)
- [ ] Functions 환경 변수 설정 확인

배포 후:
- [ ] 웹사이트 접속 확인
- [ ] 주요 기능 테스트
- [ ] 모바일 브라우저에서 테스트
- [ ] 콘솔 에러 확인

---

## 🚀 지금 바로 배포하기

```powershell
# 1. 빌드
npm run build

# 2. 배포
firebase deploy --only hosting --project attract--web
```

배포 완료 후:
- https://attract--web.web.app 접속
- 웹 앱 확인!

---

## 💡 팁

1. **빠른 배포**: `npm run deploy` 한 번에 빌드 + 배포
2. **캐시 문제**: 배포 후 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
3. **에러 확인**: F12 → Console에서 에러 메시지 확인
4. **Functions 배포**: Functions도 함께 배포하려면 `firebase deploy` 사용

---

## 📞 문제 해결

### 배포 실패 시

1. Firebase CLI 로그인 확인: `firebase login`
2. 프로젝트 확인: `firebase projects:list`
3. 빌드 오류 확인: `npm run build`
4. Firebase Console에서 배포 상태 확인

### 웹사이트가 안 보일 때

1. 브라우저 캐시 삭제
2. 시크릿 모드에서 접속
3. Firebase Console에서 배포 상태 확인
4. Functions 로그 확인

---

## 🎉 완료!

웹 앱이 성공적으로 배포되면:
- 사용자들이 웹 브라우저에서 접속 가능
- 모바일 브라우저에서도 접속 가능
- 나중에 모바일 앱 배포 시에도 동일한 백엔드 사용

