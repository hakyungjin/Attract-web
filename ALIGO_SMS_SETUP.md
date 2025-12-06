# 알리고 SMS 연동 가이드

## 📋 1단계: 알리고 가입 및 설정

### 1.1 회원가입
1. https://smartsms.aligo.in 접속
2. 회원가입 (사업자/개인 가능)
3. 충전: 최소 1,000원부터 (건당 약 8~9원)

### 1.2 API Key 발급
1. 로그인 후 **마이페이지** → **API 연동 설정**
2. API Key 확인 및 복사

### 1.3 발신번호 등록 (필수!)
1. **마이페이지** → **발신번호 관리**
2. 발신번호 등록 → **통신사 인증** 또는 **서류 인증**
3. ⚠️ 인증되지 않은 번호로는 발송 불가!

---

## 🔧 2단계: 환경변수 설정

### 로컬 개발 (.env 파일)
```env
# 알리고 SMS 설정
VITE_ALIGO_API_KEY=발급받은_API_KEY
VITE_ALIGO_USER_ID=알리고_로그인_아이디
VITE_ALIGO_SENDER=등록한_발신번호(하이픈없이)
```

### Supabase Edge Function (권장 - API Key 보호)
```bash
# Supabase 시크릿 설정
supabase secrets set ALIGO_API_KEY=발급받은_API_KEY
supabase secrets set ALIGO_USER_ID=알리고_로그인_아이디
supabase secrets set ALIGO_SENDER=등록한_발신번호
```

---

## 🚀 3단계: Edge Function 배포 (권장)

```bash
# Supabase CLI로 배포
supabase functions deploy send-sms
```

---

## 💻 4단계: 프론트엔드에서 사용

### 방법 1: Edge Function 사용 (권장 - 보안)
```typescript
import { supabase } from './lib/supabase';

// 인증번호 발송
const sendCode = async (phone: string) => {
  const { data, error } = await supabase.functions.invoke('send-sms', {
    body: { phone, action: 'send' }
  });
  
  if (error) throw error;
  return data;
};

// 인증번호 확인
const verifyCode = async (phone: string, code: string) => {
  const { data, error } = await supabase.functions.invoke('send-sms', {
    body: { phone, code, action: 'verify' }
  });
  
  if (error) throw error;
  return data.success;
};
```

### 방법 2: 테스트용 (콘솔 출력)
```typescript
import { sendVerificationSMSTest, verifyCode } from './services/smsService';

// 테스트 모드 - 콘솔에 인증번호 출력
const code = await sendVerificationSMSTest('010-1234-5678');
// 콘솔: 📱 [테스트 모드] 인증번호: 123456

// 인증번호 확인
const isValid = verifyCode('010-1234-5678', '123456');
```

---

## 📊 알리고 API 응답 코드

| 코드 | 설명 |
|------|------|
| 1 | 성공 |
| -100 | 인증실패 (API Key 또는 User ID 오류) |
| -101 | 잔액부족 |
| -102 | 발신번호 미등록 |
| -103 | 수신번호 오류 |
| -201 | 메시지 길이 초과 (90자) |

---

## 💰 요금 안내

- **단문 SMS**: 건당 약 8.4원 (90자 이하)
- **장문 LMS**: 건당 약 25원 (2,000자 이하)
- **MMS**: 건당 약 100원 (이미지 포함)

---

## ⚠️ 주의사항

1. **API Key 노출 금지**: 프론트엔드에서 직접 호출 시 Key 노출됨
   - → Supabase Edge Function 사용 권장

2. **발신번호 인증 필수**: 미인증 번호는 발송 불가

3. **스팸 방지**: 
   - 동일 번호 재발송 제한 (1분 간격)
   - 하루 발송량 제한 고려

4. **테스트 시**: `sendVerificationSMSTest()` 사용하여 실제 SMS 비용 절약

---

## 🔗 참고 링크

- 알리고 API 문서: https://smartsms.aligo.in/admin/api/spec.html
- 알리고 고객센터: 1544-2225

