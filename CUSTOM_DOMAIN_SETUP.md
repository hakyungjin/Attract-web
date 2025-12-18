# 🌐 Firebase Hosting 커스텀 도메인 설정 가이드

## 📋 개요

Firebase Hosting에서 `attract.web.app` 형식의 URL을 사용하려면 커스텀 도메인을 설정해야 합니다.

---

## 🚀 방법 1: Firebase Hosting에서 커스텀 도메인 추가 (권장)

### 1단계: Firebase 콘솔에서 도메인 추가

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com/project/attract--web/hosting

2. **도메인 추가**
   - "도메인 추가" 또는 "Add custom domain" 클릭
   - 도메인 입력: `attract.web.app` (또는 원하는 도메인)
   - "계속" 클릭

3. **DNS 설정**
   - Firebase가 제공하는 DNS 레코드를 복사
   - 도메인 등록 업체(예: Google Domains, Namecheap 등)에서 DNS 설정

### 2단계: DNS 설정

도메인 등록 업체의 DNS 관리 페이지에서:

1. **A 레코드 추가** (또는 CNAME)
   - Firebase가 제공하는 IP 주소 또는 CNAME 값 입력
   - TTL: 3600 (또는 기본값)

2. **확인 대기**
   - DNS 전파 시간: 보통 1-24시간
   - Firebase 콘솔에서 "확인 중" 상태 확인

### 3단계: SSL 인증서 자동 설정

- Firebase가 자동으로 SSL 인증서를 발급하고 설정합니다
- 보통 몇 분에서 몇 시간 소요

---

## 🔧 방법 2: Firebase 프로젝트 ID 변경 (복잡함, 비권장)

프로젝트 ID를 변경하면 기존 설정이 모두 초기화되므로 권장하지 않습니다.

---

## 📝 현재 설정 확인

### `.firebaserc` 파일

현재 프로젝트 설정:
```json
{
  "projects": {
    "default": "attract--web"
  },
  "targets": {
    "attract--web": {
      "hosting": {
        "production": [
          "attract"
        ]
      }
    }
  }
}
```

`"attract"` 타겟이 이미 설정되어 있습니다. 이것은 커스텀 도메인 설정과 관련이 있을 수 있습니다.

---

## 🚀 배포 명령어

커스텀 도메인 설정 후에도 배포 명령어는 동일합니다:

```bash
# 빌드
npm run build

# 배포
firebase deploy --project attract--web

# 또는 타겟 지정
firebase deploy --only hosting:production --project attract--web
```

---

## ✅ 확인 사항

### 배포 후 URL 확인

배포가 완료되면 다음 URL들로 접근 가능합니다:

1. **기본 URL**: `https://attract--web.web.app` (항상 작동)
2. **커스텀 도메인**: `https://attract.web.app` (설정 후)

### Firebase 콘솔에서 확인

- Hosting > 도메인 섹션에서 설정된 도메인 확인
- SSL 인증서 상태 확인
- 트래픽 통계 확인

---

## ⚠️ 주의사항

1. **도메인 소유권 확인 필요**
   - Firebase가 도메인 소유권을 확인합니다
   - DNS 설정이 올바르지 않으면 확인 실패

2. **SSL 인증서 발급 시간**
   - 처음 설정 시 몇 시간 소요될 수 있습니다
   - 발급 완료 전까지는 HTTP로만 접근 가능할 수 있습니다

3. **기존 URL 유지**
   - `attract--web.web.app` URL은 계속 작동합니다
   - 커스텀 도메인은 추가 URL일 뿐입니다

---

## 🔗 참고 링크

- [Firebase Hosting 커스텀 도메인 가이드](https://firebase.google.com/docs/hosting/custom-domain)
- [Firebase 콘솔](https://console.firebase.google.com/project/attract--web/hosting)

---

## 📞 문제 해결

### 도메인 확인 실패

1. DNS 설정이 올바른지 확인
2. DNS 전파 시간 대기 (최대 24시간)
3. Firebase 콘솔에서 "다시 확인" 클릭

### SSL 인증서 발급 실패

1. DNS 설정이 올바른지 확인
2. 도메인 소유권 확인 완료 여부 확인
3. Firebase 지원팀에 문의





