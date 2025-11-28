/**
 * WebCrypto API를 사용한 SHA-256 비밀번호 해싱 (브라우저 호환)
 * @param password - 평문 비밀번호
 * @returns SHA-256 해시 문자열
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('비밀번호 해싱 실패:', error);
    throw new Error('비밀번호 처리 중 오류가 발생했습니다.');
  }
};
