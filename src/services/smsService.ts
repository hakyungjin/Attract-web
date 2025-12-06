/**
 * 알리고 SMS 서비스
 * 
 * 사용 전 준비사항:
 * 1. https://smartsms.aligo.in 가입
 * 2. API Key 발급 (마이페이지 → API 연동 설정)
 * 3. 발신번호 등록 (인증 필수)
 * 4. .env 파일에 아래 값 추가:
 *    - VITE_ALIGO_API_KEY=발급받은_API_KEY
 *    - VITE_ALIGO_USER_ID=알리고_아이디
 *    - VITE_ALIGO_SENDER=등록한_발신번호
 */

interface SendSMSResponse {
  result_code: string;
  message: string;
  msg_id?: string;
  success_cnt?: number;
  error_cnt?: number;
}

interface VerificationCode {
  code: string;
  expiresAt: number;
  phone: string;
}

// 인증번호 임시 저장 (실제 운영에서는 Redis나 DB 사용 권장)
const verificationCodes: Map<string, VerificationCode> = new Map();

/**
 * 6자리 인증번호 생성
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * SMS 발송 (알리고 API)
 * 
 * ⚠️ 주의: 프론트엔드에서 직접 호출하면 API Key가 노출됩니다!
 * 실제 운영에서는 Supabase Edge Function을 통해 호출하세요.
 */
export const sendSMS = async (
  phone: string,
  message: string
): Promise<SendSMSResponse> => {
  const API_KEY = import.meta.env.VITE_ALIGO_API_KEY;
  const USER_ID = import.meta.env.VITE_ALIGO_USER_ID;
  const SENDER = import.meta.env.VITE_ALIGO_SENDER;

  if (!API_KEY || !USER_ID || !SENDER) {
    console.error('알리고 API 설정이 누락되었습니다. .env 파일을 확인하세요.');
    throw new Error('SMS 설정이 완료되지 않았습니다.');
  }

  // 전화번호 포맷 정리 (하이픈 제거)
  const cleanPhone = phone.replace(/-/g, '');

  const formData = new FormData();
  formData.append('key', API_KEY);
  formData.append('user_id', USER_ID);
  formData.append('sender', SENDER);
  formData.append('receiver', cleanPhone);
  formData.append('msg', message);

  try {
    const response = await fetch('https://apis.aligo.in/send/', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.result_code !== '1') {
      console.error('SMS 발송 실패:', result);
      throw new Error(result.message || 'SMS 발송에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('SMS API 호출 오류:', error);
    throw error;
  }
};

/**
 * 인증번호 SMS 발송
 */
export const sendVerificationSMS = async (phone: string): Promise<boolean> => {
  const code = generateVerificationCode();
  const message = `[Attract] 인증번호는 [${code}]입니다. 3분 내에 입력해주세요.`;

  try {
    await sendSMS(phone, message);

    // 인증번호 저장 (3분 유효)
    verificationCodes.set(phone.replace(/-/g, ''), {
      code,
      expiresAt: Date.now() + 3 * 60 * 1000, // 3분
      phone: phone.replace(/-/g, ''),
    });

    return true;
  } catch (error) {
    console.error('인증번호 발송 실패:', error);
    return false;
  }
};

/**
 * 인증번호 확인
 */
export const verifyCode = (phone: string, inputCode: string): boolean => {
  const cleanPhone = phone.replace(/-/g, '');
  const stored = verificationCodes.get(cleanPhone);

  if (!stored) {
    return false;
  }

  // 만료 확인
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(cleanPhone);
    return false;
  }

  // 코드 일치 확인
  if (stored.code === inputCode) {
    verificationCodes.delete(cleanPhone); // 사용 후 삭제
    return true;
  }

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
  verificationCodes.set(phone.replace(/-/g, ''), {
    code,
    expiresAt: Date.now() + 3 * 60 * 1000,
    phone: phone.replace(/-/g, ''),
  });

  return code;
};

