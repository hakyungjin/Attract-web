# 🔍 환경 변수 문제 해결 가이드

환경 변수가 배포되어 있는데도 값이 로드되지 않는 경우

---

## 🔍 가능한 원인들

### 1. 환경 변수 이름 불일치
- 대소문자 차이: `SSODAA_API_KEY` vs `ssodaa_api_key`
- 언더스코어 차이: `SSODAA_API_KEY` vs `SSODAA_APIKEY`
- 공백이나 특수문자 포함

### 2. 환경 변수 값이 빈 문자열
- 환경 변수는 설정되어 있지만 값이 비어있음
- 공백 문자만 포함

### 3. 함수 재배포 필요
- 환경 변수를 추가한 후 함수를 재배포하지 않음
- 환경 변수 변경 후 반드시 재배포 필요

### 4. 함수별 환경 변수 설정
- 각 함수마다 개별적으로 환경 변수를 설정해야 함
- 전역 설정이 아닐 수 있음

---

## ✅ 해결 단계

### 1단계: 강화된 디버깅 로그 확인

코드에 강화된 디버깅 로그를 추가했습니다. 재배포 후 로그를 확인하세요:

```powershell
cd functions
npm run build
firebase deploy --only functions --project attract--web
```

### 2단계: 로그 확인

```powershell
firebase functions:log --only sendVerificationSMS
```

로그에서 다음을 확인:
- `relevantEnvKeys`: 관련된 모든 환경 변수 이름
- `sampleEnvKeys`: 전체 환경 변수 샘플
- `hasApiKey`, `hasTokenKey`, `hasSender`: 각 변수 존재 여부

### 3단계: 환경 변수 이름 확인

로그의 `relevantEnvKeys`를 확인하여:
- 실제 환경 변수 이름이 무엇인지 확인
- 코드에서 사용하는 이름과 일치하는지 확인

### 4단계: Google Cloud Console에서 재확인

1. https://console.cloud.google.com/functions/list?project=attract--web
2. `sendVerificationSMS` 함수 클릭
3. **편집** → **환경 변수, 시크릿 및 네트워크**
4. 환경 변수 이름과 값을 정확히 확인:
   - 정확한 이름: `SSODAA_API_KEY` (대문자, 언더스코어)
   - 값이 비어있지 않은지 확인
   - 공백이나 특수문자가 없는지 확인

### 5단계: 환경 변수 재설정

문제가 있다면:
1. 기존 환경 변수 삭제
2. 새로 추가 (이름과 값 정확히 입력)
3. 함수 재배포

---

## 🧪 테스트 방법

### 로컬에서 테스트

```powershell
cd functions
npm run serve
```

로컬에서는 `.env` 파일이 로드되므로 정상 작동해야 합니다.

### 배포 환경에서 테스트

```powershell
firebase functions:log --only sendVerificationSMS --limit 50
```

최근 50개 로그를 확인하여 디버깅 정보를 확인하세요.

---

## 📝 체크리스트

- [ ] Google Cloud Console에서 환경 변수 이름 확인
- [ ] 환경 변수 값이 비어있지 않은지 확인
- [ ] 환경 변수 추가 후 함수 재배포
- [ ] 로그에서 `relevantEnvKeys` 확인
- [ ] 코드의 변수 이름과 실제 환경 변수 이름 일치 확인

---

## 💡 다음 단계

재배포 후 로그를 확인하고, `relevantEnvKeys`에 어떤 변수들이 있는지 알려주시면 정확한 해결 방법을 제시하겠습니다!

