# 🚀 배포 전 최종 체크리스트

**배포 일시**: 2025-12-17
**브랜치**: `claude/fix-viewport-meta-tag-01MuiEUmwc5pEvLcG4XpfdRu`

---

## ✅ 코드 상태

### 완료된 마이그레이션 (95%)
- ✅ 인증 시스템 (Firebase Phone Auth)
- ✅ 프로필 시스템 (CRUD)
- ✅ 매칭 시스템 (요청/수락/거절)
- ✅ 알림 시스템
- ✅ 코인 시스템
- ✅ 이미지 업로드 (Firebase Storage)
- ✅ FCM 푸시 알림 (토큰 저장)
- ✅ 홈 탭 (ProfileTab, MatchingTab)

### 남은 작업 (5%)
⚠️ **다음 파일들은 아직 Supabase를 사용합니다**:
- `src/pages/admin/page.tsx` - 관리자 페이지
- `src/pages/home/components/CommunityTab.tsx` - 커뮤니티
- `src/pages/home/components/PostDetailPage.tsx` - 게시글 상세
- `src/pages/post/create.tsx` - 게시글 작성

**대응 방안**: Supabase를 병행 운영하거나 해당 기능 비활성화

---

## 🔧 필수 Firebase 설정

### 1. Authentication
- Firebase Console > Authentication > Phone 활성화

### 2. Firestore Database  
- Database 생성 (아시아 리전 권장)
- 보안 규칙 배포 필요

### 3. Storage
- 버킷 생성
- CORS 설정 필요
- 보안 규칙 배포 필요

---

## 🔐 환경 변수 (필수)

```bash
# Firebase (필수)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Supabase (커뮤니티용 - 당분간 유지)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# SMS (Ssodaa)
VITE_SSODAA_API_KEY=
VITE_SSODAA_TOKEN_KEY=
VITE_SSODAA_SENDER=
```

---

## ⚠️ 알려진 제한사항

1. **커뮤니티 기능**: Supabase 사용 중
2. **채팅 실시간 업데이트**: 미구현 (수동 새로고침 필요)
3. **FCM 푸시**: 토큰 저장만 구현 (발송 미구현)
4. **결제**: 카카오페이 deprecated (토스 페이먼츠 필요)

---

## 🧪 배포 전 테스트

```
□ 회원가입 (전화번호 + SMS)
□ 로그인
□ 프로필 작성 (이미지 업로드)
□ 매칭 요청/수락
□ 알림 확인
```

---

## 📋 Firestore 보안 규칙

`firestore.rules` 파일 생성 후 배포:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /matching_requests/{id} {
      allow read, write: if request.auth != null;
    }
    
    match /notifications/{id} {
      allow read: if request.auth != null && resource.data.user_id == request.auth.uid;
      allow write: if request.auth != null;
    }
    
    match /coin_packages/{id} {
      allow read: if true;
    }
  }
}
```

배포 명령:
```bash
firebase deploy --only firestore:rules
```

---

## 🚀 배포 순서

1. **Firebase 설정 완료 확인**
2. **환경 변수 설정**
3. **빌드**: `npm run build`
4. **Firestore 규칙 배포**: `firebase deploy --only firestore:rules`
5. **Storage 규칙 배포**: `firebase deploy --only storage:rules`
6. **호스팅 배포** (플랫폼에 따라)

---

## ✅ 배포 직후 확인

```
□ 사이트 접속
□ 회원가입 테스트
□ 로그인 테스트
□ 이미지 업로드 테스트
□ Firebase Console에서 데이터 확인
```

---

**준비 완료!** 🎉
