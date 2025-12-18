# 🔥 Firestore 데이터베이스 설정 가이드

## 📋 확인해야 할 사항

### 1. 'attract' 데이터베이스 생성 확인

Firebase Console에서 확인:
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택 (`attract--web`)
3. **Firestore Database** 메뉴 클릭
4. 상단에서 데이터베이스 목록 확인
5. **'attract' 데이터베이스가 있는지 확인**

**없다면 생성하기:**
1. Firestore Database 페이지에서 **"데이터베이스 추가"** 클릭
2. 데이터베이스 이름: `attract` 입력
3. 리전 선택 (아시아-동북 권장)
4. 보안 규칙: **"테스트 모드에서 시작"** 선택 (나중에 수정 가능)
5. **"활성화"** 클릭

### 2. 보안 규칙 확인 및 배포

현재 보안 규칙 (`firestore.rules`):
- 날짜 제한: 2025년 11월 23일까지
- 모든 문서에 대해 read/write 허용

**보안 규칙 배포:**
```bash
# Firebase CLI가 설치되어 있어야 함
firebase deploy --only firestore:rules
```

또는 Firebase Console에서:
1. Firestore Database > Rules 탭
2. 규칙 편집
3. **"게시"** 클릭

### 3. 회원가입 시 인증 문제 해결

현재 보안 규칙은 인증 없이도 작동하지만, 회원가입 시 인증이 필요할 수 있습니다.

**임시 해결책 (개발 중):**
보안 규칙을 다음과 같이 수정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // users 컬렉션 - 인증 없이도 생성 가능 (회원가입용)
    match /users/{userId} {
      allow create: if true;  // 회원가입 허용
      allow read: if true;    // 읽기 허용
      allow update: if request.auth != null;  // 업데이트는 인증 필요
      allow delete: if request.auth != null;  // 삭제는 인증 필요
    }
    
    // 기타 컬렉션
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 11, 23);
    }
  }
}
```

### 4. 데이터 저장 확인

회원가입 시도 후:
1. Firebase Console > Firestore Database > 'attract' 데이터베이스 선택
2. **Data** 탭에서 `users` 컬렉션 확인
3. 문서가 생성되었는지 확인

**콘솔 로그 확인:**
브라우저 개발자 도구 콘솔에서 다음 로그 확인:
- "Firestore 컬렉션 참조 생성 중..."
- "사용자 데이터 준비 중..."
- "Firestore에 문서 추가 시도 중..."
- "문서 추가 완료, 문서 ID: ..."

오류가 발생하면 에러 메시지를 확인하세요.

## 🚨 문제 해결

### 문제 1: 데이터베이스가 없다
→ 위의 "1. 'attract' 데이터베이스 생성 확인" 참고

### 문제 2: 권한 오류 (Permission denied)
→ 보안 규칙 확인 및 배포

### 문제 3: 네트워크 오류
→ 인터넷 연결 확인, Firebase 프로젝트 설정 확인

### 문제 4: 날짜 제한 오류
→ `firestore.rules` 파일의 날짜를 현재 날짜 이후로 수정

## ✅ 체크리스트

- [ ] 'attract' 데이터베이스가 생성되어 있음
- [ ] 보안 규칙이 배포되어 있음
- [ ] 보안 규칙 날짜가 현재 날짜 이후임
- [ ] 회원가입 시도 시 콘솔에 로그가 표시됨
- [ ] Firebase Console에서 데이터가 저장되는지 확인됨

