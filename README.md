# Attract Web - 소셜 매칭 플랫폼

React + Vite + TypeScript + Supabase로 구축된 소셜 매칭 웹 애플리케이션입니다.

## 프로젝트 구조

이 프로젝트는 **프론트엔드와 백엔드가 분리**되어 있습니다:

```
Attract web/           # 프론트엔드 (현재 프로젝트)
Attract-backend/       # 백엔드 API 서버 (별도 프로젝트)
```

백엔드 프로젝트는 [Attract-backend](../Attract-backend) 폴더를 참조하세요.

## 기술 스택

### Frontend
- **React 19.1.0** - UI 라이브러리
- **Vite 7.0.3** - 빌드 도구 및 개발 서버
- **TypeScript 5.8.3** - 타입 안정성
- **Tailwind CSS 3.4.17** - 스타일링
- **React Router DOM 7.6.3** - 라우팅

### 다국어 지원
- **i18next** - 국제화(i18n)
- **react-i18next** - React 통합
- **i18next-browser-languagedetector** - 자동 언어 감지

### 백엔드 & 데이터베이스
- **Supabase 2.57.4** - 인증, 데이터베이스, 실시간 기능
- **Firebase 12.0.0** - 추가 백엔드 서비스

### 결제
- **Toss Payments SDK 1.9.2** - 토스페이먼츠 결제 통합
- **Stripe React 4.0.2** - Stripe 결제 통합

### 차트 & UI
- **Recharts 3.2.0** - 데이터 시각화
- **Lucide React 0.469.0** - 아이콘

## 프로젝트 구조

```
Attract web/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   └── base/           # 기본 컴포넌트 (Header, TabBar)
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── home/           # 홈 페이지 (매칭, 채팅, 커뮤니티, 프로필 탭)
│   │   ├── login/          # 로그인 페이지
│   │   ├── coin-shop/      # 자석(코인) 충전 페이지
│   │   ├── payment/        # 결제 성공/실패 페이지
│   │   ├── profile-edit/   # 프로필 수정
│   │   ├── profile-detail/ # 프로필 상세
│   │   ├── notifications/  # 알림
│   │   ├── matching-requests/ # 매칭 요청
│   │   └── admin/          # 관리자 페이지
│   ├── router/             # 라우팅 설정
│   ├── i18n/               # 다국어 설정
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── main.tsx            # 엔트리 포인트
├── package.json
└── README.md
```

## 주요 기능

### 1. 매칭 시스템
- 사용자 프로필 기반 매칭
- 자석(코인) 시스템으로 매칭 요청
- 실시간 매칭 알림

### 2. 결제 시스템 (토스페이먼츠)
결제 플로우는 다음과 같이 구성됩니다:

#### 결제 프로세스
1. **자석 패키지 선택** (`/coin-shop`)
   - 6가지 패키지 제공 (50 ~ 2,000 자석)
   - 보너스 자석 포함

2. **결제 수단 선택**
   - 토스페이 (간편결제)
   - 신용/체크카드
   - 계좌이체

3. **결제 진행**
   - 토스페이먼츠 SDK를 통한 안전한 결제
   - 테스트 키: `test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq`

4. **결제 완료**
   - 성공 시: `/payment/success` 페이지로 리다이렉트
   - 실패 시: `/payment/fail` 페이지로 리다이렉트

#### 결제 데이터 흐름
```
클라이언트                     토스페이먼츠                서버(TODO)
   |                              |                        |
   |--- requestPayment() -------->|                        |
   |                              |                        |
   |<-- 결제 위젯 표시 ------------|                        |
   |                              |                        |
   |--- 결제 정보 입력 ----------->|                        |
   |                              |                        |
   |<-- successUrl redirect ------|                        |
   |                              |                        |
   |--- confirmPayment() --------------------------------->|
   |                              |                        |
   |<-- Supabase 업데이트 -------------------------------|
   |    (코인 충전, 결제 내역 저장)                        |
```

### 3. 채팅 시스템
- 매칭된 사용자와 실시간 채팅
- Supabase Realtime 활용

### 4. 커뮤니티
- 게시글 작성 및 조회
- 댓글 기능

### 5. 프로필 관리
- 프로필 정보 수정
- 사진 업로드

### 6. 관리자 페이지
- 사용자 관리
- 통계 대시보드 (Recharts)

## Supabase 데이터베이스 구조

### 주요 테이블

#### users (사용자)
```sql
- id (uuid, PK)
- email (text)
- name (text)
- profile_image (text)
- coins (integer) -- 보유 자석 수
- created_at (timestamp)
```

#### payments (결제 내역) - TODO
```sql
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- order_id (text) -- 토스페이먼츠 주문 ID
- payment_key (text) -- 토스페이먼츠 결제 키
- amount (integer) -- 결제 금액
- coins (integer) -- 충전된 자석 수
- status (text) -- 'pending', 'completed', 'failed'
- created_at (timestamp)
```

#### matches (매칭)
```sql
- id (uuid, PK)
- user_id_1 (uuid, FK -> users.id)
- user_id_2 (uuid, FK -> users.id)
- status (text) -- 'pending', 'accepted', 'rejected'
- created_at (timestamp)
```

#### messages (메시지)
```sql
- id (uuid, PK)
- match_id (uuid, FK -> matches.id)
- sender_id (uuid, FK -> users.id)
- content (text)
- created_at (timestamp)
```

#### posts (게시글)
```sql
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- title (text)
- content (text)
- created_at (timestamp)
```

## 설치 및 실행

### 전체 시스템 실행 순서

1. **백엔드 서버 실행** (먼저 실행 필수!)
2. **프론트엔드 실행**

### 프론트엔드 설정

#### 1. 의존성 설치
```bash
cd "Attract web"
npm install
```

#### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Toss Payments (클라이언트 키)
VITE_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq

# Firebase (선택사항)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

#### 3. 개발 서버 실행
```bash
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

#### 4. 빌드
```bash
npm run build
```

#### 5. 프리뷰
```bash
npm run preview
```

### 백엔드 설정

백엔드 설정 방법은 [Attract-backend README](../Attract-backend/README.md)를 참조하세요.

간단 요약:
```bash
cd ../Attract-backend
npm install
# .env 파일 생성 (백엔드 README 참조)
npm run dev
```

## 결제 시스템 설정

### 토스페이먼츠 설정

1. **토스페이먼츠 개발자 센터** (https://developers.tosspayments.com/)에서 회원가입
2. **상점 생성** 및 **클라이언트 키**, **시크릿 키** 발급
3. 테스트 모드에서 개발 후 프로덕션 키로 전환

### 결제 승인 서버 (구현 완료 ✅)

결제 승인은 **백엔드 서버**에서 처리됩니다:

**API 엔드포인트:**
```
POST http://localhost:3001/api/payment/confirm
```

**요청:**
```json
{
  "orderId": "ORDER_1234567890_abc123",
  "paymentKey": "payment_key_from_toss",
  "amount": 5000,
  "userId": "user-uuid",
  "coins": 50
}
```

**응답:**
```json
{
  "success": true,
  "message": "결제가 완료되었습니다.",
  "data": {
    "orderId": "ORDER_1234567890_abc123",
    "amount": 5000,
    "coins": 50,
    "currentCoins": 200,
    "approvedAt": "2025-01-26T12:00:00.000Z"
  }
}
```

백엔드 서버 코드는 [Attract-backend](../Attract-backend) 프로젝트를 참조하세요.

## 보안 고려사항

### 결제 보안
1. **클라이언트 키만 노출**: 시크릿 키는 절대 프론트엔드에 노출하지 않습니다
2. **서버 측 검증**: 결제 승인은 반드시 서버에서 처리합니다
3. **금액 검증**: 서버에서 결제 금액을 다시 검증합니다
4. **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS를 사용합니다

### Supabase 보안
1. **Row Level Security (RLS)** 활성화
2. **API 키 관리**: 환경 변수로 관리
3. **권한 관리**: 사용자별 데이터 접근 제어

## 라우팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | Home | 메인 페이지 (매칭, 채팅, 커뮤니티, 프로필) |
| `/login` | Login | 로그인 |
| `/coin-shop` | Coin Shop | 자석 충전 |
| `/payment/success` | Payment Success | 결제 성공 |
| `/payment/fail` | Payment Fail | 결제 실패 |
| `/profile-edit` | Profile Edit | 프로필 수정 |
| `/profile-detail` | Profile Detail | 프로필 상세 |
| `/notifications` | Notifications | 알림 |
| `/matching-requests` | Matching Requests | 매칭 요청 |
| `/admin` | Admin | 관리자 페이지 |

## TODO

### 결제 시스템
- [x] 서버 측 결제 승인 API 구현 ✅
- [x] 백엔드/프론트엔드 분리 ✅
- [ ] Supabase payments 테이블 생성 및 연동
- [ ] 결제 내역 조회 페이지
- [ ] 환불 기능 구현
- [ ] 결제 실패 시 재시도 로직

### 기능 개선
- [ ] 사용자 인증 강화 (Supabase Auth)
- [ ] 프로필 이미지 업로드
- [ ] 실시간 알림
- [ ] 매칭 알고리즘 개선

### 성능 최적화
- [ ] 코드 스플리팅
- [ ] 이미지 최적화
- [ ] 캐싱 전략

### 배포
- [ ] 프론트엔드 배포 (Vercel/Netlify)
- [ ] 백엔드 배포 (Vercel/Heroku/AWS)
- [ ] 도메인 연결
- [ ] HTTPS 설정

## 라이선스

MIT

## 문의

프로젝트 관련 문의사항은 이슈를 등록해주세요.
