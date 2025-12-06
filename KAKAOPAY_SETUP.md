# 카카오페이 결제 연동 가이드

## 📋 발급된 키 정보

| 항목 | 값 |
|------|-----|
| Client ID | `0E7F0DC08DEDDC54B791` |
| Client Secret | `8F64F23BCFEDE3AF49D6` |
| Secret Key (운영) | `PRD06E3CE056EE301DAE0D4E482CB3B4F5017DE3` |
| Secret Key (개발) | `DEV7A8E8A80A2F556D63362773C58F0EF60B81DD` |

---

## 🔧 1단계: 환경변수 설정

`.env` 파일에 추가:

```env
# 카카오페이 설정
VITE_KAKAO_PAY_CID=TC0ONETIME
VITE_KAKAO_PAY_SECRET_KEY=DEV7A8E8A80A2F556D63362773C58F0EF60B81DD
VITE_KAKAO_PAY_SECRET_KEY_PROD=PRD06E3CE056EE301DAE0D4E482CB3B4F5017DE3
```

> ⚠️ **주의**: `TC0ONETIME`은 테스트용 CID입니다. 운영 시에는 카카오에서 발급받은 CID를 사용하세요.

---

## 🚀 2단계: 사용 방법

### 결제 요청

```typescript
import { kakaoPayReady, redirectToKakaoPay } from './services/kakaoPayService';

const handlePayment = async () => {
  const coinPackage = {
    id: 'pkg_100',
    name: '100 코인',
    coins: 100,
    price: 10000,
    bonus: 10,
  };

  const result = await kakaoPayReady(userId, coinPackage);

  if (result.success && result.data) {
    // 카카오페이 결제 페이지로 이동
    redirectToKakaoPay(result.data);
  } else {
    alert(result.error);
  }
};
```

### 결제 승인 (콜백 페이지)

```typescript
// /payment/success 페이지에서
import { kakaoPayApprove } from './services/kakaoPayService';

useEffect(() => {
  const pgToken = new URLSearchParams(location.search).get('pg_token');
  
  if (pgToken) {
    kakaoPayApprove(pgToken).then((result) => {
      if (result.success) {
        alert('결제가 완료되었습니다!');
        navigate('/');
      } else {
        alert(result.error);
      }
    });
  }
}, []);
```

---

## 📊 결제 흐름

```
1. 사용자가 코인 패키지 선택
   ↓
2. kakaoPayReady() 호출 → 카카오페이 API에 결제 준비 요청
   ↓
3. 결제 정보 DB 저장 (pending)
   ↓
4. redirectToKakaoPay() → 카카오페이 결제 페이지로 이동
   ↓
5. 사용자가 카카오페이에서 결제 진행
   ↓
6. 성공 시 /payment/success?pg_token=xxx 로 리다이렉트
   ↓
7. kakaoPayApprove(pgToken) 호출 → 결제 승인
   ↓
8. DB 업데이트 (completed) + 코인 충전
```

---

## 🧪 테스트 방법

1. 테스트 CID (`TC0ONETIME`) 사용
2. 카카오 계정으로 로그인
3. 실제 결제는 진행되지 않음 (테스트 모드)

---

## ⚠️ 주의사항

1. **CORS 문제**: 프론트엔드에서 직접 API 호출 시 CORS 오류 발생 가능
   - 해결: Supabase Edge Function을 통해 호출 권장

2. **Secret Key 노출 금지**: 프론트엔드 코드에 Key 직접 노출 X
   - 환경변수 사용 필수

3. **운영 전환 시**:
   - CID를 실제 발급받은 값으로 변경
   - Secret Key를 운영용(PRD)으로 변경

---

## 🔗 참고 링크

- [카카오페이 개발자 문서](https://developers.kakaopay.com/docs/payment/online/single-payment)
- [카카오페이 개발자센터](https://developers.kakaopay.com)

