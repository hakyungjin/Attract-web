/**
 * MBTI 상수 및 유틸리티
 */

// 16가지 MBTI 타입
export const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
] as const;

export type MBTIType = typeof MBTI_TYPES[number];

/**
 * MBTI 타입이 유효한지 확인
 * @param mbti - 확인할 MBTI 문자열
 * @returns 유효 여부
 */
export const isValidMBTI = (mbti: string): boolean => {
  return MBTI_TYPES.includes(mbti as MBTIType);
};

/**
 * MBTI 카테고리별 그룹핑
 */
export const MBTI_GROUPS = {
  분석가: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
  외교관: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
  관리자: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  탐험가: ['ISTP', 'ISFP', 'ESTP', 'ESFP']
} as const;
