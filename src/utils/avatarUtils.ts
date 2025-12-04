/**
 * 프로필 이미지 관련 유틸리티 함수
 */

/**
 * 성별에 따른 기본 프로필 이미지 URL 반환
 * @param gender - 사용자 성별 ('male', '남자', 'female', '여자' 등)
 * @returns 기본 프로필 이미지 URL
 */
export const getDefaultAvatar = (gender: string): string => {
  const isMale = gender === 'male' || gender === '남자';
  const isFemale = gender === 'female' || gender === '여자';

  if (isMale) {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }

  // 기본값은 여성 아바타 (female이거나 알 수 없는 경우)
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

/**
 * 이미지 URL 최적화 (리사이징 및 품질 조정)
 * @param url - 원본 이미지 URL
 * @param width - 원하는 너비 (픽셀)
 * @param quality - 이미지 품질 (1-100)
 * @returns 최적화된 이미지 URL
 */
export const optimizeImageUrl = (
  url: string,
  width: number = 400,
  quality: number = 80
): string => {
  // Supabase Storage URL인 경우 변환 파라미터 추가
  if (url.includes('supabase')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=${quality}`;
  }
  return url;
};

/**
 * 프로필 이미지 배열 생성 (기본 이미지 포함)
 * @param photos - 사용자가 업로드한 사진 배열
 * @param gender - 사용자 성별
 * @returns 최소 1개 이상의 이미지를 포함한 배열
 */
export const getProfilePhotos = (
  photos: string[] | undefined | null,
  gender: string
): string[] => {
  if (photos && photos.length > 0) {
    return photos;
  }
  return [getDefaultAvatar(gender)];
};
