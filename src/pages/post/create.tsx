import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImage } from '../../services/imageUpload';
import { firebase } from '../../lib/firebaseService';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'dating' | 'chat'>('dating');
  const [images, setImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  // 현재 로그인한 사용자 (Firebase 또는 로컬 스토리지)
  const getCurrentUser = () => {
    if (user) return user;
    const localUser = localStorage.getItem('auth_user');
    return localUser ? JSON.parse(localUser) : null;
  };

  // 이미지 선택 핸들러
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 최대 5개 제한
    if (images.length + files.length > 5) {
      alert('이미지는 최대 5개까지 업로드할 수 있습니다.');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // 미리보기 생성
        const previewUrl = URL.createObjectURL(file);
        setPreviews((prev) => [...prev, previewUrl]);

        // 이미지 업로드
        const url = await uploadImage(file, 'posts', 'community');
        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 이미지 삭제
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 게시물 작성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!currentUser.id) {
      console.error('사용자 ID가 없습니다:', currentUser);
      alert('사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
      return;
    }

    setPosting(true);

    try {
      console.log('게시글 작성 시작:', {
        userId: currentUser.id,
        category,
        contentLength: content.length
      });

      // Firebase 게시글 생성
      const postData: any = {
        author_name: currentUser.name || '익명',
        avatar_url: currentUser.profile_image || currentUser.avatar_url || '',
        title: content.substring(0, 50),
        content: content.trim(),
        images: images,
        likes: 0,
        views: 0,
        category: category
      };

      // 선택적 필드는 값이 있을 때만 추가 (undefined 방지)
      if (images.length > 0) {
        postData.image_url = images[0];
      }
      if (currentUser.age) {
        postData.age = currentUser.age;
      }
      if (currentUser.location) {
        postData.location = currentUser.location;
      }
      if (currentUser.school || currentUser.job) {
        postData.job = currentUser.school || currentUser.job;
      }

      console.log('전송할 데이터:', postData);

      const { post, error } = await firebase.posts.createPost(currentUser.id, postData);

      if (error) {
        console.error('Firebase 에러:', error);
        throw error;
      }

      if (!post) {
        throw new Error('게시물이 생성되지 않았습니다.');
      }

      console.log('게시물 작성 성공:', post);
      alert('게시물이 작성되었습니다!');
      navigate('/', { state: { activeTab: 'community' } });
    } catch (error: any) {
      console.error('게시물 작성 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`게시물 작성에 실패했습니다.\n${error.message || '알 수 없는 오류가 발생했습니다.'}`);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-100 sticky top-0 z-30 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
          <h1 className="text-xl font-bold text-gray-900">새 게시물</h1>
          <button
            onClick={handleSubmit}
            disabled={posting || !content.trim()}
            className="text-pink-500 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? '게시 중...' : '게시'}
          </button>
        </div>
      </div>

      {/* 본문 */}
      <form onSubmit={handleSubmit} className="p-5">
        {/* 카테고리 선택 */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setCategory('dating')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              category === 'dating'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            소개팅
          </button>
          <button
            type="button"
            onClick={() => setCategory('chat')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              category === 'chat'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            잡담
          </button>
        </div>

        {/* 텍스트 입력 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="무슨 생각을 하고 계신가요?"
          className="w-full min-h-[200px] text-lg border-none outline-none resize-none"
          autoFocus
        />

        {/* 이미지 미리보기 */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={preview}
                  alt={`미리보기 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 이미지 업로드 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5">
          <label
            className={`flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={uploading || images.length >= 5}
            />
            {uploading ? (
              <span className="text-gray-600">
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                업로드 중...
              </span>
            ) : (
              <span className="text-gray-600">
                <i className="ri-image-add-line text-xl mr-2"></i>
                사진 추가 ({images.length}/5)
              </span>
            )}
          </label>
        </div>
      </form>
    </div>
  );
}
