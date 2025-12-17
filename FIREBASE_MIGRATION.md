# Firebase 마이그레이션 가이드

## 📋 개요

Attract 데이팅 앱을 Supabase에서 Firebase로 완전히 마이그레이션하는 작업입니다.

**마이그레이션 날짜**: 2025-12-15
**브랜치**: `claude/fix-viewport-meta-tag-01MuiEUmwc5pEvLcG4XpfdRu`

---

## ✅ 완료된 마이그레이션

### 1. 핵심 인프라 (100% 완료)

#### Firebase 설정
- ✅ `src/lib/firebase.ts` - Firebase 초기화 (Auth, Firestore, Storage)
- ✅ `src/lib/firebaseService.ts` - Firestore 서비스 레이어
  - User Service (사용자 CRUD, 코인 관리, 성별별 조회)
  - Matching Service (매칭 요청 생성/조회/업데이트)
  - Notification Service (알림 생성/조회)
  - Coin Service (코인 패키지 조회)

#### 이미지 업로드
- ✅ `src/services/imageUpload.ts` - Firebase Storage 업로드 서비스
  - `uploadImage()` - 이미지 업로드
  - `deleteImage()` - 이미지 삭제
  - `validateImageFile()` - 파일 유효성 검사
  - `createPreviewUrl()` - 미리보기 URL 생성

### 2. 인증 시스템 (100% 완료)

- ✅ `src/contexts/AuthContext.tsx` - Firebase Auth 통합
- ✅ `src/services/phoneAuth.ts` - Firebase Phone Authentication
- ✅ `src/services/passwordService.ts` - bcryptjs 비밀번호 해싱
- ✅ `src/pages/auth/AuthPage.tsx` - 로그인 페이지
- ✅ `src/pages/signup/SignupPage.tsx` - 회원가입 페이지 (Phone Auth)
- ✅ `src/pages/signup/QuickSignupPage.tsx` - 빠른 회원가입 (유령 회원)
- ✅ `src/pages/signup-profile/page.tsx` - 프로필 완성 페이지

### 3. 프로필 시스템 (100% 완료)

- ✅ `src/pages/profile/page.tsx` - 내 프로필 페이지
- ✅ `src/pages/profile-edit/page.tsx` - 프로필 수정 페이지
- ✅ `src/pages/profile-detail/page.tsx` - 타인 프로필 상세 (매칭 요청/알림)
- ✅ `src/pages/home/components/ProfileTab.tsx` - 프로필 탭 (매칭 통계)

### 4. 매칭 시스템 (100% 완료)

- ✅ `src/services/matchingService.ts` - 매칭 요청 관리
- ✅ `src/pages/matching-requests/page.tsx` - 매칭 요청 목록
- ✅ `src/pages/home/components/MatchingTab.tsx` - 매칭 탭 (사용자 목록)

### 5. 알림 시스템 (100% 완료)

- ✅ `src/pages/notifications/page.tsx` - 알림 목록
- ✅ `src/components/base/Header.tsx` - 헤더 알림 카운트

### 6. 코인 시스템 (100% 완료)

- ✅ `src/pages/coin-shop/page.tsx` - 코인샵 페이지

---

## 🔄 진행 중 / 남은 작업

### 1. 채팅 시스템 (0% - 복잡)

**파일:**
- ⏳ `src/pages/home/components/ChatTab.tsx`

**필요 작업:**
- Firebase Realtime Database 또는 Firestore 실시간 리스너 구현
- `chatService` 추가 필요:
  - `getChatRooms()` - 채팅방 목록 조회
  - `getMessages()` - 메시지 조회
  - `sendMessage()` - 메시지 전송
  - `markAsRead()` - 읽음 처리
  - `onMessagesChange()` - 실시간 메시지 구독

### 2. 커뮤니티 시스템 (0% - 복잡)

**파일:**
- ⏳ `src/pages/home/components/CommunityTab.tsx`
- ⏳ `src/pages/home/components/PostDetailPage.tsx`
- ⏳ `src/pages/post/create.tsx`

**필요 작업:**
- `postService` 추가 필요:
  - `getPosts()` - 게시글 목록 조회
  - `getPostById()` - 게시글 상세 조회
  - `createPost()` - 게시글 작성
  - `updatePost()` - 게시글 수정
  - `deletePost()` - 게시글 삭제
  - `likePost()` - 게시글 좋아요
  - `getComments()` - 댓글 조회
  - `createComment()` - 댓글 작성

### 3. 결제 시스템 (20% - 간단)

**파일:**
- ⏳ `src/pages/payment/success.tsx`
- ⏳ `src/services/kakaoPayService.ts`

**필요 작업:**
- 결제 내역을 Firestore에 저장
- `paymentService` 추가 권장

### 4. 관리자 페이지 (0% - 중간)

**파일:**
- ⏳ `src/pages/admin/page.tsx`

**필요 작업:**
- 사용자 관리 쿼리를 Firebase로 변경
- 통계 쿼리 최적화

### 5. 기타 서비스 (30% - 간단)

**파일:**
- ⏳ `src/services/fcmService.ts` - FCM 푸시 알림 (일부 Firebase 사용 중)
- ⏳ `src/services/pushNotification.ts` - 푸시 알림 서비스

---

## 🔧 설정 필요 사항

### 1. Firebase 프로젝트 설정

**Firebase Console에서 설정해야 할 것들:**

1. **Authentication**
   - Phone 인증 활성화
   - 테스트 전화번호 추가 (선택)

2. **Firestore Database**
   - 데이터베이스 생성 (아시아-동북 리전 권장)
   - 보안 규칙 설정 (아래 참고)

3. **Storage**
   - 버킷 생성
   - CORS 설정
   - 보안 규칙 설정 (아래 참고)

4. **FCM (Firebase Cloud Messaging)**
   - 서버 키 발급
   - 웹 푸시 인증서 생성

### 2. 환경 변수 설정

`.env` 파일에 다음 변수들을 추가:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# 기존 Supabase (당분간 유지)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Ssodaa SMS API
VITE_SSODAA_API_KEY=your_ssodaa_key
VITE_SSODAA_USER_ID=your_user_id
VITE_SSODAA_SENDER=your_sender_number

# 카카오페이
VITE_KAKAO_PAY_CID=your_cid
```

### 3. Firestore 보안 규칙

`firestore.rules` 파일:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 컬렉션
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    // 매칭 요청
    match /matching_requests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (resource.data.from_user_id == request.auth.uid ||
         resource.data.to_user_id == request.auth.uid);
    }

    // 알림
    match /notifications/{notificationId} {
      allow read: if request.auth != null &&
        resource.data.user_id == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        resource.data.user_id == request.auth.uid;
    }

    // 채팅방
    match /chat_rooms/{roomId} {
      allow read: if request.auth != null &&
        (resource.data.user1_id == request.auth.uid ||
         resource.data.user2_id == request.auth.uid);
      allow create: if request.auth != null;
    }

    // 메시지
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }

    // 게시글
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.user_id == request.auth.uid;
    }

    // 코인 패키지 (읽기 전용)
    match /coin_packages/{packageId} {
      allow read: if true;
    }
  }
}
```

### 4. Storage 보안 규칙

`storage.rules` 파일:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 아바타 이미지
    match /avatars/{imageId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024 && // 5MB 제한
        request.resource.contentType.matches('image/.*');
    }

    // 게시글 이미지
    match /posts/{imageId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.resource.size < 10 * 1024 * 1024 && // 10MB 제한
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 📊 데이터 마이그레이션

### Supabase → Firebase 데이터 이전

**필요한 경우 스크립트 작성 필요:**

1. **사용자 데이터**
   - Supabase `users` 테이블 → Firestore `users` 컬렉션
   - 비밀번호는 이미 해싱되어 있으므로 그대로 이전

2. **매칭 요청**
   - Supabase `matching_requests` 테이블 → Firestore `matching_requests` 컬렉션

3. **채팅 데이터**
   - Supabase `chat_rooms`, `messages` → Firestore 컬렉션

4. **게시글/댓글**
   - Supabase `posts`, `comments` → Firestore 컬렉션

**마이그레이션 스크립트 예시:**

```typescript
// scripts/migrate-users.ts
import { supabase } from './supabase-client';
import { firebase } from './firebase-client';

async function migrateUsers() {
  const { data: users } = await supabase.from('users').select('*');

  for (const user of users) {
    await firebase.users.createUser({
      id: user.id, // 기존 ID 유지
      phone_number: user.phone_number,
      name: user.name,
      // ... 나머지 필드
    });
  }
}
```

---

## 🏗️ 아키텍처 변경 사항

### 1. 데이터베이스 구조

**Before (Supabase - PostgreSQL):**
- 관계형 데이터베이스
- JOIN 쿼리 사용
- RLS (Row Level Security)
- SQL 쿼리

**After (Firebase - Firestore):**
- NoSQL 문서 데이터베이스
- 비정규화 데이터 구조
- 보안 규칙
- 쿼리 제약 (복합 인덱스 필요)

### 2. 파일 저장소

**Before (Supabase Storage):**
```typescript
const { data } = await supabase.storage
  .from('bucket')
  .upload('file.jpg', file);
```

**After (Firebase Storage):**
```typescript
const url = await uploadImage(file, 'avatars');
```

### 3. 인증

**Before (Supabase Auth):**
```typescript
const { user } = await supabase.auth.signInWithPassword({
  email, password
});
```

**After (Firebase Auth + Custom):**
```typescript
// 1. Firebase Phone Auth로 전화번호 인증
const confirmationResult = await signInWithPhoneNumber(
  auth, phoneNumber, recaptchaVerifier
);

// 2. 커스텀 비밀번호 검증 (Firestore)
const { user } = await firebase.users.findUserByPhoneNumber(phone);
const isValid = await verifyPassword(password, user.password_hash);
```

---

## 🔍 주요 API 변경 사항

### 사용자 조회

**Before:**
```typescript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

**After:**
```typescript
const { user } = await firebase.users.getUserById(userId);
```

### 매칭 요청 생성

**Before:**
```typescript
const { data } = await supabase
  .from('matching_requests')
  .insert({
    from_user_id: fromId,
    to_user_id: toId,
    status: 'pending'
  });
```

**After:**
```typescript
const { request } = await firebase.matching.createMatchingRequest(
  fromId, toId
);
```

### 이미지 업로드

**Before:**
```typescript
const { data } = await supabase.storage
  .from('avatars')
  .upload('filename', file);

const publicUrl = supabase.storage
  .from('avatars')
  .getPublicUrl('filename').data.publicUrl;
```

**After:**
```typescript
const publicUrl = await uploadImage(file, 'avatars');
```

---

## 🚀 배포 체크리스트

### Firebase 프로젝트 설정
- [ ] Firebase 프로젝트 생성
- [ ] Phone Authentication 활성화
- [ ] Firestore Database 생성
- [ ] Storage 버킷 생성
- [ ] FCM 서버 키 발급

### 보안 설정
- [ ] Firestore 보안 규칙 배포
- [ ] Storage 보안 규칙 배포
- [ ] API 키 환경 변수 설정
- [ ] 도메인 화이트리스트 설정

### 데이터 마이그레이션
- [ ] 사용자 데이터 이전
- [ ] 매칭 요청 데이터 이전
- [ ] 채팅 데이터 이전 (선택)
- [ ] 게시글 데이터 이전 (선택)

### 코드 배포
- [ ] 환경 변수 확인
- [ ] 빌드 테스트 (`npm run build`)
- [ ] Firebase Hosting 배포 또는 기존 호스팅 업데이트

### 테스트
- [ ] 회원가입 플로우 테스트
- [ ] 로그인 테스트
- [ ] 프로필 수정 테스트
- [ ] 매칭 요청/수락 테스트
- [ ] 이미지 업로드 테스트
- [ ] 알림 테스트

---

## 📝 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firestore 데이터 모델링](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Firebase Storage 가이드](https://firebase.google.com/docs/storage)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

## 🐛 알려진 이슈

1. **Firestore 페이지네이션**: MatchingTab에서 페이지네이션 구현 필요 (`lastDoc` 기반)
2. **실시간 업데이트**: 채팅 및 알림에 Firestore 리스너 추가 필요
3. **이미지 최적화**: 썸네일 자동 생성 (Cloud Functions 권장)

---

## 📞 문의

마이그레이션 관련 문제가 있으면 개발팀에 문의하세요.

**마지막 업데이트**: 2025-12-15
