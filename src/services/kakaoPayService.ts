/**
 * @deprecated 카카오페이 결제 서비스는 더 이상 사용되지 않습니다.
 *
 * TODO: 토스 페이먼츠(Toss Payments)로 교체 필요
 * 참고: https://docs.tosspayments.com/
 *
 * 토스 페이먼츠 통합 가이드:
 * 1. 토스 페이먼츠 회원가입 및 API 키 발급
 * 2. @tosspayments/payment-sdk 설치
 * 3. 결제 위젯 통합
 * 4. Firebase Functions에서 결제 승인 처리
 * 5. Firestore에 결제 내역 저장
 */

console.warn('kakaoPayService는 deprecated되었습니다. 토스 페이먼츠로 마이그레이션하세요.');

/**
 * 카카오페이 결제 준비 (Stub - 실제 구현 필요)
 * @deprecated 토스 페이먼츠로 교체 필요
 */
export const kakaoPayReady = async (_userId: string, _options: any): Promise<any> => {
  console.warn('kakaoPayReady는 deprecated되었습니다. 토스 페이먼츠를 사용하세요.');
  throw new Error('카카오페이는 더 이상 지원되지 않습니다. 토스 페이먼츠를 사용해주세요.');
};

/**
 * 카카오페이 결제 페이지로 리다이렉트 (Stub - 실제 구현 필요)
 * @deprecated 토스 페이먼츠로 교체 필요
 */
export const redirectToKakaoPay = (_data: any): void => {
  console.warn('redirectToKakaoPay는 deprecated되었습니다. 토스 페이먼츠를 사용하세요.');
  throw new Error('카카오페이는 더 이상 지원되지 않습니다. 토스 페이먼츠를 사용해주세요.');
};
