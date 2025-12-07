/**
 * SMS 서비스 (쏘다 API 사용)
 *
 * ⚠️ 주의: 기존 알리고 API에서 쏘다 API로 마이그레이션됨
 *
 * 사용 전 준비사항:
 * 1. https://ssodaa.com 가입 및 로그인
 * 2. [API 토큰 관리]에서 token_key와 api_key 발급
 * 3. [발신번호 관리]에서 발신번호 등록 (인증 필수)
 * 4. .env 파일에 아래 값 추가:
 *    - VITE_SSODAA_API_KEY=발급받은_API_KEY
 *    - VITE_SSODAA_TOKEN_KEY=발급받은_TOKEN_KEY
 *    - VITE_SSODAA_SENDER=등록한_발신번호
 *
 * @deprecated - 이 파일은 하위 호환성을 위해 유지되지만, 새 코드는 ssodaaSmsService.ts를 사용하세요
 */

// 쏘다 SMS 서비스로 위임
import * as ssodaaSmsService from './ssodaaSmsService';

// 하위 호환성을 위해 기존 인터페이스 유지
interface SendSMSResponse {
  result_code: string;
  message: string;
  msg_id?: string;
  success_cnt?: number;
  error_cnt?: number;
}

/**
 * 6자리 인증번호 생성
 */
export const generateVerificationCode = ssodaaSmsService.generateVerificationCode;

/**
 * SMS 발송
 *
 * ⚠️ 주의: 프론트엔드에서 직접 호출하면 API Key가 노출됩니다!
 * 실제 운영에서는 Supabase Edge Function을 통해 호출하세요.
 */
export const sendSMS = async (
  phone: string,
  message: string
): Promise<SendSMSResponse> => {
  try {
    const result = await ssodaaSmsService.sendSMS(phone, message);

    // 기존 인터페이스에 맞게 변환
    return {
      result_code: result.code === '200' ? '1' : '0',
      message: result.content?.message || result.error || '발송 완료',
      msg_id: result.content?.sent_messages?.[0]?.msg_id,
      success_cnt: result.code === '200' ? 1 : 0,
      error_cnt: result.code === '200' ? 0 : 1,
    };
  } catch (error) {
    console.error('SMS 발송 실패:', error);
    throw error;
  }
};

/**
 * 인증번호 SMS 발송
 */
export const sendVerificationSMS = ssodaaSmsService.sendVerificationSMS;

/**
 * 인증번호 확인
 */
export const verifyCode = ssodaaSmsService.verifyCode;

/**
 * 개발/테스트용 - 콘솔에 인증번호 출력 (실제 SMS 미발송)
 */
export const sendVerificationSMSTest = ssodaaSmsService.sendVerificationSMSTest;

/**
 * 매칭 요청 알림 SMS 발송
 */
export const sendMatchRequestNotification = ssodaaSmsService.sendMatchRequestNotification;

/**
 * 매칭 수락 알림 SMS 발송
 */
export const sendMatchAcceptNotification = ssodaaSmsService.sendMatchAcceptNotification;

