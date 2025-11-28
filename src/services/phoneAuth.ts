import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { supabase } from '../lib/supabase';

// reCAPTCHA verifier 인스턴스
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * reCAPTCHA 초기화
 * @param containerId - reCAPTCHA가 렌더링될 DOM 요소 ID
 */
export const initRecaptcha = (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });

  return recaptchaVerifier;
};

/**
 * SMS 인증번호 전송
 * @param phoneNumber - 전화번호 (예: +821012345678)
 * @returns ConfirmationResult (인증번호 확인에 사용)
 */
export const sendVerificationCode = async (phoneNumber: string): Promise<ConfirmationResult> => {
  try {
    // +82 형식으로 변환
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // reCAPTCHA 초기화
    const appVerifier = initRecaptcha();

    // SMS 전송
    const confirmationResult = await signInWithPhoneNumber(
      firebaseAuth,
      formattedPhone,
      appVerifier
    );

    console.log('SMS 전송 성공:', formattedPhone);
    return confirmationResult;
  } catch (error: any) {
    console.error('SMS 전송 실패:', error);
    throw new Error(getSMSErrorMessage(error.code));
  }
};

/**
 * 인증번호 확인 및 로그인/회원가입 분리
 * @param confirmationResult - SMS 전송 시 받은 결과
 * @param verificationCode - 사용자가 입력한 인증번호
 * @returns isNewUser: 신규 사용자 여부
 */
export const verifyCode = async (
  confirmationResult: ConfirmationResult,
  verificationCode: string
) => {
  try {
    // Firebase로 인증
    const result = await confirmationResult.confirm(verificationCode);
    const user = result.user;

    console.log('Firebase 인증 성공:', user.uid);

    // Supabase에서 기존 사용자 확인
    const { isNewUser, userData } = await checkUserExists(user.uid);

    return {
      user,
      error: null,
      isNewUser, // 신규 사용자 여부
      userData // 기존 사용자 데이터
    };
  } catch (error: any) {
    console.error('인증번호 확인 실패:', error);
    return {
      user: null,
      error: new Error(getVerificationErrorMessage(error.code)),
      isNewUser: false,
      userData: null
    };
  }
};

/**
 * Supabase에서 사용자 존재 여부 확인
 */
const checkUserExists = async (firebaseUid: string) => {
  try {
    console.log('🔍 Supabase 쿼리 시작:', {
      firebaseUid,
      supabaseClient: supabase ? '✅ 존재' : '❌ 없음'
    });

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    console.log('🔍 Supabase 쿼리 결과:', {
      hasData: !!existingUser,
      error: checkError ? checkError.message : null,
      errorCode: checkError ? checkError.code : null
    });

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // 사용자가 없으면 신규
    if (!existingUser) {
      console.log('신규 사용자');
      return { isNewUser: true, userData: null };
    } else {
      console.log('기존 사용자 확인됨');
      return { isNewUser: false, userData: existingUser };
    }
  } catch (error) {
    console.error('사용자 확인 실패:', error);
    return { isNewUser: true, userData: null };
  }
};

/**
 * 신규 사용자 생성 (회원가입 완료 후 호출)
 * @param firebaseUid - Firebase UID
 * @param phoneNumber - 전화번호
 * @param userData - 추가 사용자 정보
 */
export const createUserProfile = async (
  firebaseUid: string,
  phoneNumber: string,
  userData: {
    name: string;
    age?: number;
    gender?: string;
    location?: string;
    bio?: string;
  }
) => {
  try {
    // 전화번호를 숫자만 남기고 저장 (010XXXXXXXX 형식)
    const cleanedPhone = phoneNumber.replace(/[^\d]/g, '').replace(/^\+82/, '0');

    console.log('회원가입 전화번호 저장:', cleanedPhone);

    const { data, error } = await supabase
      .from('users')
      .insert({
        firebase_uid: firebaseUid,
        phone_number: cleanedPhone,
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        location: userData.location,
        bio: userData.bio,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('사용자 생성 실패:', error);
      throw error;
    }

    console.log('Supabase에 새 사용자 생성됨:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('createUserProfile 실패:', error);
    return { data: null, error };
  }
};

/**
 * 전화번호 포맷팅 (한국 번호 기준)
 * @param phoneNumber - 입력된 전화번호
 * @returns +82 형식의 전화번호
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // 공백, 하이픈 제거
  let cleaned = phoneNumber.replace(/[\s-]/g, '');

  // 0으로 시작하면 +82로 변경
  if (cleaned.startsWith('0')) {
    cleaned = '+82' + cleaned.substring(1);
  }

  // +82 없으면 추가
  if (!cleaned.startsWith('+82')) {
    cleaned = '+82' + cleaned;
  }

  return cleaned;
};

/**
 * 전화번호 유효성 검사
 */
export const validatePhoneNumber = (phoneNumber: string): { valid: boolean; error?: string } => {
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // 한국 번호 형식 검사 (010, 011, 016, 017, 018, 019)
  const phoneRegex = /^(0(10|11|16|17|18|19))\d{7,8}$/;

  if (!phoneRegex.test(cleaned)) {
    return {
      valid: false,
      error: '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)'
    };
  }

  return { valid: true };
};

/**
 * SMS 전송 에러 메시지
 */
const getSMSErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-phone-number':
      return '유효하지 않은 전화번호입니다.';
    case 'auth/missing-phone-number':
      return '전화번호를 입력해주세요.';
    case 'auth/quota-exceeded':
      return 'SMS 전송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    case 'auth/too-many-requests':
      return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
    default:
      return 'SMS 전송에 실패했습니다. 다시 시도해주세요.';
  }
};

/**
 * 인증번호 확인 에러 메시지
 */
const getVerificationErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-verification-code':
      return '잘못된 인증번호입니다.';
    case 'auth/code-expired':
      return '인증번호가 만료되었습니다. 다시 요청해주세요.';
    default:
      return '인증에 실패했습니다. 다시 시도해주세요.';
  }
};

/**
 * reCAPTCHA 초기화 해제
 */
export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};
