import { useState, useRef } from 'react';
import { uploadImage, validateImageFile, createPreviewUrl, revokePreviewUrl } from '../services/imageUpload';

interface ImageUploaderProps {
  bucket?: string;
  folder?: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  currentImageUrl?: string;
  maxSize?: number; // MB
}

export default function ImageUploader({
  bucket = 'avatars',
  folder,
  onUploadSuccess,
  onUploadError,
  currentImageUrl,
  maxSize = 5
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validation = validateImageFile(file, maxSize);
    if (!validation.valid) {
      onUploadError?.(validation.error || '파일이 유효하지 않습니다.');
      alert(validation.error);
      return;
    }

    // 미리보기 생성
    const preview = createPreviewUrl(file);
    setPreviewUrl(preview);

    // 업로드
    setIsUploading(true);
    try {
      const url = await uploadImage(file, bucket, folder);
      onUploadSuccess?.(url);

      // 이전 미리보기 URL 메모리 해제
      if (preview !== currentImageUrl) {
        revokePreviewUrl(preview);
      }
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error);
      const errorMessage = error.message || '이미지 업로드에 실패했습니다.';
      onUploadError?.(errorMessage);
      alert(errorMessage);

      // 실패 시 미리보기 URL 메모리 해제
      if (preview && preview !== currentImageUrl) {
        revokePreviewUrl(preview);
      }

      // 실패 시 이전 이미지로 복구
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      {/* 이미지 미리보기 */}
      <div
        onClick={handleClick}
        className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 cursor-pointer border-2 border-gray-200 hover:border-pink-500 transition-all"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="프로필 이미지"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="ri-user-line text-4xl text-gray-400"></i>
          </div>
        )}

        {/* 업로드 중 표시 */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* 카메라 아이콘 */}
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white">
          <i className="ri-camera-line text-white text-lg"></i>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 안내 텍스트 */}
      <p className="text-xs text-gray-500 mt-2">
        JPG, PNG, GIF, WebP (최대 {maxSize}MB)
      </p>
    </div>
  );
}
