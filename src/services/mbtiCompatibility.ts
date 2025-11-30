// MBTI 궁합 데이터 및 분석 서비스

export interface MBTICompatibility {
  score: number; // 0-100 점수
  level: 'excellent' | 'good' | 'average' | 'challenging';
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

// MBTI 궁합 점수 데이터 (16x16 매트릭스)
const compatibilityScores: Record<string, Record<string, number>> = {
  'INTJ': { 'ENFP': 95, 'ENTP': 90, 'INFJ': 85, 'INFP': 85, 'ENTJ': 80, 'INTP': 80, 'ENFJ': 75, 'ISTJ': 70, 'ISFJ': 65, 'ESTJ': 65, 'ESFJ': 60, 'ISTP': 60, 'ISFP': 55, 'ESTP': 55, 'ESFP': 50, 'INTJ': 75 },
  'INTP': { 'ENTJ': 95, 'ENFJ': 90, 'INTJ': 85, 'INFJ': 85, 'ENTP': 80, 'INFP': 75, 'ENFP': 70, 'ISTJ': 65, 'ISTP': 65, 'ESTJ': 60, 'ISFJ': 60, 'ESTP': 55, 'ESFJ': 55, 'ISFP': 50, 'ESFP': 50, 'INTP': 75 },
  'ENTJ': { 'INTP': 95, 'INFP': 90, 'INTJ': 85, 'ENFP': 85, 'ENTP': 80, 'INFJ': 75, 'ENFJ': 70, 'ISTP': 65, 'ISTJ': 65, 'ESTP': 60, 'ESTJ': 60, 'ISFP': 55, 'ISFJ': 55, 'ESFP': 50, 'ESFJ': 50, 'ENTJ': 70 },
  'ENTP': { 'INFJ': 95, 'INTJ': 90, 'ENFP': 85, 'INFP': 85, 'ENTJ': 80, 'INTP': 80, 'ENFJ': 75, 'ISFJ': 70, 'ISTJ': 65, 'ESFJ': 65, 'ESTJ': 60, 'ISFP': 60, 'ISTP': 55, 'ESFP': 55, 'ESTP': 50, 'ENTP': 75 },
  'INFJ': { 'ENTP': 95, 'ENFP': 90, 'INFP': 85, 'INTJ': 85, 'ENFJ': 80, 'INTP': 80, 'ENTJ': 75, 'ISFP': 70, 'ISTP': 65, 'ESFP': 65, 'ESTP': 60, 'ISFJ': 60, 'ISTJ': 55, 'ESFJ': 55, 'ESTJ': 50, 'INFJ': 75 },
  'INFP': { 'ENFJ': 95, 'ENTJ': 90, 'INFJ': 85, 'ENFP': 85, 'ENTP': 80, 'INTJ': 75, 'INTP': 75, 'ISFJ': 70, 'ESFJ': 65, 'ISTJ': 65, 'ESTJ': 60, 'ISFP': 60, 'ISTP': 55, 'ESFP': 55, 'ESTP': 50, 'INFP': 75 },
  'ENFJ': { 'INFP': 95, 'INTP': 90, 'ENFP': 85, 'INFJ': 85, 'ENTJ': 75, 'ENTP': 75, 'ISFP': 70, 'ISFJ': 70, 'ESFJ': 65, 'ISTJ': 65, 'ESTJ': 60, 'ISTP': 60, 'ESFP': 55, 'ESTP': 55, 'INTJ': 70, 'ENFJ': 75 },
  'ENFP': { 'INTJ': 95, 'INFJ': 90, 'ENFJ': 85, 'INFP': 85, 'ENTP': 80, 'ENTJ': 80, 'INTP': 75, 'ESFJ': 70, 'ISFJ': 70, 'ESFP': 65, 'ISFP': 65, 'ESTJ': 60, 'ISTJ': 60, 'ESTP': 55, 'ISTP': 55, 'ENFP': 75 },
  'ISTJ': { 'ESFP': 85, 'ESTP': 80, 'ISFP': 75, 'ISTP': 75, 'ESTJ': 75, 'ISFJ': 70, 'ESFJ': 70, 'INTJ': 65, 'ENTJ': 65, 'ENTP': 60, 'INTP': 60, 'ENFP': 55, 'INFP': 55, 'ENFJ': 55, 'INFJ': 50, 'ISTJ': 70 },
  'ISFJ': { 'ESFP': 90, 'ESTP': 85, 'ENFP': 80, 'ENTP': 75, 'INFP': 75, 'ESFJ': 75, 'ISFP': 70, 'ESTJ': 70, 'ISTJ': 70, 'ISTP': 65, 'ENFJ': 65, 'INFJ': 60, 'ENTJ': 55, 'INTJ': 55, 'INTP': 55, 'ISFJ': 70 },
  'ESTJ': { 'ISFP': 85, 'ISTP': 80, 'ESFP': 75, 'ESTP': 75, 'ISTJ': 75, 'ESFJ': 70, 'ISFJ': 70, 'ENTJ': 65, 'INTJ': 65, 'INTP': 60, 'ENTP': 60, 'INFP': 55, 'ENFP': 55, 'INFJ': 55, 'ENFJ': 50, 'ESTJ': 70 },
  'ESFJ': { 'ISFP': 90, 'ISTP': 85, 'INFP': 80, 'ENFP': 75, 'INTP': 75, 'ESFP': 75, 'ISTJ': 70, 'ESTJ': 70, 'ISFJ': 70, 'ESTP': 65, 'INFJ': 65, 'ENFJ': 60, 'INTJ': 55, 'ENTJ': 55, 'ENTP': 55, 'ESFJ': 70 },
  'ISTP': { 'ESFJ': 85, 'ESTJ': 80, 'ISFJ': 75, 'ISTJ': 75, 'ESTP': 75, 'ESFP': 70, 'ISFP': 70, 'ENTJ': 65, 'ENTP': 60, 'INTJ': 60, 'INTP': 60, 'ENFJ': 55, 'INFJ': 55, 'ENFP': 55, 'INFP': 50, 'ISTP': 70 },
  'ISFP': { 'ENFJ': 90, 'ESFJ': 90, 'INFJ': 85, 'ESTJ': 80, 'ENTJ': 75, 'ISTJ': 75, 'ESFP': 75, 'ISFJ': 70, 'ESTP': 70, 'ISTP': 70, 'ENTP': 65, 'INFP': 65, 'ENFP': 60, 'INTJ': 55, 'INTP': 50, 'ISFP': 70 },
  'ESTP': { 'ISFJ': 85, 'ISTJ': 80, 'ESFJ': 75, 'ESTJ': 75, 'ISTP': 75, 'ISFP': 70, 'ESFP': 70, 'ENTP': 60, 'INTP': 60, 'ENTJ': 60, 'INTJ': 55, 'INFP': 55, 'ENFP': 55, 'INFJ': 55, 'ENFJ': 50, 'ESTP': 70 },
  'ESFP': { 'ISFJ': 90, 'ISTJ': 85, 'ESFJ': 80, 'ENFJ': 75, 'ESTJ': 75, 'INFJ': 75, 'ISFP': 75, 'ESTP': 70, 'ISTP': 70, 'ENFP': 65, 'INFP': 65, 'ENTP': 60, 'INTP': 55, 'ENTJ': 50, 'INTJ': 50, 'ESFP': 70 }
};

// MBTI별 특성 설명
const mbtiTraits: Record<string, { name: string; description: string }> = {
  'INTJ': { name: '전략가', description: '상상력이 풍부하고 전략적인 사고를 하는 계획가' },
  'INTP': { name: '논리술사', description: '혁신적인 아이디어를 가진 지적 탐구자' },
  'ENTJ': { name: '통솔자', description: '대담하고 상상력이 풍부한 강력한 지도자' },
  'ENTP': { name: '변론가', description: '지적 도전을 즐기는 영리한 악마의 대변인' },
  'INFJ': { name: '옹호자', description: '이상주의적이고 원칙주의적인 선의의 활동가' },
  'INFP': { name: '중재자', description: '이타적이고 항상 선한 동기로 행동하는 사람' },
  'ENFJ': { name: '선도자', description: '카리스마 있고 영감을 주는 지도자' },
  'ENFP': { name: '활동가', description: '열정적이고 창의적인 자유로운 영혼' },
  'ISTJ': { name: '현실주의자', description: '실용적이고 사실에 기반한 신뢰할 수 있는 사람' },
  'ISFJ': { name: '수호자', description: '헌신적이고 따뜻한 수호자' },
  'ESTJ': { name: '경영자', description: '질서를 중시하는 훌륭한 관리자' },
  'ESFJ': { name: '집정관', description: '배려심이 많고 사교적인 협력자' },
  'ISTP': { name: '장인', description: '대담하고 실용적인 탐험가' },
  'ISFP': { name: '모험가', description: '유연하고 매력적인 예술가' },
  'ESTP': { name: '사업가', description: '영리하고 에너지 넘치는 모험을 즐기는 사람' },
  'ESFP': { name: '연예인', description: '즉흥적이고 열정적인 즐거움을 추구하는 사람' }
};

// 궁합 레벨별 설명
const compatibilityDescriptions = {
  excellent: {
    title: '환상의 궁합',
    emoji: '💖',
    color: '#ec4899'
  },
  good: {
    title: '좋은 궁합',
    emoji: '💕',
    color: '#f472b6'
  },
  average: {
    title: '평범한 궁합',
    emoji: '💛',
    color: '#fbbf24'
  },
  challenging: {
    title: '노력이 필요한 궁합',
    emoji: '💙',
    color: '#60a5fa'
  }
};

// 궁합 상세 설명 생성
const generateCompatibilityDetails = (
  myMBTI: string,
  partnerMBTI: string,
  score: number
): Omit<MBTICompatibility, 'score' | 'level'> => {
  // 기본 템플릿
  const templates = {
    excellent: {
      strengths: [
        '서로의 다른 점이 완벽하게 보완됩니다',
        '깊은 이해와 공감대를 형성합니다',
        '함께 성장하며 발전할 수 있습니다',
        '자연스러운 케미스트리가 있습니다'
      ],
      challenges: [
        '너무 비슷해서 가끔 지루할 수 있습니다',
        '서로의 약점을 보완하는 노력이 필요합니다'
      ],
      advice: '서로의 차이를 존중하며, 함께 성장하는 데 집중하세요. 훌륭한 파트너십을 만들 수 있습니다!'
    },
    good: {
      strengths: [
        '서로를 존중하고 이해합니다',
        '건강한 관계를 만들 수 있습니다',
        '서로에게 긍정적인 영향을 줍니다'
      ],
      challenges: [
        '가치관 차이로 인한 의견 충돌이 있을 수 있습니다',
        '서로의 소통 방식을 이해하는 노력이 필요합니다',
        '때때로 오해가 생길 수 있습니다'
      ],
      advice: '열린 마음으로 소통하고, 서로의 차이를 이해하려 노력하세요. 좋은 관계를 만들 수 있습니다.'
    },
    average: {
      strengths: [
        '서로에게서 새로운 것을 배울 수 있습니다',
        '다양한 관점을 나눌 수 있습니다'
      ],
      challenges: [
        '성격 차이로 인한 갈등이 자주 있을 수 있습니다',
        '서로를 이해하는 데 시간이 필요합니다',
        '소통에 많은 노력이 필요합니다',
        '가치관 차이를 조율해야 합니다'
      ],
      advice: '인내심을 가지고 서로를 이해하려 노력하세요. 시간과 노력이 필요하지만 좋은 관계를 만들 수 있습니다.'
    },
    challenging: {
      strengths: [
        '서로에게 새로운 시각을 제공합니다',
        '다양성을 경험할 수 있습니다'
      ],
      challenges: [
        '근본적인 가치관 차이가 있습니다',
        '소통이 매우 어려울 수 있습니다',
        '서로의 행동을 이해하기 힘듭니다',
        '많은 타협과 노력이 필요합니다',
        '갈등이 자주 발생할 수 있습니다'
      ],
      advice: '서로의 근본적인 차이를 인정하고, 존중하는 것이 중요합니다. 관계 유지에 상당한 노력이 필요합니다.'
    }
  };

  let level: 'excellent' | 'good' | 'average' | 'challenging';
  if (score >= 85) level = 'excellent';
  else if (score >= 70) level = 'good';
  else if (score >= 55) level = 'average';
  else level = 'challenging';

  const template = templates[level];
  const myTrait = mbtiTraits[myMBTI];
  const partnerTrait = mbtiTraits[partnerMBTI];

  return {
    title: compatibilityDescriptions[level].title,
    description: `${myTrait.name}(${myMBTI})와 ${partnerTrait.name}(${partnerMBTI})의 조합입니다.`,
    strengths: template.strengths,
    challenges: template.challenges,
    advice: template.advice
  };
};

/**
 * 두 MBTI 타입의 궁합을 분석합니다
 */
export function analyzeMBTICompatibility(
  myMBTI: string,
  partnerMBTI: string
): MBTICompatibility {
  // MBTI 대문자로 변환 및 유효성 검사
  const my = myMBTI.toUpperCase();
  const partner = partnerMBTI.toUpperCase();

  if (!compatibilityScores[my] || !compatibilityScores[partner]) {
    return {
      score: 50,
      level: 'average',
      title: '알 수 없는 궁합',
      description: 'MBTI 정보가 올바르지 않습니다.',
      strengths: ['서로를 알아가는 시간이 필요합니다'],
      challenges: ['MBTI를 정확히 입력해주세요'],
      advice: 'MBTI 검사를 통해 정확한 유형을 확인하세요.'
    };
  }

  const score = compatibilityScores[my][partner] || 50;
  let level: 'excellent' | 'good' | 'average' | 'challenging';

  if (score >= 85) level = 'excellent';
  else if (score >= 70) level = 'good';
  else if (score >= 55) level = 'average';
  else level = 'challenging';

  const details = generateCompatibilityDetails(my, partner, score);

  return {
    score,
    level,
    ...details
  };
}

/**
 * 궁합 레벨에 따른 색상 반환
 */
export function getCompatibilityColor(level: MBTICompatibility['level']): string {
  return compatibilityDescriptions[level].color;
}

/**
 * 궁합 레벨에 따른 이모지 반환
 */
export function getCompatibilityEmoji(level: MBTICompatibility['level']): string {
  return compatibilityDescriptions[level].emoji;
}

/**
 * MBTI 특성 정보 반환
 */
export function getMBTITrait(mbti: string) {
  return mbtiTraits[mbti.toUpperCase()] || { name: '알 수 없음', description: '' };
}
