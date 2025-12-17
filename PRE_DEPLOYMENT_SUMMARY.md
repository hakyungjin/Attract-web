# 🎯 배포 전 최종 점검 요약

## 📊 마이그레이션 진행 상황

### ✅ 완료 (95%)
**핵심 기능 모두 Firebase로 전환 완료**

#### 인증 & 사용자
- Firebase Phone Authentication
- 비밀번호 해싱 (bcryptjs)
- 사용자 CRUD (Firestore)
- 프로필 이미지 업로드 (Firebase Storage)

#### 매칭 시스템
- 매칭 요청 생성/조회/수락/거절
- 알림 시스템
- 매칭 통계

#### 기타
- 코인 시스템
- FCM 토큰 저장
- SMS 알림 (Ssodaa)

### ⏳ 남은 작업 (5%)
**Supabase 병행 운영 중인 기능**:
- 커뮤니티 (게시글, 댓글)
- 관리자 페이지
- 채팅 실시간 업데이트

---

## 🔴 배포 전 필수 확인사항

### 1. Firebase Console 설정 ⚠️
```
□ Authentication > Phone 활성화
□ Firestore Database 생성
□ Storage 버킷 생성
```

### 2. 환경 변수 ⚠️
**.env 파일에 다음 변수 필수**:
```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore 보안 규칙 ⚠️
**반드시 배포 필요** (DEPLOYMENT_CHECKLIST.md 참고):
```bash
firebase deploy --only firestore:rules
```

---

## ⚠️ 중요 경고

### 1. Supabase 유지 필요
**커뮤니티 기능 때문에 Supabase 환경 변수 유지**:
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 2. 제한된 기능
- **채팅**: 실시간 업데이트 없음 (수동 새로고침)
- **푸시 알림**: 토큰 저장만 가능 (발송 미구현)
- **결제**: 카카오페이 제거됨 (토스 전환 필요)

### 3. 데이터 마이그레이션
- **기존 Supabase 데이터**: 자동 이전 안 됨
- **신규 가입자**: Firebase에 저장됨
- **필요시**: 수동으로 데이터 이전 스크립트 작성

---

## 🧪 테스트 시나리오

### 최소 테스트 (필수)
1. **회원가입**: 전화번호 + SMS 인증 + 비밀번호
2. **로그인**: 전화번호 + 비밀번호
3. **프로필 작성**: 이미지 업로드 포함
4. **매칭 요청**: 다른 사용자에게 요청
5. **Firebase Console 확인**: Firestore에 데이터 생성 확인

### 전체 테스트 (권장)
- 프로필 수정
- 매칭 수락/거절
- 알림 확인
- 코인 조회

---

## 🚀 배포 명령어

```bash
# 1. 의존성 설치
npm install

# 2. 빌드
npm run build

# 3. Firebase 규칙 배포 (최초 1회)
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# 4. 호스팅 배포 (플랫폼에 따라)
firebase deploy --only hosting  # Firebase Hosting
# 또는
vercel --prod  # Vercel
# 또는
netlify deploy --prod  # Netlify
```

---

## 🆘 문제 해결

### 빌드 실패
```bash
rm -rf node_modules
npm install
npm run build
```

### Firebase 인증 실패
- Firebase Console > Authentication 확인
- .env 파일의 VITE_FIREBASE_* 변수 확인

### Firestore 접근 오류
```bash
firebase deploy --only firestore:rules
```

### Storage 업로드 실패
- CORS 설정 필요
- Storage 보안 규칙 확인

---

## ✅ 배포 완료 후

```
□ 사이트 접속 테스트
□ 회원가입 테스트
□ Firebase Console에서 Users 확인
□ Firebase Console에서 Firestore 데이터 확인
□ Firebase Console에서 Storage 파일 확인
□ 에러 로그 모니터링
```

---

## 📁 참고 문서

- `DEPLOYMENT_CHECKLIST.md` - 상세 배포 가이드
- `FIREBASE_MIGRATION.md` - 마이그레이션 전체 가이드
- Firebase 공식 문서: https://firebase.google.com/docs

---

**배포 준비 완료! 🎉**

**주의**: 커뮤니티 기능은 Supabase 사용 중이므로 양쪽 환경 변수 모두 필요합니다.
