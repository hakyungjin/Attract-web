import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * 이미지 업로드 함수
 * @param file - 업로드할 파일
 * @param bucket - 저장할 버킷 이름 (avatars, posts, etc.)
 * @param folder - 버킷 내 폴더 경로 (선택사항)
 * @returns 업로드된 이미지의 공개 URL
 */
export const uploadImage = async (
  file: File,
  bucket: string = 'avatars',
  folder?: string
): Promise<string> => {
  try {
    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop();

    // 고유한 파일명 생성 (타임스탬프 + 랜덤)
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // 파일 경로 생성
    const filePath = folder ? `${bucket}/${folder}/${fileName}` : `${bucket}/${fileName}`;

    // Firebase Storage에 업로드
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);

    // 공개 URL 생성
    const publicUrl = await getDownloadURL(storageRef);

    return publicUrl;
  } catch (error) {
    console.error('uploadImage error:', error);
    throw error;
  }
};

/**
 * 이미지 삭제 함수
 * @param url - 삭제할 이미지 URL
 * @param bucket - 버킷 이름
 */
export const deleteImage = async (
  url: string,
  bucket: string = 'avatars'
): Promise<void> => {
  try {
    // URL에서 파일 경로 추출 (Firebase Storage URL에서 파일 경로 파싱)
    // Firebase URL 형식: https://firebasestorage.googleapis.com/.../o/{path}?alt=media...
    const urlParts = url.split('/o/');
    if (urlParts.length < 2) {
      throw new Error('Invalid Firebase Storage URL');
    }
    const pathWithToken = urlParts[1].split('?')[0];
    const path = decodeURIComponent(pathWithToken);

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('deleteImage error:', error);
    throw error;
  }
};

/**
 * 이미지 파일 유효성 검사
 * @param file - 검사할 파일
 * @param maxSize - 최대 파일 크기 (MB)
 */
export const validateImageFile = (
  file: File,
  maxSize: number = 5
): { valid: boolean; error?: string } => {
  // 파일 타입 검사
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)'
    };
  }

  // 파일 크기 검사 (MB)
  const maxSizeInBytes = maxSize * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `파일 크기는 ${maxSize}MB 이하여야 합니다.`
    };
  }

  return { valid: true };
};

/**
 * 이미지 미리보기 URL 생성
 * @param file - 미리보기할 파일
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * 미리보기 URL 메모리 해제
 * @param url - 해제할 URL
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};
