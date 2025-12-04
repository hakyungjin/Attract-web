# 🚀 카카오 애드핏 빠른 설정 가이드

## ✅ 광고 단위 ID 확인

발급받은 광고 단위 ID: `DAN-xzcTogwnUXAFXJ7t`

---

## 📝 환경 변수 설정

### 1. `.env` 파일 생성 또는 수정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 카카오 애드핏 광고 단위 ID
VITE_KAKAO_AD_UNIT_1=DAN-xzcTogwnUXAFXJ7t
```

또는 기존 `.env` 파일이 있다면 위의 줄만 추가하세요.

---

## 🔄 개발 서버 재시작

환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

---

## ✅ 확인 사항

### 1. 코드 확인

현재 코드는 이미 환경 변수를 사용하도록 설정되어 있습니다:

```tsx
// src/pages/home/components/ProfileTab.tsx
const KAKAO_AD_UNIT_1 = import.meta.env.VITE_KAKAO_AD_UNIT_1 || '';

// 사용
{KAKAO_AD_UNIT_1 ? (
  <KakaoAdFit unit={KAKAO_AD_UNIT_1} width={320} height={100} />
) : (
  <DummyAdBanner width={320} height={100} text="광고 영역 1" />
)}
```

### 2. 브라우저에서 확인

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 홈 화면 접속
3. 광고가 표시되는지 확인
   - 환경 변수가 설정되어 있으면 → 실제 카카오 애드핏 광고 표시
   - 환경 변수가 없으면 → 더미 배너 표시

---

## 🚨 문제 해결

### 광고가 표시되지 않는 경우

1. **환경 변수 확인**
   - `.env` 파일에 `VITE_KAKAO_AD_UNIT_1=DAN-xzcTogwnUXAFXJ7t`가 있는지 확인
   - 오타가 없는지 확인

2. **개발 서버 재시작**
   - 환경 변수 변경 후 반드시 서버 재시작 필요

3. **브라우저 콘솔 확인**
   - F12 → Console 탭에서 에러 확인
   - 카카오 애드핏 스크립트 로드 에러가 있는지 확인

4. **사이트 승인 상태 확인**
   - 카카오 애드핏 대시보드에서 사이트 승인 상태 확인
   - 승인 전에는 광고가 표시되지 않을 수 있음

---

## 📦 프로덕션 배포

### Firebase Hosting 배포 시

환경 변수는 빌드 시점에 포함되므로:

1. `.env` 파일에 광고 단위 ID 설정
2. 빌드: `npm run build`
3. 배포: `firebase deploy --project attract--web` (프로젝트 ID는 그대로, URL만 변경)

빌드된 파일에 광고 단위 ID가 포함됩니다.

---

## 🔗 추가 광고 단위 추가하기

두 번째 광고 배너를 추가하려면:

1. 카카오 애드핏에서 두 번째 광고 단위 생성
2. `.env` 파일에 추가:
   ```env
   VITE_KAKAO_AD_UNIT_2=DAN-YYYYYYYYYY
   ```
3. 코드는 이미 두 번째 광고를 지원하도록 설정되어 있음

---

## ✅ 체크리스트

- [x] 광고 단위 ID 발급 완료: `DAN-xzcTogwnUXAFXJ7t`
- [ ] `.env` 파일에 광고 단위 ID 추가
- [ ] 개발 서버 재시작
- [ ] 브라우저에서 광고 표시 확인
- [ ] 프로덕션 배포 (필요시)

