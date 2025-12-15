import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '../lib/firebase';

/**
 * 이미지 업로드 함수 (Firebase Storage)
 * @param file - 업로드할 파일
 * @param bucket - 저장할 폴더 경로 (avatars, posts, etc.)
 * @param folder - 폴더 내 하위 경로 (선택사항)
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

    // Firebase Storage 참조 생성
    const storageRef = ref(firebaseStorage, filePath);

    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      cacheControl: 'public, max-age=3600'
    });

    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Analytics: 이미지 업로드 이벤트
    const imageType = bucket === 'avatars' || bucket === 'profile-images' ? 'avatar' : bucket === 'posts' ? 'post' : 'gallery';
    logImageUpload(imageType);

    return downloadURL;
  } catch (error: any) {
    console.error('이미지 업로드 실패:', error);
    throw new Error(`이미지 업로드 실패: ${error.message || '알 수 없는 오류'}`);
  }
};

/**
 * 이미지 삭제 함수 (Firebase Storage)
 * @param url - 삭제할 이미지 URL
 * @param bucket - 버킷 이름 (사용하지 않음, URL에서 추출)
 */
export const deleteImage = async (
  url: string,
  bucket: string = 'avatars'
): Promise<void> => {
  try {
    // Firebase Storage URL에서 파일 경로 추출
    // URL 형식: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('유효하지 않은 Firebase Storage URL입니다.');
    }

    // URL 디코딩된 경로
    const filePath = decodeURIComponent(pathMatch[1]);

    // Firebase Storage 참조 생성
    const storageRef = ref(firebaseStorage, filePath);

    // 파일 삭제 (deleteObject는 firebase/storage에서 import 필요)
    const { deleteObject } = await import('firebase/storage');
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error('이미지 삭제 실패:', error);
    throw new Error(`이미지 삭제 실패: ${error.message || '알 수 없는 오류'}`);
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
