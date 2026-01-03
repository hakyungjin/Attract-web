# 🚀 GitHub Actions 자동 배포 빠른 설정 가이드

## 1️⃣ Firebase Service Account 키 발급 (5분)

1. **Firebase Console 접속**: https://console.firebase.google.com
2. **프로젝트 선택**: `attract--web`
3. **설정 → 서비스 계정** 이동
4. **새 비공개 키 생성** 클릭
5. **JSON 파일 다운로드** (전체 내용을 복사해둘 것)

## 2️⃣ GitHub Secrets 설정 (10분)

### GitHub 레포지토리로 이동
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions

### 다음 Secrets 추가:

#### Firebase 환경 변수들 (.env 파일 참고)
```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyAX33VJtYQx_Tw3Ak2qXTVB2jzlmyo76Eo

Name: VITE_FIREBASE_AUTH_DOMAIN
Value: attract--web.firebaseapp.com

Name: VITE_FIREBASE_PROJECT_ID
Value: attract--web

Name: VITE_FIREBASE_STORAGE_BUCKET
Value: attract--web.firebasestorage.app

Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 557504244334

Name: VITE_FIREBASE_APP_ID
Value: 1:557504244334:web:438c35dcea6a84f998147f

Name: VITE_FIREBASE_MEASUREMENT_ID
Value: G-QN3J2Q4HFH
```

#### Firebase Service Account (1단계에서 다운로드한 JSON 전체)
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: (다운로드한 JSON 파일의 전체 내용 붙여넣기)
```

## 3️⃣ 자동 배포 테스트

```bash
# 아무 파일이나 수정
echo "# Auto deploy test" >> README.md

# Commit & Push
git add .
git commit -m "Test auto deploy"
git push origin main
```

## 4️⃣ 배포 확인

1. GitHub 레포지토리 → **Actions** 탭
2. 워크플로우 실행 확인
3. 완료되면 ✅ 체크 마크
4. Firebase Hosting URL에서 변경사항 확인

## ⚡ 이제부터는...

```bash
git add .
git commit -m "업데이트 내용"
git push origin main
```

**→ 자동으로 빌드 & 배포됨!** 🎉

## 🔧 수동 배포 (필요시)

```bash
npm run deploy
```

## ❗ 중요 사항

- ✅ `.env` 파일은 이미 `.gitignore`에 포함되어 있음
- ✅ GitHub Secrets는 암호화되어 안전
- ✅ 배포 실패 시 Actions 탭에서 로그 확인
- ✅ `main` 또는 `master` 브랜치 푸시 시에만 배포됨
