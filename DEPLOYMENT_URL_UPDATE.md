# 🔄 배포 URL 업데이트 가이드

## 📋 현재 상황

- **Firebase 프로젝트 ID**: `attract--web` (변경 불가)
- **기본 배포 URL**: `https://attract--web.web.app` (자동 생성)
- **원하는 URL**: `https://attract.web.app` (커스텀 도메인 필요)

---

## ✅ 해결 방법

### 옵션 1: Firebase Hosting 커스텀 도메인 설정 (권장)

`attract.web.app` 형식의 URL을 사용하려면 Firebase Hosting에서 커스텀 도메인을 추가해야 합니다.

**자세한 방법**: `CUSTOM_DOMAIN_SETUP.md` 파일 참고

**요약**:
1. Firebase 콘솔 > Hosting > 도메인 추가
2. `attract.web.app` 입력
3. DNS 설정 (도메인 등록 업체에서)
4. SSL 인증서 자동 발급 대기

### 옵션 2: 현재 URL 사용 (간단함)

실제로는 `https://attract--web.web.app`으로 배포되지만, 문서에서는 `attract.web.app`으로 표기할 수 있습니다.

**장점**:
- 추가 설정 불필요
- 즉시 사용 가능

**단점**:
- 실제 URL과 문서의 URL이 다름
- 카카오 애드핏 등록 시 실제 URL 사용 필요

---

## 🚀 배포 명령어 (변경 없음)

배포 명령어는 그대로 사용합니다:

```bash
# 빌드
npm run build

# 배포
firebase deploy --project attract--web

# 또는 npm 스크립트 사용
npm run deploy
```

---

## 📝 문서 업데이트 완료

다음 문서들이 `attract.web.app` 형식으로 업데이트되었습니다:

- ✅ `DEPLOYMENT_CHECKLIST.md`
- ✅ `FIREBASE_DEPLOYMENT.md`
- ✅ `AD_SETUP_GUIDE.md`
- ✅ `AD_QUICK_SETUP.md`

---

## 🔍 실제 배포 URL 확인

배포 후 실제 접근 가능한 URL:

1. **기본 URL**: `https://attract--web.web.app` ✅ (항상 작동)
2. **커스텀 도메인**: `https://attract.web.app` (설정 후 사용 가능)

---

## 💡 권장 사항

1. **즉시 사용**: `attract--web.web.app` URL 사용
2. **장기적**: 커스텀 도메인 설정 (`CUSTOM_DOMAIN_SETUP.md` 참고)
3. **카카오 애드핏 등록**: 실제 접근 가능한 URL 사용

---

## ✅ 체크리스트

- [x] 문서 URL 업데이트 완료
- [ ] Firebase Hosting 커스텀 도메인 설정 (선택사항)
- [ ] 카카오 애드핏 사이트 등록 (실제 URL 사용)
- [ ] 배포 테스트 완료





