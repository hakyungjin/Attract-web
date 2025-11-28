# Firebase 배포 가이드

## 📋 개요
이 가이드는 Attract 웹 애플리케이션을 Firebase Hosting에 배포하는 방법을 설명합니다.

---

## 🔧 사전 준비

### 1. Firebase CLI 설치
```bash
npm install -g firebase-tools
```

### 2. Firebase 로그인
```bash
firebase login
```
- Google 계정으로 로그인합니다
- 현재 로그인 계정: `ha894989zxc@gmail.com`

### 3. 프로젝트 확인
```bash
firebase projects:list
```
- 현재 프로젝트: `attract--web`

---

## 📦 배포 단계

### 단계 1: 환경 변수 확인
`.env` 파일에 다음 Firebase 키가 설정되어 있는지 확인:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAX33VJtYQx_Tw3Ak2qXTVB2jzlmyo76Eo
VITE_FIREBASE_AUTH_DOMAIN=attract--web.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=attract--web
VITE_FIREBASE_STORAGE_BUCKET=attract--web.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=557504244334
VITE_FIREBASE_APP_ID=1:557504244334:web:438c35dcea6a84f998147f
VITE_FIREBASE_MEASUREMENT_ID=G-QN3J2Q4HFH
```

### 단계 2: 프로덕션 빌드
```bash
npm run build
```

빌드 결과:
- 입력: `src/` 폴더의 React 소스 코드
- 출력: `out/` 폴더에 최적화된 정적 파일 생성

### 단계 3: Public 폴더에 복사
빌드된 파일들을 배포용 폴더에 복사:

```bash
# Windows PowerShell
Remove-Item -Path "public\*" -Force -Recurse
Copy-Item -Path "out\*" -Destination "public\" -Recurse -Force

# macOS/Linux
rm -rf public/*
cp -r out/* public/
```

### 단계 4: 배포
```bash
firebase deploy --project attract--web
```

배포 완료 후 출력 예시:
```
=== Deploying to 'attract--web'...

i  deploying hosting
i  hosting[attract--web]: beginning deploy...
+  hosting[attract--web]: file upload complete
+  hosting[attract--web]: version finalized
+  hosting[attract--web]: release complete

+  Deploy complete!

Hosting URL: https://attract--web.web.app
```

---

## 🚀 배포 후 확인

### 1. 앱 접속
- **URL**: https://attract--web.web.app
- 캐시 문제가 있으면: **Ctrl+Shift+Delete** 후 새로고침

### 2. 브라우저 개발자도구 확인
- **F12** → **Console** 탭에서 에러 확인
- 네트워크 에러, API 문제 등을 검사

### 3. Firebase 콘솔 모니터링
- https://console.firebase.google.com/project/attract--web/overview
- Hosting 배포 히스토리 확인
- 실시간 트래픽 모니터링

---

## 📂 파일 구조

```
.
├── .firebaserc              # Firebase 프로젝트 설정
├── firebase.json            # Firebase Hosting 설정
├── src/                     # React 소스 코드
├── out/                     # 빌드 출력 폴더 (배포 전)
├── public/                  # 배포용 폴더 (out 복사본)
├── .env                     # 환경 변수 (Firebase 키)
└── package.json             # npm 스크립트
```

### Firebase 설정 파일

**`.firebaserc`** - 기본 프로젝트 설정
```json
{
  "projects": {
    "default": "attract--web"
  }
}
```

**`firebase.json`** - Hosting 재작성 규칙
```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
> ⚠️ `rewrites` 규칙이 있어야 React Router가 정상 작동합니다.

---

## 🔑 Google 계정 변경 방법

### 1. 현재 계정 로그아웃
```bash
firebase logout
```

### 2. 새 계정으로 로그인
```bash
firebase login
```

### 3. 새 프로젝트로 배포
```bash
firebase deploy --project [new-project-id]
```

---

## ⚠️ 일반적인 문제 해결

### 문제 1: "Firebase Hosting Setup Complete" 페이지만 보임
**원인**: `public` 폴더에 기본 Firebase 파일만 있음
**해결**:
```bash
npm run build
Remove-Item -Path "public\*" -Force -Recurse
Copy-Item -Path "out\*" -Destination "public\" -Recurse -Force
firebase deploy --project attract--web
```

### 문제 2: 라우팅이 작동하지 않음
**원인**: `firebase.json`에 `rewrites` 설정이 없음
**해결**: `firebase.json`에 다음 코드 추가:
```json
"rewrites": [
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

### 문제 3: 환경 변수가 인식되지 않음
**원인**: 빌드 시 `.env` 파일을 읽지 않았음
**해결**: 빌드 전에 `.env` 파일 확인 후 다시 빌드:
```bash
npm run build
```

### 문제 4: "Cannot GET /" 에러
**원인**: React 앱이 로드되지 않음
**해결**:
1. 브라우저 캐시 삭제: **Ctrl+Shift+Delete**
2. 개발자도구(F12) Console 탭에서 에러 확인
3. `public/index.html`이 존재하는지 확인

### 문제 5: Supabase/API 연결 실패
**원인**: `.env` 파일의 API 키가 배포 시 반영되지 않음
**해결**: 
1. `.env` 파일에 Supabase 키 확인
2. 빌드 후 `out/index.html` 로드 후 개발자도구에서 API 호출 확인
3. 필요시 환경 변수를 소스 코드에 하드코딩 검토

---

## 🔒 보안 고려사항

1. **Firebase 키 보호**
   - `.env` 파일은 `.gitignore`에 추가되어 있음
   - 절대 GitHub에 업로드하지 않기

2. **Supabase RLS 정책**
   - 배포 후에도 RLS 정책이 비활성화 상태 확인
   - 프로덕션 환경에서는 RLS 활성화 권장

3. **CORS 설정**
   - Firebase Hosting과 Supabase 간 CORS 문제 확인
   - 필요시 Supabase 대시보드에서 CORS 설정 조정

---

## 📊 배포 빈도

| 상황 | 명령어 |
|------|--------|
| 초기 배포 | `firebase deploy --project attract--web` |
| 코드 수정 후 배포 | `npm run build` → 파일 복사 → `firebase deploy --project attract--web` |
| 빠른 배포 | `npm run build && firebase deploy --project attract--web` |
| 특정 프로젝트로 배포 | `firebase deploy --project [project-id]` |

---

## 📞 문제 해결 체크리스트

배포 후 문제가 발생하면 다음을 확인하세요:

- [ ] `.env` 파일의 Firebase 키가 올바른가?
- [ ] `public` 폴더에 빌드된 파일들이 있는가?
- [ ] `firebase.json`에 `rewrites` 규칙이 있는가?
- [ ] 브라우저 캐시가 삭제되었는가?
- [ ] 콘솔(F12)에 에러 메시지가 있는가?
- [ ] Firebase 프로젝트가 올바른가? (`attract--web`)
- [ ] 인터넷 연결이 정상인가?

---

## 🔗 참고 링크

- [Firebase Hosting 공식 문서](https://firebase.google.com/docs/hosting)
- [Firebase CLI 가이드](https://firebase.google.com/docs/cli)
- [React Router 배포 가이드](https://reactrouter.com/start/library/start-data-flow/installation)
- [Firebase 콘솔](https://console.firebase.google.com/project/attract--web/overview)

---

**마지막 배포**: 2025년 11월 28일
**현재 프로젝트**: attract--web
**배포 URL**: https://attract--web.web.app
