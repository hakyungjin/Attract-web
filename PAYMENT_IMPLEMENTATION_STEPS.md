# 💳 결제 시스템 구현 단계별 가이드

## ✅ 완료된 작업

1. ✅ 프론트엔드 코드 개선
   - 환경 변수에서 Toss 키 가져오기
   - 실제 사용자 정보 연동
   - 데이터베이스에서 코인 패키지 로드
   - 사용자 보유 코인 표시

2. ✅ 데이터베이스 스키마 파일 생성 (`database_payments_schema.sql`)
3. ✅ Supabase Edge Function 코드 생성 (`supabase/functions/confirm-payment/index.ts`)

---

## 📋 다음 단계 (순서대로 진행)

### 1단계: 데이터베이스 스키마 적용

1. Supabase 대시보드 접속
   - https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd/sql

2. SQL Editor 열기

3. `database_payments_schema.sql` 파일 내용 복사하여 실행
   - 또는 직접 SQL Editor에 붙여넣기

4. 실행 확인
   ```sql
   -- 테이블 생성 확인
   SELECT * FROM public.payments LIMIT 1;
   ```

---

### 2단계: 환경 변수 설정

`.env` 파일에 다음 추가:

```env
# Toss Payments 클라이언트 키 (테스트용)
VITE_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq

# Supabase (이미 있을 수 있음)
VITE_SUPABASE_URL=https://ytffobltrwkgxiedorsd.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

### 3단계: Supabase Edge Function 배포

#### 3-1. Supabase CLI 설치 (아직 안 했다면)

```bash
npm install -g supabase
```

#### 3-2. Supabase 로그인

```bash
supabase login
```

#### 3-3. 프로젝트 링크

```bash
# 프로젝트 참조 ID 확인 (Supabase 대시보드 > Settings > General)
supabase link --project-ref ytffobltrwkgxiedorsd
```

#### 3-4. 환경 변수 설정

Supabase 대시보드에서:
1. Settings > Edge Functions > Secrets 이동
2. 다음 환경 변수 추가:
   - `TOSS_SECRET_KEY`: Toss Payments Secret Key (테스트: `test_sk_...`)
   - `SUPABASE_URL`: `https://ytffobltrwkgxiedorsd.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key (Settings > API에서 확인)

또는 CLI로:

```bash
supabase secrets set TOSS_SECRET_KEY=test_sk_D5GePWvyJnrK0W0k6q8gLzN97Eoq
supabase secrets set SUPABASE_URL=https://ytffobltrwkgxiedorsd.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 3-5. Edge Function 배포

```bash
supabase functions deploy confirm-payment
```

배포 확인:
- Supabase 대시보드 > Edge Functions에서 `confirm-payment` 함수 확인

---

### 4단계: 테스트

#### 4-1. 로컬 개발 서버 실행

```bash
npm run dev
```

#### 4-2. 결제 테스트

1. 로그인 후 코인샵 페이지 접속 (`/coin-shop`)
2. 패키지 선택
3. 결제 수단 선택 (토스페이, 카드, 계좌이체)
4. 결제 진행
   - 테스트 카드: 1234-5678-9012-3456
   - 유효기간: 12/34
   - CVC: 123
   - 비밀번호: 12
5. 결제 성공 후 코인 증가 확인

#### 4-3. 데이터 확인

Supabase 대시보드에서:
- `payments` 테이블에 결제 기록 확인
- `users` 테이블의 `coins` 필드 증가 확인

---

## 🔧 문제 해결

### Edge Function 호출 실패

**증상**: 결제 승인 시 401 또는 403 에러

**해결**:
1. Supabase Edge Function의 CORS 설정 확인
2. 인증 토큰이 올바르게 전달되는지 확인
3. Edge Function 로그 확인 (Supabase 대시보드 > Edge Functions > Logs)

### 결제 승인은 되지만 코인이 증가하지 않음

**해결**:
1. `payments` 테이블에 기록이 생성되었는지 확인
2. `users` 테이블의 `coins` 필드 업데이트 확인
3. Edge Function 로그에서 에러 확인

### Toss Payments API 오류

**해결**:
1. Toss Secret Key가 올바른지 확인
2. 테스트 환경에서는 테스트 키 사용 확인
3. Toss Payments 대시보드에서 결제 내역 확인

---

## 📊 프로덕션 전환

### 1. Toss Payments 실제 계정 설정

1. Toss Payments 가입 및 계약
2. 실제 Secret Key 발급
3. 환경 변수 업데이트:
   ```env
   VITE_TOSS_CLIENT_KEY=live_ck_...
   ```
4. Supabase Edge Function 환경 변수 업데이트:
   ```bash
   supabase secrets set TOSS_SECRET_KEY=live_sk_...
   ```

### 2. 웹훅 설정 (선택사항)

결제 상태 변경 시 자동 알림을 받으려면:
1. Toss Payments 대시보드 > 웹훅 설정
2. 웹훅 URL: `https://your-domain.com/api/webhook/payment`
3. Supabase Edge Function으로 웹훅 핸들러 구현

---

## 📝 추가 기능 구현 (선택사항)

### 결제 이력 조회 페이지

사용자가 자신의 결제 내역을 조회할 수 있는 페이지:

```typescript
// src/pages/payment-history/page.tsx
const { data: payments } = await supabase
  .from('payments')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

### 환불 처리

환불 요청 및 처리 기능 구현

---

## 🔗 참고 링크

- [Toss Payments 문서](https://docs.tosspayments.com/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Toss Payments 테스트 카드](https://docs.tosspayments.com/guides/v1/test-keys)

---

## ✅ 체크리스트

- [ ] 데이터베이스 스키마 적용 (`database_payments_schema.sql`)
- [ ] 환경 변수 설정 (`.env` 파일)
- [ ] Supabase Edge Function 배포
- [ ] Edge Function 환경 변수 설정
- [ ] 테스트 결제 성공
- [ ] 결제 후 코인 증가 확인
- [ ] 결제 이력 저장 확인
- [ ] 프로덕션 환경 변수 설정 (실제 키로 변경)

