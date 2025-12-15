# 🔥 Firebase 설정 체크리스트 (B안: PhoneAuth 통일)

## ⚠️ 필수 작업 (지금 해야 할 것)

### 1️⃣ 환경변수 파일 생성 (로컬 개발용)

**파일 위치**: 프로젝트 루트에 `.env` 파일 생성

```env
VITE_FIREBASE_API_KEY=AIzaSyAKUD99sVYnK5irQey028CmYUE-ZeiWh18
VITE_FIREBASE_AUTH_DOMAIN=campus-4f167.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=campus-4f167
VITE_FIREBASE_STORAGE_BUCKET=campus-4f167.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=874089973237
VITE_FIREBASE_APP_ID=1:874089973237:web:f9ade8cb63a9bf00c64cbc
VITE_FIREBASE_MEASUREMENT_ID=G-0BRQDHMJME
```

**주의**: `.env` 파일은 `.gitignore`에 추가되어 있어야 합니다 (Git에 올라가면 안 됨)

---

### 2️⃣ Firebase Console에서 Phone 인증 활성화

**링크**: https://console.firebase.google.com/project/campus-4f167/authentication/providers

**단계**:
1. Firebase Console 접속 → **campus-4f167** 프로젝트 선택
2. 왼쪽 메뉴 → **Authentication** 클릭
3. **Sign-in method** 탭 클릭
4. **Phone** 제공업체 찾기 → 클릭
5. **Enable** 토글을 **ON**으로 변경
6. **Save** 버튼 클릭

**완료 확인**: Phone 제공업체 옆에 "Enabled" 표시가 나타나야 함

---

### 3️⃣ 테스트 전화번호 추가 (개발용, 선택사항)

**위치**: Authentication > Sign-in method > Phone 설정 페이지 하단

**추가할 테스트 번호**:
- **전화번호**: `+82 10 1234 5678`
- **인증 코드**: `123456`

**이유**: 실제 SMS 없이 개발/테스트 가능 (무료 할당량 절약)

**단계**:
1. Phone 설정 페이지 하단 **"Phone numbers for testing"** 섹션 찾기
2. **Add phone number** 클릭
3. 전화번호와 인증 코드 입력
4. **Add** → **Save**

---

### 4️⃣ Authorized domains 확인 (localhost 허용)

**링크**: https://console.firebase.google.com/project/campus-4f167/authentication/settings

**확인 사항**:
- ✅ `localhost` 가 목록에 있는지 확인
- ✅ `127.0.0.1` 가 목록에 있는지 확인

**없으면 추가**:
1. **Authorized domains** 섹션에서 **Add domain** 클릭
2. `localhost` 입력 → **Add**
3. `127.0.0.1` 입력 → **Add**

---

### 5️⃣ Firebase Console 프로젝트 ID 확인

**현재 프로젝트 ID**: `campus-4f167`

**확인 위치**: 
- Firebase Console 상단 프로젝트 이름 옆
- 또는: https://console.firebase.google.com/project/campus-4f167/settings/general

**주의**: `.env` 파일의 `VITE_FIREBASE_PROJECT_ID`와 일치해야 함

---

## 📋 선택 작업 (나중에 해도 됨)

### 6️⃣ Firestore Rules 업데이트 (현재 미사용, Supabase 사용 중)

**현재 상태**: Firestore rules가 2025-11-23에 만료됨

**하지만**: 코드에서 Firestore를 사용하지 않음 (Supabase 사용 중)

**결론**: 지금은 건드릴 필요 없음. 나중에 Firestore를 쓰게 되면 그때 업데이트

---

### 7️⃣ Firebase Storage 설정 (필요 시)

**현재**: 코드에서 Supabase Storage 사용 중

**Firebase Storage를 쓰려면**:
1. https://console.firebase.google.com/project/campus-4f167/storage
2. **Get Started** 클릭
3. 기본 보안 규칙으로 시작

**지금은**: 선택사항 (Supabase Storage 사용 중이므로)

---

### 8️⃣ 배포 환경 환경변수 설정 (프로덕션)

**Firebase Hosting 배포 시**:
- Firebase Console > Hosting > 환경변수 설정
- 또는 배포 플랫폼(Vercel, Netlify 등)에서 환경변수 설정

**주의**: 프로덕션 환경변수는 `.env` 파일과 동일한 값이어야 함

---

## ✅ 설정 완료 체크리스트

다음 항목들을 모두 체크하세요:

- [ ] `.env` 파일 생성 완료 (로컬 개발용)
- [ ] Firebase Console에서 Phone 인증 활성화 완료
- [ ] 테스트 전화번호 추가 완료 (선택사항)
- [ ] `localhost` 도메인 허용 확인 완료
- [ ] 프로젝트 ID 확인 완료 (`campus-4f167`)
- [ ] 개발 서버 재시작 (`npm run dev`)
- [ ] 로그인 페이지에서 전화번호 인증 테스트 성공

---

## 🧪 테스트 방법

### 1. 로컬 개발 서버 실행
```bash
npm run dev
```

### 2. 브라우저에서 테스트
1. http://localhost:5173 접속
2. 로그인 페이지 → 전화번호 입력
3. **테스트 전화번호 사용**: `010-1234-5678` (또는 `+82 10 1234 5678`)
4. 인증번호 입력: `123456` (테스트 코드)
5. 인증 성공 확인

### 3. 실제 전화번호로 테스트 (선택사항)
- 실제 전화번호 입력
- 실제 SMS 수신
- 인증번호 입력

---

## 🚨 문제 해결

### 오류: `auth/operation-not-allowed`
**원인**: Phone 인증이 활성화되지 않음
**해결**: 2️⃣ 단계 다시 확인 (Firebase Console에서 Phone 활성화)

### 오류: `auth/invalid-phone-number`
**원인**: 전화번호 형식 오류
**해결**: `+82 10 1234 5678` 형식으로 입력 (국가코드 +82 필수)

### 오류: 환경변수 undefined
**원인**: `.env` 파일이 없거나 잘못됨
**해결**: 1️⃣ 단계 다시 확인 (`.env` 파일 생성)

### 오류: localhost에서 인증 실패
**원인**: Authorized domains에 localhost 없음
**해결**: 4️⃣ 단계 다시 확인 (localhost 도메인 추가)

---

## 📚 참고 링크

- **Firebase Console**: https://console.firebase.google.com/project/campus-4f167
- **Authentication 설정**: https://console.firebase.google.com/project/campus-4f167/authentication/providers
- **프로젝트 설정**: https://console.firebase.google.com/project/campus-4f167/settings/general
- **Firebase Phone Auth 문서**: https://firebase.google.com/docs/auth/web/phone-auth

---

**마지막 업데이트**: 2025-12-12 (B안: Firebase PhoneAuth 통일 완료)

