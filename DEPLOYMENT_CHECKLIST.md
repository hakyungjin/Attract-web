# 🚀 웹 서비스 오픈 체크리스트

## ✅ 필수 준비 사항 (오픈 전 반드시 완료)

### 1. 환경 변수 설정
**현재 상태**: `.env` 파일이 없음 (생성 필요)

**필요한 환경 변수**:
```env
# Supabase 설정
VITE_SUPABASE_URL=https://ytffobltrwkgxiedorsd.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase 설정
VITE_FIREBASE_API_KEY=AIzaSyAX33VJtYQx_Tw3Ak2qXTVB2jzlmyo76Eo
VITE_FIREBASE_AUTH_DOMAIN=attract--web.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=attract--web
VITE_FIREBASE_STORAGE_BUCKET=attract--web.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=557504244334
VITE_FIREBASE_APP_ID=1:557504244334:web:438c35dcea6a84f998147f
VITE_FIREBASE_MEASUREMENT_ID=G-QN3J2Q4HFH
```

**작업**:
- [ ] 프로젝트 루트에 `.env` 파일 생성
- [ ] 위의 환경 변수들을 실제 값으로 채우기
- [ ] `.gitignore`에 `.env`가 포함되어 있는지 확인

### 2. 데이터베이스 보안 설정
**현재 상태**: RLS가 비활성화되어 있을 수 있음

**작업**:
- [ ] Supabase 대시보드에서 RLS 정책 확인
- [ ] 프로덕션 환경에서는 RLS 활성화 권장 (보안 강화)
- [ ] 각 테이블별 접근 권한 정책 설정
- [ ] Storage 버킷 권한 설정 확인

### 3. 프로덕션 빌드 및 배포
**작업**:
```bash
# 1. 빌드
npm run build

# 2. 배포 (Firebase Hosting)
firebase deploy --project attract--web
```

**확인 사항**:
- [ ] 빌드가 성공적으로 완료되었는지 확인
- [ ] `out/` 폴더에 빌드된 파일들이 생성되었는지 확인
- [ ] 배포 후 실제 사이트가 정상 작동하는지 테스트

### 4. 도메인 설정 (선택사항)
**현재 URL**: https://attract.web.app

**작업**:
- [ ] 커스텀 도메인 연결 (예: www.attract.app)
- [ ] Firebase Hosting에서 도메인 추가
- [ ] SSL 인증서 자동 설정 확인

---

## 🔒 보안 강화 사항

### 1. API 키 보안
- [ ] Firebase API 키가 공개되어도 안전한지 확인 (Firebase는 기본적으로 공개 키 사용)
- [ ] Supabase Anon Key는 공개되어도 되지만, RLS로 보호 필요
- [ ] Service Role Key는 절대 클라이언트에 노출하지 않기

### 2. CORS 설정
- [ ] Supabase 대시보드에서 허용된 도메인 설정
- [ ] Firebase Hosting 도메인 추가

### 3. 인증 보안
- [ ] 비밀번호 최소 길이 검증 (현재 8자 이상)
- [ ] 비밀번호 복잡도 요구사항 검토
- [ ] 로그인 실패 횟수 제한 (Brute Force 방지)

### 4. 데이터 보호
- [ ] 개인정보 암호화 확인
- [ ] 프로필 이미지 업로드 시 파일 타입 검증
- [ ] 파일 크기 제한 설정

---

## 📱 사용자 경험 개선

### 1. 에러 처리
- [ ] 404 페이지 개선 (현재 기본 페이지 있음)
- [ ] 네트워크 에러 시 사용자 친화적 메시지
- [ ] 로딩 상태 표시 개선

### 2. 성능 최적화
- [ ] 이미지 최적화 (WebP 형식 사용)
- [ ] 코드 스플리팅 확인 (이미 설정됨)
- [ ] CDN 사용 (Firebase Hosting 자동 제공)
- [ ] 캐싱 전략 설정

### 3. SEO 최적화
**현재 상태**: 기본 메타 태그 있음

**개선 사항**:
- [ ] Open Graph 태그 추가 (소셜 미디어 공유용)
- [ ] Twitter Card 태그 추가
- [ ] 구조화된 데이터 (JSON-LD) 추가
- [ ] 사이트맵 생성 및 제출

### 4. 접근성
- [ ] 키보드 네비게이션 지원
- [ ] 스크린 리더 지원
- [ ] 색상 대비 비율 확인

---

## 📋 법적 요구사항

### 1. 개인정보처리방침
**현재 상태**: ✅ 구현됨 (`/policy/privacy`)

**확인 사항**:
- [ ] 실제 연락처 이메일로 변경 (현재: privacy@attract.app)
- [ ] 회사 정보 추가 (사업자등록번호, 주소 등)
- [ ] 개인정보 보호책임자 정보 업데이트

### 2. 이용약관
**현재 상태**: ✅ 구현됨 (`/policy/terms`)

**확인 사항**:
- [ ] 실제 회사 정보로 업데이트
- [ ] 환불 정책 상세화
- [ ] 분쟁 해결 절차 명시

### 3. 고객 지원
**현재 상태**: 설정 페이지에 "준비중" 알림

**작업**:
- [ ] 고객 지원 채널 구현 (이메일, 채팅 등)
- [ ] FAQ 페이지 완성
- [ ] 문의하기 기능 추가

---

## 🔍 모니터링 및 분석

### 1. 에러 추적
- [ ] Firebase Crashlytics 설정 (선택사항)
- [ ] Sentry 또는 유사 도구 설정 (선택사항)
- [ ] 콘솔 에러 모니터링

### 2. 사용자 분석
- [ ] Firebase Analytics 확인 (이미 설정됨)
- [ ] 주요 이벤트 추적 설정
- [ ] 사용자 행동 분석

### 3. 성능 모니터링
- [ ] Core Web Vitals 측정
- [ ] 페이지 로딩 속도 모니터링
- [ ] API 응답 시간 추적

---

## 💳 결제 시스템 (유료 서비스인 경우)

### 1. 결제 프로바이더
**현재 상태**: Toss Payments SDK 설치됨

**확인 사항**:
- [ ] Toss Payments 계정 설정 완료
- [ ] 테스트 결제 → 실제 결제 전환
- [ ] 결제 성공/실패 처리 로직 확인
- [ ] 환불 프로세스 구현

### 2. 결제 보안
- [ ] PCI DSS 준수 확인
- [ ] 결제 정보 암호화
- [ ] 결제 로그 보관

---

## 🧪 테스트 체크리스트

### 1. 기능 테스트
- [ ] 회원가입 플로우
- [ ] 로그인/로그아웃
- [ ] 프로필 수정
- [ ] 매칭 요청/수락
- [ ] 커뮤니티 게시글 작성
- [ ] 이미지 업로드
- [ ] 알림 수신

### 2. 브라우저 호환성
- [ ] Chrome (최신 버전)
- [ ] Safari (최신 버전)
- [ ] Firefox (최신 버전)
- [ ] Edge (최신 버전)
- [ ] 모바일 브라우저 (iOS Safari, Chrome Mobile)

### 3. 반응형 디자인
- [ ] 모바일 화면 (320px ~ 768px)
- [ ] 태블릿 화면 (768px ~ 1024px)
- [ ] 데스크톱 화면 (1024px 이상)

---

## 📞 고객 지원 준비

### 1. 지원 채널
- [ ] 이메일 지원 (privacy@attract.app 또는 별도 이메일)
- [ ] FAQ 페이지 완성
- [ ] 공지사항 시스템

### 2. 운영 가이드
- [ ] 관리자 대시보드 사용법 문서화
- [ ] 일반적인 문제 해결 가이드
- [ ] 비상 연락망

---

## 🚨 긴급 대응 계획

### 1. 장애 대응
- [ ] 서비스 다운 시 대응 절차
- [ ] 데이터 백업 계획
- [ ] 롤백 절차

### 2. 보안 사고 대응
- [ ] 데이터 유출 시 대응 절차
- [ ] 사용자 통지 계획
- [ ] 관련 기관 신고 절차

---

## 📊 오픈 후 모니터링

### 첫 주 체크리스트
- [ ] 일일 사용자 수 추적
- [ ] 에러 로그 확인
- [ ] 사용자 피드백 수집
- [ ] 성능 지표 모니터링
- [ ] 서버 비용 확인

---

## 🎯 우선순위별 작업

### 🔴 긴급 (오픈 전 필수)
1. `.env` 파일 생성 및 환경 변수 설정
2. 프로덕션 빌드 및 배포 테스트
3. 기본 기능 동작 확인
4. 법적 문서 (이용약관, 개인정보처리방침) 실제 정보로 업데이트

### 🟡 중요 (오픈 직후 1주일 내)
1. 보안 설정 강화 (RLS 정책)
2. 에러 모니터링 설정
3. 고객 지원 채널 구축
4. SEO 최적화

### 🟢 개선 (점진적 개선)
1. 성능 최적화
2. 사용자 경험 개선
3. 추가 기능 개발
4. 마케팅 및 홍보

---

## 📝 배포 명령어 요약

```bash
# 1. 환경 변수 확인
# .env 파일이 올바르게 설정되었는지 확인

# 2. 의존성 설치
npm install

# 3. 프로덕션 빌드
npm run build

# 4. 배포
firebase deploy --project attract--web

# 또는 한 번에 실행
npm run deploy
```

---

## 🔗 유용한 링크

- **Firebase 콘솔**: https://console.firebase.google.com/project/attract--web/overview
- **Supabase 대시보드**: https://supabase.com/dashboard/project/ytffobltrwkgxiedorsd
- **배포된 사이트**: https://attract.web.app
- **Firebase Hosting 문서**: https://firebase.google.com/docs/hosting
- **Supabase 문서**: https://supabase.com/docs

---

**마지막 업데이트**: 2025년 1월
**작성자**: AI Assistant
