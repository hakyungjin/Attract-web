# 🔥 Firebase 전화번호 인증 설정 가이드

## ❌ 현재 오류

```
Firebase: Error (auth/operation-not-allowed)
```

이 오류는 Firebase Console에서 전화번호 인증이 **활성화되지 않아서** 발생합니다.

## ✅ 해결 방법 (5분 소요)

### 1단계: Firebase Console 접속

1. https://console.firebase.google.com 접속
2. **campus-4f167** 프로젝트 선택

### 2단계: Authentication 메뉴로 이동

1. 왼쪽 메뉴에서 **"Authentication"** 클릭
2. **"Sign-in method"** 탭 클릭

### 3단계: Phone 인증 활성화

1. 제공업체 목록에서 **"Phone"** 찾기
2. **"Phone"** 클릭하여 설정 열기
3. **"Enable"** 토글 스위치를 **ON**으로 변경
4. **"Save"** 버튼 클릭

### 4단계: 테스트 전화번호 추가 (선택사항)

개발 중에 실제 SMS를 받지 않고 테스트하려면:

1. Phone 설정 페이지 하단의 **"Phone numbers for testing"** 섹션 찾기
2. **전화번호와 인증 코드** 추가:

```
전화번호: +82 10 1234 5678
인증 코드: 123456
```

3. **"Add"** 버튼 클릭
4. **"Save"** 버튼 클릭

이제 이 전화번호로 테스트할 때 실제 SMS 없이 123456을 입력하면 인증됩니다.

### 5단계: 애플리케이션 재시작

```bash
# 개발 서버 재시작 (이미 실행 중이라면)
Ctrl + C
npm run dev
```

## 📱 전화번호 형식

한국 전화번호는 다음 형식으로 입력해야 합니다:

```
+82 10 1234 5678
+821012345678
```

**주의**:
- 앞에 `+82` 국가 코드 필수
- 첫 번째 `0`은 제거 (010 → 10)

## 🧪 테스트 방법

### 방법 1: 실제 전화번호로 테스트

1. 애플리케이션에서 전화번호 입력
2. 실제 SMS 수신
3. 인증 코드 입력

### 방법 2: 테스트 전화번호로 테스트 (권장)

1. Firebase Console에서 설정한 테스트 전화번호 입력 (`+82 10 1234 5678`)
2. SMS 없이 바로 인증 코드 입력 (`123456`)
3. 인증 완료

## 🔧 Firebase Console 설정 체크리스트

다음 항목들을 확인하세요:

### Authentication 설정
- [ ] Phone 인증 활성화 (Enable 토글 ON)
- [ ] 테스트 전화번호 추가 (선택사항)
- [ ] Email/Password 인증 활성화 (선택사항)

### 허용된 도메인
1. Authentication > Settings > **Authorized domains** 확인
2. 다음 도메인이 있는지 확인:
   - ✅ `localhost`
   - ✅ `127.0.0.1`

추가 필요 시:
   - **Add domain** 버튼 클릭
   - `localhost` 입력 → Save

### 앱 등록 확인
1. Project Overview > Project settings
2. **Your apps** 섹션에서 웹 앱 등록 확인
3. Firebase SDK snippet이 올바른지 확인

## 🚨 일반적인 오류 및 해결

### 오류 1: `auth/operation-not-allowed`
**원인**: Phone 인증이 비활성화됨
**해결**: Firebase Console에서 Phone 인증 활성화

### 오류 2: `auth/invalid-phone-number`
**원인**: 전화번호 형식이 잘못됨
**해결**: `+82 10 1234 5678` 형식으로 입력

### 오류 3: `auth/missing-phone-number`
**원인**: 전화번호가 비어있음
**해결**: 전화번호 입력 확인

### 오류 4: `auth/too-many-requests`
**원인**: 너무 많은 요청
**해결**: 잠시 후 다시 시도 (1-2분 대기)

### 오류 5: `auth/quota-exceeded`
**원인**: Firebase 무료 할당량 초과
**해결**:
- Firebase Console에서 사용량 확인
- 테스트 전화번호 사용
- 또는 유료 플랜으로 업그레이드

## 📊 Firebase 무료 할당량

Firebase Blaze (무료) 플랜 제한:

| 항목 | 무료 할당량 |
|------|------------|
| Phone Auth (미국/캐나다) | 10,000 SMS/월 |
| Phone Auth (기타 국가) | 제한적 |
| 인증 사용자 수 | 무제한 |

**참고**: 한국은 SMS 비용이 발생할 수 있으므로 테스트 시 **테스트 전화번호** 사용을 권장합니다.

## 🎯 빠른 설정 링크

직접 이동할 수 있는 링크:

1. **Authentication 설정**:
   https://console.firebase.google.com/project/campus-4f167/authentication/providers

2. **Authorized domains**:
   https://console.firebase.google.com/project/campus-4f167/authentication/settings

3. **프로젝트 설정**:
   https://console.firebase.google.com/project/campus-4f167/settings/general

## 📝 설정 완료 후 테스트

### 1. 브라우저 개발자 도구 확인

```javascript
// 콘솔에서 확인
console.log('reCAPTCHA verified'); // ✅ 나타나야 함
console.log('SMS 전송 성공');      // ✅ 나타나야 함
```

### 2. 네트워크 탭 확인

성공 시 다음 요청이 **200 OK**여야 함:
```
POST https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode
Status: 200 OK
```

### 3. SMS 수신 확인

실제 전화번호 사용 시:
- SMS가 1-2분 내에 도착해야 함
- 6자리 인증 코드 포함

테스트 전화번호 사용 시:
- SMS 없이 설정한 인증 코드 입력 (`123456`)

## 💡 권장 설정

### 개발 환경
```
✅ Phone 인증 활성화
✅ 테스트 전화번호 추가 (+82 10 1234 5678 → 123456)
✅ localhost 도메인 허용
```

### 프로덕션 환경
```
✅ Phone 인증 활성화
❌ 테스트 전화번호 제거 (보안)
✅ 실제 도메인 추가
✅ reCAPTCHA Enterprise 활성화 (권장)
```

## 🔐 보안 권장사항

1. **테스트 전화번호는 개발 환경에서만 사용**
2. **프로덕션에서는 제거** (보안 위험)
3. **API 키 노출 주의** (GitHub 등)
4. **허용된 도메인만 추가** (불필요한 도메인 제거)

## 📚 참고 문서

- [Firebase Phone Authentication](https://firebase.google.com/docs/auth/web/phone-auth)
- [reCAPTCHA 설정](https://firebase.google.com/docs/auth/web/phone-auth#enable-recaptcha)
- [테스트 전화번호](https://firebase.google.com/docs/auth/web/phone-auth#test-with-fictional-phone-numbers)

---

## ✅ 설정 체크리스트

Phone 인증을 성공적으로 설정하려면:

- [ ] Firebase Console 접속
- [ ] Authentication > Sign-in method > Phone 활성화
- [ ] 테스트 전화번호 추가 (선택)
- [ ] localhost 도메인 확인
- [ ] 개발 서버 재시작
- [ ] 전화번호 로그인 테스트

**모두 완료하면 전화번호 인증이 정상 작동합니다!** 🎉
