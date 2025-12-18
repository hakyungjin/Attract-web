# 💳 토스페이먼츠 연동 가이드

## 📋 개요

토스페이먼츠를 사용하여 카드 결제 및 토스페이 결제를 연동합니다.

---

## 🔑 1단계: 토스페이먼츠 테스트 키 발급

### 1. 토스페이먼츠 가입 및 로그인

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속
2. 회원가입 또는 로그인

### 2. 테스트 키 발급

1. 대시보드에서 **"내 상점"** 메뉴 클릭
2. **"테스트 모드"** 활성화
3. **"시크릿 키"** 메뉴에서 다음 키 확인:
   - **클라이언트 키 (Client Key)**: `test_ck_...`로 시작
   - **시크릿 키 (Secret Key)**: `test_sk_...`로 시작

### 3. 키 확인 위치

- **클라이언트 키**: 개발자센터 > 내 상점 > 시크릿 키 > 클라이언트 키
- **시크릿 키**: 개발자센터 > 내 상점 > 시크릿 키 > 시크릿 키

---

## ⚙️ 2단계: 환경 변수 설정

### 프론트엔드 환경 변수 (`.env` 파일)

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 토스페이먼츠 클라이언트 키 (테스트)
VITE_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq

# Supabase 설정 (이미 있을 수 있음)
VITE_SUPABASE_URL=https://ytffobltrwkgxiedorsd.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**중요**: 
- `VITE_TOSS_CLIENT_KEY`는 발급받은 실제 테스트 클라이언트 키로 교체하세요
- `.env` 파일은 절대 Git에 커밋하지 마세요 (`.gitignore`에 포함되어 있음)

### Supabase Edge Function 환경 변수

Supabase 대시보드에서 Edge Function의 시크릿 키를 설정해야 합니다:

1. [Supabase 대시보드](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. **Settings** > **Edge Functions** > **Secrets** 이동
4. 다음 환경 변수 추가:
   - `TOSS_SECRET_KEY`: 토스페이먼츠 시크릿 키 (`test_sk_...`로 시작)
   - `SUPABASE_URL`: Supabase 프로젝트 URL (자동 설정됨)
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 역할 키

**시크릿 키 설정 방법**:

```bash
# Supabase CLI 사용 시
supabase secrets set TOSS_SECRET_KEY=test_sk_your_secret_key_here
```

또는 Supabase 대시보드에서 직접 추가:
- Settings > Edge Functions > Secrets > "New secret" 클릭
- Name: `TOSS_SECRET_KEY`
- Value: 발급받은 시크릿 키 입력

---

## 🚀 3단계: Supabase Edge Function 배포

### 1. Supabase CLI 설치 (아직 안 했다면)

```bash
npm install -g supabase
```

### 2. Supabase 로그인

```bash
supabase login
```

### 3. 프로젝트 링크

```bash
# 프로젝트 참조 ID 확인 (Supabase 대시보드 > Settings > General)
supabase link --project-ref ytffobltrwkgxiedorsd
```

### 4. Edge Function 배포

```bash
# confirm-payment 함수 배포
supabase functions deploy confirm-payment
```

---

## 🧪 4단계: 테스트 결제

### 테스트 카드 정보

토스페이먼츠 테스트 모드에서는 다음 테스트 카드 정보를 사용할 수 있습니다:

**성공 케이스**:
- 카드번호: `1234-5678-9012-3456`
- 유효기간: `12/34`
- CVV: `123`
- 비밀번호: `123456`

**실패 케이스**:
- 카드번호: `4000-0000-0000-0002` (잔액 부족)
- 카드번호: `4000-0000-0000-0003` (한도 초과)

### 테스트 절차

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 코인샵 페이지 접속: `/coin-shop`

3. 패키지 선택 후 결제 수단 선택:
   - 카드 결제
   - 토스페이 결제
   - 카카오페이 (기존)

4. 테스트 카드 정보 입력하여 결제 진행

5. 결제 완료 후 확인:
   - 결제 성공 페이지 표시
   - 사용자 코인 증가 확인
   - 결제 이력 저장 확인

---

## 📝 5단계: 프로덕션 전환

### 1. 토스페이먼츠 프로덕션 키 발급

1. 토스페이먼츠 개발자센터에서 **"운영 모드"** 전환
2. 프로덕션 클라이언트 키 및 시크릿 키 발급

### 2. 환경 변수 업데이트

**프론트엔드** (`.env.production`):
```env
VITE_TOSS_CLIENT_KEY=live_ck_your_production_client_key
```

**Supabase Edge Function**:
```bash
supabase secrets set TOSS_SECRET_KEY=live_sk_your_production_secret_key
```

### 3. 결제 승인 URL 확인

프로덕션에서는 실제 도메인으로 승인 URL을 설정해야 합니다:

```typescript
// src/pages/coin-shop/page.tsx
successUrl: `${window.location.origin}/payment/success?orderId=${orderId}`,
failUrl: `${window.location.origin}/payment/fail`,
```

---

## 🔒 보안 주의사항

### ❌ 절대 하면 안 되는 것

1. **시크릿 키를 클라이언트에 노출**
   - 시크릿 키는 절대 `.env` 파일에 `VITE_` 접두사로 추가하지 마세요
   - 시크릿 키는 Supabase Edge Function의 환경 변수로만 관리

2. **환경 변수 파일을 Git에 커밋**
   - `.env` 파일은 `.gitignore`에 포함되어 있어야 함

3. **프로덕션 키를 테스트 환경에서 사용**
   - 테스트와 프로덕션 키를 분리하여 관리

### ✅ 권장 사항

1. **환경별 키 분리**
   - 테스트: `test_ck_...`, `test_sk_...`
   - 프로덕션: `live_ck_...`, `live_sk_...`

2. **결제 금액 검증**
   - 서버에서 항상 결제 금액을 재확인
   - 클라이언트에서 전달된 금액을 그대로 사용하지 않기

3. **중복 결제 방지**
   - `orderId` 중복 체크
   - 결제 승인 전 상태 확인

---

## 🐛 문제 해결

### 결제 승인 실패 시

1. **브라우저 콘솔 확인**
   - 에러 메시지 확인
   - 네트워크 탭에서 API 호출 상태 확인

2. **Supabase Edge Function 로그 확인**
   ```bash
   supabase functions logs confirm-payment
   ```

3. **환경 변수 확인**
   - `.env` 파일에 `VITE_TOSS_CLIENT_KEY` 설정 확인
   - Supabase Edge Function에 `TOSS_SECRET_KEY` 설정 확인

### 토스페이먼츠 초기화 실패 시

1. 클라이언트 키가 올바른지 확인
2. 네트워크 연결 확인
3. 브라우저 콘솔에서 에러 메시지 확인

---

## 📚 참고 자료

- [토스페이먼츠 개발자 문서](https://developers.tosspayments.com/)
- [토스페이먼츠 SDK 문서](https://docs.tosspayments.com/sdk)
- [Supabase Edge Functions 문서](https://supabase.com/docs/guides/functions)

---

## ✅ 체크리스트

- [ ] 토스페이먼츠 테스트 키 발급 완료
- [ ] `.env` 파일에 `VITE_TOSS_CLIENT_KEY` 설정
- [ ] Supabase Edge Function에 `TOSS_SECRET_KEY` 설정
- [ ] `confirm-payment` Edge Function 배포 완료
- [ ] 테스트 결제 성공 확인
- [ ] 결제 후 코인 증가 확인
- [ ] 결제 이력 저장 확인
- [ ] 프로덕션 키 발급 (운영 전환 시)

