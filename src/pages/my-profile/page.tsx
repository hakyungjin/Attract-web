import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  school: string;
  mbti: string;
  character: string;
  bio: string;
  photos?: string[];
  interests?: string[];
  height?: string;
  bodyType?: string;
  style?: string;
  religion?: string;
  smoking?: string;
  drinking?: string;
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // 내 프로필 데이터 로드
  useEffect(() => {
    const loadMyProfile = async () => {
      try {
        // localStorage에서 사용자 정보 확인
        const localUser = localStorage.getItem('user');
        let userId = authUser?.id;
        
        if (!userId && localUser) {
          try {
            const userData = JSON.parse(localUser);
            userId = userData.id;
          } catch {
            // 파싱 실패
          }
        }

        if (!userId) {
          navigate('/login');
          return;
        }

        // Supabase에서 내 프로필 로드
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('프로필 로드 실패:', error);
          return;
        }

        if (data) {
          setProfile({
            id: data.id,
            name: data.name || data.nickname || '익명',
            age: data.age || 0,
            gender: data.gender || '',
            location: data.location || '',
            school: data.school || '',
            mbti: data.mbti || '',
            character: data.character || '',
            bio: data.bio || '',
            photos: data.photos || (data.profile_image ? [data.profile_image] : []),
            interests: data.interests || [],
            height: data.height || '',
            bodyType: data.body_type || data.bodyType || '',
            style: data.style || '',
            religion: data.religion || '',
            smoking: data.smoking || '',
            drinking: data.drinking || '',
          });
        }
      } catch (error) {
        console.error('프로필 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMyProfile();
  }, [authUser?.id, navigate]);

  // 기본 프로필 이미지
  const getDefaultAvatar = (gender: string) => {
    if (gender === '남자' || gender === 'male') {
      return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
    }
    return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
  };

  // 프로필 사진 배열
  const profilePhotos = profile?.photos && profile.photos.length > 0
    ? profile.photos
    : [getDefaultAvatar(profile?.gender || '')];

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? profilePhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === profilePhotos.length - 1 ? 0 : prev + 1));
  };

  const handleEditProfile = () => {
    navigate('/profile-edit');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">프로필을 불러올 수 없습니다</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-cyan-500 text-white px-6 py-2 rounded-full"
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  // 프로필 정보
  const profileInfo = {
    school: profile.school || '정보없음',
    height: profile.height || '정보없음',
    bodyType: profile.bodyType || '정보없음',
    style: profile.style || '정보없음',
    religion: profile.religion || '정보없음',
    mbti: profile.mbti || '정보없음',
    smoking: profile.smoking || '정보없음',
    drinking: profile.drinking || '정보없음'
  };

  const interests = profile.interests || [];

  return (
    <div className="min-h-screen bg-cyan-50 pb-24 pb-[calc(96px+env(safe-area-inset-bottom))]">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-s-line text-2xl"></i>
          </button>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-800">내 프로필 미리보기</span>
          </div>
          <button 
            onClick={handleEditProfile}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-edit-line text-xl text-cyan-600"></i>
          </button>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3">
        <div className="flex items-center justify-center space-x-2 text-white">
          <i className="ri-eye-line"></i>
          <span className="text-sm">다른 사람에게 보이는 내 프로필 화면입니다</span>
        </div>
      </div>

      {/* 프로필 사진 갤러리 */}
      <div className="relative bg-white">
        <div className="relative h-96 overflow-hidden">
          <img
            src={profilePhotos[currentPhotoIndex]}
            alt={`${profile.name} 사진 ${currentPhotoIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* 좌우 화살표 버튼 - 항상 표시 (사진 1장이어도) */}
          <button
            onClick={handlePrevPhoto}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg"
          >
            <i className="ri-arrow-left-s-line text-white text-2xl"></i>
          </button>
          <button
            onClick={handleNextPhoto}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg"
          >
            <i className="ri-arrow-right-s-line text-white text-2xl"></i>
          </button>

          {/* 사진 인디케이터 (하단 점) */}
          {profilePhotos.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {profilePhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer shadow-sm ${
                    index === currentPhotoIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}

          {/* 이름, 나이, 위치 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-6">
            <h2 className="text-white text-2xl font-bold drop-shadow-lg">{profile.name}, {profile.age}</h2>
            <p className="text-white/90 text-sm flex items-center mt-1">
              <i className="ri-map-pin-line mr-1"></i>
              {profile.location || '위치 정보 없음'}
            </p>
          </div>
        </div>
      </div>

      {/* 프로필 정보 */}
      <div className="px-4 py-6 space-y-4">
        {/* 기본 정보 테이블 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="border-b border-r border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">학교</div>
              <div className="font-medium text-gray-800">{profileInfo.school}</div>
            </div>
            <div className="border-b border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">키</div>
              <div className="font-medium text-gray-800">{profileInfo.height}</div>
            </div>
            <div className="border-b border-r border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">체형</div>
              <div className="font-medium text-gray-800">{profileInfo.bodyType}</div>
            </div>
            <div className="border-b border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">스타일</div>
              <div className="font-medium text-gray-800">{profileInfo.style}</div>
            </div>
            <div className="border-b border-r border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">종교</div>
              <div className="font-medium text-gray-800">{profileInfo.religion}</div>
            </div>
            <div className="border-b border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">MBTI</div>
              <div className="font-medium text-gray-800">{profileInfo.mbti}</div>
            </div>
            <div className="border-r border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">흡연</div>
              <div className="font-medium text-gray-800">{profileInfo.smoking}</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-1">음주</div>
              <div className="font-medium text-gray-800">{profileInfo.drinking}</div>
            </div>
          </div>
        </div>

        {/* 관심사 */}
        {interests.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-heart-3-line mr-2 text-cyan-500"></i>
              관심사
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span key={index} className="bg-cyan-50 text-cyan-600 px-4 py-2 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 자기소개 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <i className="ri-chat-quote-line mr-2 text-cyan-500"></i>
            자기소개
          </h3>
          <p className="text-gray-700 leading-relaxed">{profile.bio || '자기소개가 없습니다.'}</p>
        </div>

        {/* 프로필 수정 버튼 */}
        <button
          onClick={handleEditProfile}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <i className="ri-edit-line"></i>
          <span>프로필 수정하기</span>
        </button>
      </div>
    </div>
  );
}
