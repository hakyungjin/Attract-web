# GitHub Actions 자동 배포 설정 가이드

## 🚀 자동 배포 활성화됨!

이제 `main` 또는 `master` 브랜치에 푸시할 때마다 자동으로 Firebase Hosting에 배포됩니다.

## 📋 필요한 GitHub Secrets 설정

GitHub 레포지토리 → Settings → Secrets and variables → Actions → New repository secret

다음 Secrets를 추가하세요:

### 1. Firebase 환경 변수
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

### 2. Firebase Service Account
```
FIREBASE_SERVICE_ACCOUNT
```

## 🔑 Firebase Service Account 키 생성 방법

1. Firebase Console (https://console.firebase.google.com) 접속
2. 프로젝트 선택
3. 프로젝트 설정 (⚙️) → 서비스 계정
4. "새 비공개 키 생성" 클릭
5. JSON 파일 다운로드
6. JSON 파일의 전체 내용을 `FIREBASE_SERVICE_ACCOUNT` Secret에 복사

## ✅ 자동 배포 확인

1. 코드 변경 후 commit & push
   ```bash
   git add .
   git commit -m "Update code"
   git push origin main
   ```

2. GitHub 레포지토리 → Actions 탭에서 배포 진행 상황 확인
3. 완료되면 Firebase Hosting URL에서 확인

## 🔧 수동 배포 (필요시)

자동 배포가 설정되어도 수동 배포는 여전히 가능합니다:
```bash
npm run deploy
```

## 📝 주의사항

- `.env` 파일은 절대 GitHub에 올리지 마세요
- GitHub Secrets는 암호화되어 안전하게 저장됩니다
- 배포 실패 시 Actions 탭에서 로그 확인
