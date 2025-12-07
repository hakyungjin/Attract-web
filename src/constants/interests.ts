/**
 * 관심사 상수 목록
 * 소개팅 앱에서 자주 사용되는 관심사를 카테고리별로 분류
 */

// 카테고리별 관심사 정의
export const INTEREST_CATEGORIES = {
  취미: [
    '영화보기',
    '넷플릭스',
    '음악감상',
    '독서',
    '게임',
    '요리',
    '베이킹',
    '그림그리기',
    '사진찍기',
    '악기연주',
  ],
  운동: [
    '헬스',
    '러닝',
    '등산',
    '수영',
    '요가',
    '필라테스',
    '테니스',
    '골프',
    '축구',
    '농구',
    '배드민턴',
    '볼링',
    '자전거',
    '클라이밍',
  ],
  음식: [
    '맛집탐방',
    '카페투어',
    '와인',
    '맥주',
    '커피',
    '디저트',
    '홈술',
    '브런치',
  ],
  여행: [
    '국내여행',
    '해외여행',
    '캠핑',
    '드라이브',
    '백패킹',
  ],
  문화: [
    '전시회',
    '공연관람',
    '뮤지컬',
    '콘서트',
    '페스티벌',
  ],
  자기계발: [
    '외국어',
    '자격증',
    '재테크',
    '투자',
    '독서모임',
  ],
  반려동물: [
    '강아지',
    '고양이',
    '반려동물',
  ],
  기타: [
    '쇼핑',
    '패션',
    '뷰티',
    'K-POP',
    '애니메이션',
    '웹툰',
    '봉사활동',
  ],
} as const;

// 전체 관심사 목록 (flat array)
export const ALL_INTERESTS: string[] = Object.values(INTEREST_CATEGORIES).flat();

// 인기 관심사 (상위 표시용)
export const POPULAR_INTERESTS = [
  '영화보기',
  '맛집탐방',
  '헬스',
  '넷플릭스',
  '카페투어',
  '여행',
  '음악감상',
  '게임',
  '요리',
  '독서',
  '러닝',
  '드라이브',
];

// 카테고리 이름 목록
export const INTEREST_CATEGORY_NAMES = Object.keys(INTEREST_CATEGORIES) as Array<keyof typeof INTEREST_CATEGORIES>;

// 카테고리 아이콘 (옵션)
export const INTEREST_CATEGORY_ICONS: Record<keyof typeof INTEREST_CATEGORIES, string> = {
  취미: 'ri-palette-line',
  운동: 'ri-run-line',
  음식: 'ri-restaurant-line',
  여행: 'ri-plane-line',
  문화: 'ri-movie-line',
  자기계발: 'ri-book-open-line',
  반려동물: 'ri-heart-2-line',
  기타: 'ri-more-line',
};

