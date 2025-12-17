/**
 * 쏘다(Ssodaa) SMS API 서비스
 *
 * 📚 API 문서: https://ssodaa.com/service/api/smsapi
 *
 * 사용 전 준비사항:
 * 1. https://ssodaa.com 가입 및 로그인
 * 2. [API 토큰 관리]에서 API_KEY와 TOKEN_KEY 발급
 * 3. [발신번호 관리]에서 발신번호 등록 및 인증
 * 4. .env 파일에 아래 환경 변수 추가:
 *    - VITE_SSODAA_API_KEY=발급받은_API_KEY
 *    - VITE_SSODAA_TOKEN_KEY=발급받은_TOKEN_KEY
 *    - VITE_SSODAA_SENDER=등록한_발신번호 (예: 01012345678)
 */

interface SsodaaSendSMSRequest {
  token_key: string;
  msg_type: 'sms' | 'mms';
  dest_phone: string;
  send_phone: string;
  subject?: string;
  msg_body: string;
  send_time?: string;
  msg_ad?: 'Y' | 'N';
  unsub_phone?: string;
  attached_file?: string;
}

interface SsodaaSendSMSResponse {
  code: string;
  error?: string;
  content?: {
    message: string;
    sent_messages: Array<{
      msg_id: string;
      dest_phone: string;
      reserv: 'Y' | 'N';
      sent_time?: string;
      send_phone: string;
    }>;
    reserv: 'Y' | 'N';
    sent_time?: string;
    send_phone: string;
  };
}

interface SsodaaSendPhoneResponse {
  code: string;
  error?: string;
  content?: {
    message: string;
    sendphones: Array<{
      number: string;
      auth_type: string;
      request_date: string;
      confirm_date: string;
      blocked_date?: string;
    }>;
  };
}

interface VerificationCode {
  code: string;
  expiresAt: number;
  phone: string;
}

// API 기본 URL
const API_BASE_URL = 'https://apis.ssodaa.com';

// 인증번호 임시 저장 (실제 운영에서는 Redis나 DB 사용 권장)
const verificationCodes: Map<string, VerificationCode> = new Map();

/**
 * 환경 변수 확인
 */
const getApiConfig = () => {
  const API_KEY = import.meta.env.VITE_SSODAA_API_KEY;
  const TOKEN_KEY = import.meta.env.VITE_SSODAA_TOKEN_KEY;
  const SENDER = import.meta.env.VITE_SSODAA_SENDER;

  if (!API_KEY || !TOKEN_KEY || !SENDER) {
    console.error('쏘다 SMS API 설정이 누락되었습니다. .env 파일을 확인하세요.');
    throw new Error('SMS 설정이 완료되지 않았습니다.');
  }

  return { API_KEY, TOKEN_KEY, SENDER };
};

/**
 * 등록된 발신번호 조회
 */
export const getSendPhones = async (): Promise<SsodaaSendPhoneResponse> => {
  try {
    const { API_KEY, TOKEN_KEY } = getApiConfig();

    const response = await fetch(`${API_BASE_URL}/sms/sendphone/list`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        token_key: TOKEN_KEY,
      }),
    });

    const result: SsodaaSendPhoneResponse = await response.json();

    if (result.code !== '200') {
      console.error('발신번호 조회 실패:', result);
      throw new Error(result.error || '발신번호 조회에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('발신번호 조회 API 호출 오류:', error);
    throw error;
  }
};

/**
 * SMS 발송 (쏘다 API)
 *
 * @param phone - 수신 전화번호
 * @param message - 메시지 내용
 * @param options - 추가 옵션
 * @returns 발송 결과
 *
 * @example
 * // 기본 SMS 발송
 * await sendSMS('01012345678', '안녕하세요');
 *
 * // 예약 발송
 * await sendSMS('01012345678', '안녕하세요', {
 *   sendTime: '2025-12-07 14:00:00'
 * });
 *
 * // 광고 문자 발송
 * await sendSMS('01012345678', '특별 할인 안내', {
 *   isAd: true
 * });
 */
export const sendSMS = async (
  phone: string,
  message: string,
  options?: {
    msgType?: 'sms' | 'mms';
    subject?: string;
    sendTime?: string;
    isAd?: boolean;
    unsubPhone?: string;
    attachedFile?: string;
  }
): Promise<SsodaaSendSMSResponse> => {
  try {
    const { API_KEY, TOKEN_KEY, SENDER } = getApiConfig();

    // 전화번호 포맷 정리 (하이픈 제거)
    const cleanPhone = phone.replace(/-/g, '').replace(/^\+82/, '0');

    const requestBody: SsodaaSendSMSRequest = {
      token_key: TOKEN_KEY,
      msg_type: options?.msgType || 'sms',
      dest_phone: cleanPhone,
      send_phone: SENDER,
      msg_body: message,
    };

    // 옵션 추가
    if (options?.subject) requestBody.subject = options.subject;
    if (options?.sendTime) requestBody.send_time = options.sendTime;
    if (options?.isAd !== undefined) requestBody.msg_ad = options.isAd ? 'Y' : 'N';
    if (options?.unsubPhone) requestBody.unsub_phone = options.unsubPhone;
    if (options?.attachedFile) requestBody.attached_file = options.attachedFile;

    const response = await fetch(`${API_BASE_URL}/sms/send/sms`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(requestBody),
    });

    const result: SsodaaSendSMSResponse = await response.json();

    if (result.code !== '200') {
      console.error('SMS 발송 실패:', result);
      throw new Error(result.error || 'SMS 발송에 실패했습니다.');
    }

    console.log('SMS 발송 성공:', result);
    return result;
  } catch (error) {
    console.error('SMS API 호출 오류:', error);
    throw error;
  }
};

/**
 * 여러 번호로 동시 SMS 발송
 *
 * @param phones - 수신 전화번호 배열
 * @param message - 메시지 내용
 * @param options - 추가 옵션
 *
 * @example
 * await sendBulkSMS(['01012345678', '01087654321'], '안녕하세요');
 */
export const sendBulkSMS = async (
  phones: string[],
  message: string,
  options?: Parameters<typeof sendSMS>[2]
): Promise<SsodaaSendSMSResponse> => {
  try {
    const { API_KEY, TOKEN_KEY, SENDER } = getApiConfig();

    // 전화번호들을 파이프(|)로 구분
    const cleanPhones = phones
      .map(p => p.replace(/-/g, '').replace(/^\+82/, '0'))
      .join('|');

    const requestBody: SsodaaSendSMSRequest = {
      token_key: TOKEN_KEY,
      msg_type: options?.msgType || 'sms',
      dest_phone: cleanPhones,
      send_phone: SENDER,
      msg_body: message,
    };

    // 옵션 추가
    if (options?.subject) requestBody.subject = options.subject;
    if (options?.sendTime) requestBody.send_time = options.sendTime;
    if (options?.isAd !== undefined) requestBody.msg_ad = options.isAd ? 'Y' : 'N';
    if (options?.unsubPhone) requestBody.unsub_phone = options.unsubPhone;
    if (options?.attachedFile) requestBody.attached_file = options.attachedFile;

    const response = await fetch(`${API_BASE_URL}/sms/send/sms`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(requestBody),
    });

    const result: SsodaaSendSMSResponse = await response.json();

    if (result.code !== '200') {
      console.error('대량 SMS 발송 실패:', result);
      throw new Error(result.error || 'SMS 발송에 실패했습니다.');
    }

    console.log('대량 SMS 발송 성공:', result);
    return result;
  } catch (error) {
    console.error('대량 SMS API 호출 오류:', error);
    throw error;
  }
};

/**
 * 6자리 인증번호 생성
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 인증번호 SMS 발송
 *
 * @param phone - 수신 전화번호
 * @returns 발송 성공 여부
 *
 * @example
 * const success = await sendVerificationSMS('01012345678');
 * if (success) {
 *   console.log('인증번호가 발송되었습니다.');
 * }
 */
export const sendVerificationSMS = async (phone: string): Promise<boolean> => {
  const code = generateVerificationCode();
  const message = `[Attract] 인증번호는 [${code}]입니다. 3분 내에 입력해주세요.`;

  try {
    await sendSMS(phone, message);

    // 인증번호 저장 (3분 유효)
    const cleanPhone = phone.replace(/-/g, '').replace(/^\+82/, '0');
    verificationCodes.set(cleanPhone, {
      code,
      expiresAt: Date.now() + 3 * 60 * 1000, // 3분
      phone: cleanPhone,
    });

    console.log('인증번호 발송 완료:', cleanPhone);
    return true;
  } catch (error) {
    console.error('인증번호 발송 실패:', error);
    return false;
  }
};

/**
 * 인증번호 확인
 *
 * @param phone - 전화번호
 * @param inputCode - 사용자가 입력한 인증번호
 * @returns 인증 성공 여부
 *
 * @example
 * const isValid = verifyCode('01012345678', '123456');
 * if (isValid) {
 *   console.log('인증 성공');
 * }
 */
export const verifyCode = (phone: string, inputCode: string): boolean => {
  const cleanPhone = phone.replace(/-/g, '').replace(/^\+82/, '0');
  const stored = verificationCodes.get(cleanPhone);

  if (!stored) {
    console.log('저장된 인증번호가 없습니다:', cleanPhone);
    return false;
  }

  // 만료 확인
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(cleanPhone);
    console.log('인증번호가 만료되었습니다:', cleanPhone);
    return false;
  }

  // 코드 일치 확인
  if (stored.code === inputCode) {
    verificationCodes.delete(cleanPhone); // 사용 후 삭제
    console.log('인증 성공:', cleanPhone);
    return true;
  }

  console.log('인증번호가 일치하지 않습니다:', cleanPhone);
  return false;
};

/**
 * 개발/테스트용 - 콘솔에 인증번호 출력 (실제 SMS 미발송)
 */
export const sendVerificationSMSTest = async (phone: string): Promise<string> => {
  const code = generateVerificationCode();

  console.log('========================================');
  console.log(`📱 [테스트 모드] 인증번호: ${code}`);
  console.log(`📞 전화번호: ${phone}`);
  console.log('========================================');

  // 인증번호 저장 (3분 유효)
  const cleanPhone = phone.replace(/-/g, '').replace(/^\+82/, '0');
  verificationCodes.set(cleanPhone, {
    code,
    expiresAt: Date.now() + 3 * 60 * 1000,
    phone: cleanPhone,
  });

  return code;
};

/**
 * 매칭 요청 알림 SMS 발송
 *
 * @param recipientPhone - 수신자 전화번호
 * @param senderName - 발신자 이름
 * @returns 발송 성공 여부
 *
 * @example
 * await sendMatchRequestNotification('01012345678', '홍길동');
 */
export const sendMatchRequestNotification = async (
  recipientPhone: string,
  senderName: string
): Promise<boolean> => {
  const message = `[Attract] ${senderName}님이 매칭을 요청했습니다. 앱에서 확인해주세요!`;

  try {
    await sendSMS(recipientPhone, message);
    console.log('매칭 요청 알림 발송 완료:', recipientPhone);
    return true;
  } catch (error) {
    console.error('매칭 요청 알림 발송 실패:', error);
    return false;
  }
};

/**
 * 매칭 수락 알림 SMS 발송
 *
 * @param recipientPhone - 수신자 전화번호
 * @param accepterName - 수락자 이름
 * @returns 발송 성공 여부
 *
 * @example
 * await sendMatchAcceptNotification('01012345678', '김철수');
 */
export const sendMatchAcceptNotification = async (
  recipientPhone: string,
  accepterName: string
): Promise<boolean> => {
  const message = `[Attract] ${accepterName}님이 매칭을 수락했습니다! 이제 채팅을 시작할 수 있어요 💬`;

  try {
    await sendSMS(recipientPhone, message);
    console.log('매칭 수락 알림 발송 완료:', recipientPhone);
    return true;
  } catch (error) {
    console.error('매칭 수락 알림 발송 실패:', error);
    return false;
  }
};
