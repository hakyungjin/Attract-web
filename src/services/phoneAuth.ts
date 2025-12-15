import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { firebase } from '../lib/firebaseService';

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
 * @param phoneNumber - 전화번호 (유령 회원 확인용)
 * @returns isNewUser: 신규 사용자 여부
 */
export const verifyCode = async (
  confirmationResult: ConfirmationResult,
  verificationCode: string,
  phoneNumber?: string
) => {
  try {
    // Firebase로 인증
    const result = await confirmationResult.confirm(verificationCode);
    const user = result.user;

    console.log('Firebase 인증 성공:', user.uid);

    // Supabase에서 기존 사용자 확인 (전화번호도 함께 전달)
    const { isNewUser, userData } = await checkUserExists(user.uid, phoneNumber);

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
 * Firestore에서 사용자 존재 여부 확인
 * firebase_uid로 먼저 확인하고, 없으면 전화번호로 확인 (유령 회원 대응)
 */
const checkUserExists = async (firebaseUid: string, phoneNumber?: string) => {
  try {
    console.log('🔍 Firestore 쿼리 시작:', {
      firebaseUid,
      phoneNumber
    });

    // 1. firebase_uid로 사용자 확인
    const { user: existingUser, error: checkError } = await firebase.users.findUserByFirebaseUid(firebaseUid);

    console.log('🔍 firebase_uid 쿼리 결과:', {
      hasData: !!existingUser,
      error: checkError ? checkError.message : null
    });

    if (checkError && !existingUser) {
      // 에러가 있지만 계속 진행 (사용자가 없을 수 있음)
      console.log('firebase_uid로 사용자를 찾을 수 없음, 전화번호로 확인 시도');
    }

    // firebase_uid로 찾았으면 기존 사용자
    if (existingUser) {
      console.log('✅ firebase_uid로 기존 사용자 확인됨');
      return { isNewUser: false, userData: existingUser };
    }

    // 2. firebase_uid로 못 찾았고, 전화번호가 있으면 전화번호로 확인 (유령 회원)
    if (phoneNumber) {
      // 전화번호를 010XXXXXXXX 형식으로 변환 (DB 저장 형식과 일치)
      // 010-1234-5678 → 01012345678
      // +821012345678 → 01012345678
      let cleanedPhone = phoneNumber.replace(/[^\d]/g, ''); // 숫자만 남기기

      // +82로 시작하면 82 제거하고 0 추가
      if (cleanedPhone.startsWith('82')) {
        cleanedPhone = '0' + cleanedPhone.substring(2);
      }

      console.log('🔍 원본 전화번호:', phoneNumber);
      console.log('🔍 변환된 전화번호:', cleanedPhone);

      const { user: ghostUser } = await firebase.users.findUserByPhoneNumber(cleanedPhone);

      console.log('🔍 전화번호 쿼리 결과:', {
        hasData: !!ghostUser,
        searchedPhone: cleanedPhone
      });

      // 전화번호로 찾았지만 firebase_uid가 없는 경우 (유령 회원)
      if (ghostUser && !ghostUser.firebase_uid) {
        console.log('👻 유령 회원 발견! firebase_uid 업데이트 중...');

        // 유령 회원에 firebase_uid 연결
        const { error: updateError } = await firebase.users.updateUser(ghostUser.id, {
          firebase_uid: firebaseUid
        });

        if (updateError) {
          console.error('firebase_uid 업데이트 실패:', updateError);
        } else {
          console.log('✅ firebase_uid 업데이트 완료');
          ghostUser.firebase_uid = firebaseUid; // 로컬 데이터도 업데이트
        }

        return { isNewUser: false, userData: ghostUser };
      }
    }

    // 사용자를 못 찾았으면 신규
    console.log('❌ 신규 사용자');
    return { isNewUser: true, userData: null };
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
    mbti?: string;
    school?: string;
    height?: string;
    body_type?: string;
    style?: string;
    religion?: string;
    smoking?: string;
    drinking?: string;
    interests?: string[];
    photos?: string[];
    password?: string; // 비밀번호 추가
  }
) => {
  try {
    // 전화번호를 숫자만 남기고 저장 (010XXXXXXXX 형식)
    const cleanedPhone = phoneNumber.replace(/[^\d]/g, '').replace(/^\+82/, '0');

    console.log('회원가입 전화번호 저장:', cleanedPhone);

    const { user: data, error } = await firebase.users.createUser({
      firebase_uid: firebaseUid,
      phone_number: cleanedPhone,
      name: userData.name,
      age: userData.age,
      gender: userData.gender,
      location: userData.location,
      bio: userData.bio,
      mbti: userData.mbti,
      school: userData.school,
      height: userData.height,
      body_type: userData.body_type,
      style: userData.style,
      religion: userData.religion,
      smoking: userData.smoking,
      drinking: userData.drinking,
      interests: userData.interests,
      photos: userData.photos,
      password: userData.password || null, // 비밀번호 추가
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('사용자 생성 실패:', error);
      throw error;
    }

    console.log('Firestore에 새 사용자 생성됨:', data);
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
  // 숫자만 남기기
  let cleaned = phoneNumber.replace(/[^\d]/g, '');

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
