import { supabase } from '../lib/supabase';
import { verifyPassword, hashPassword } from './passwordService';

export interface LoginResult {
  success: boolean;
  user?: any;
  error?: string;
}

/**
 * 전화번호와 비밀번호로 로그인
 * @param phoneNumber - 전화번호
 * @param password - 비밀번호
 * @returns 로그인 결과
 */
export const loginWithPhone = async (
  phoneNumber: string,
  password: string
): Promise<LoginResult> => {
  try {
    // 전화번호 정리 (숫자만)
    const cleanedPhone = phoneNumber.replace(/[^\d]/g, '');

    // 사용자 찾기
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', cleanedPhone)
      .single();

    if (error || !user) {
      console.error('사용자 조회 실패:', error);
      return {
        success: false,
        error: '등록되지 않은 전화번호입니다.'
      };
    }

    // 비밀번호 확인
    if (!user.password) {
      return {
        success: false,
        error: '비밀번호가 설정되지 않았습니다.'
      };
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        error: '비밀번호가 일치하지 않습니다.'
      };
    }

    // 로그인 성공 - 민감한 정보 제거
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword
    };
  } catch (error: any) {
    console.error('로그인 오류:', error);
    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 회원가입 시 비밀번호 저장
 * @param phoneNumber - 전화번호
 * @param password - 비밀번호
 */
export const updateUserPassword = async (
  phoneNumber: string,
  password: string
): Promise<boolean> => {
  try {
    const hashedPassword = await hashPassword(password);

    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('phone_number', phoneNumber);

    if (error) {
      console.error('비밀번호 저장 실패:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('비밀번호 업데이트 오류:', error);
    return false;
  }
};
