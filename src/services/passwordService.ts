import bcrypt from 'bcryptjs';

/**
 * 비밀번호 해싱
 * @param password - 평문 비밀번호
 * @returns 해시된 비밀번호
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  } catch (error) {
    console.error('비밀번호 해싱 실패:', error);
    throw new Error('비밀번호 처리 중 오류가 발생했습니다.');
  }
};

/**
 * 비밀번호 검증
 * @param password - 평문 비밀번호
 * @param hashedPassword - 해시된 비밀번호
 * @returns 일치 여부
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('비밀번호 검증 실패:', error);
    return false;
  }
};
