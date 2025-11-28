import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Profile {
  id: number;
  name: string;
  age: number;
  gender: string;
  location: string;
  school: string;
  mbti: string;
  character: string;
  bio: string;
  hasLikedMe?: boolean;
  isMatched?: boolean;
  photos?: string[];
  interests?: string[];
  height?: string;
  bodyType?: string;
  style?: string;
  religion?: string;
  smoking?: string;
  drinking?: string;
}

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender: string) => {
  if (gender === '남자') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

export default function ProfileDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // profile 또는 authorData를 받음
  const profile = (location.state?.profile || location.state?.authorData) as Profile;
  
  const [userRating, setUserRating] = useState(0);
  const [showLikeToast, setShowLikeToast] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // 프로필 사진 배열 (기본 이미지 포함)
  const profilePhotos = profile?.photos?.length 
    ? profile.photos 
    : [
        profile?.avatar_url || profile?.avatar || getDefaultAvatar(profile?.gender || '여자'),
        'https://readdy.ai/api/search-image?query=young%20Korean%20woman%20casual%20lifestyle%20photo%20portrait%20natural%20lighting%20soft%20smile%20wearing%20comfortable%20clothes%20indoor%20setting%20warm%20atmosphere%20clean%20background%20professional%20photography&width=400&height=500&seq=profile-photo-2&orientation=portrait',
        'https://readdy.ai/api/search-image?query=young%20Korean%20woman%20outdoor%20photo%20portrait%20natural%20daylight%20friendly%20expression%20casual%20style%20street%20photography%20urban%20background%20clean%20aesthetic%20professional%20quality&width=400&height=500&seq=profile-photo-3&orientation=portrait'
      ];

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? profilePhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === profilePhotos.length - 1 ? 0 : prev + 1));
  };

  if (!profile) {
    navigate(-1);
    return null;
  }

  // 프로필 정보 (기본값 설정)
  const profileInfo = {
    school: profile?.school || '정보없음',
    height: profile?.height || '정보없음',
    bodyType: profile?.bodyType || '정보없음',
    style: profile?.style || '정보없음',
    religion: profile?.religion || '정보없음',
    mbti: profile?.mbti || 'ESTP',
    smoking: profile?.smoking || '정보없음',
    drinking: profile?.drinking || '정보없음'
  };

  const interests = profile?.interests || ['관심사'];

  const handleLike = () => {
    if (profile.hasLikedMe) {
      setShowMatchModal(true);
    } else {
      setShowLikeToast(true);
      setTimeout(() => {
        setShowLikeToast(false);
        navigate(-1);
      }, 2000);
    }
  };

  const handlePass = () => {
    navigate(-1);
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
  };

  const startChatWithMatch = () => {
    setShowMatchModal(false);
    const event = new CustomEvent('openChat', { 
      detail: { 
        userId: profile.id, 
        userName: profile.name,
        userAvatar: profile.character || getDefaultAvatar(profile.gender)
      } 
    });
    window.dispatchEvent(event);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cyan-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-s-line text-2xl"></i>
          </button>
          <div className="flex items-center space-x-2">
            <img
              src={profile.avatar_url || profile.avatar || getDefaultAvatar(profile?.gender || '여자')}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultAvatar(profile?.gender || '여자');
              }}
            />
            <span className="font-medium text-gray-800">{profile.name}</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-more-2-fill text-xl"></i>
          </button>
        </div>
      </div>

      {/* 프로필 사진 갤러리 */}
      <div className="relative bg-white">
        <div className="relative h-96 overflow-hidden">
          <img
            src={profilePhotos[currentPhotoIndex]}
            alt={`${profile.name} 사진 ${currentPhotoIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getDefaultAvatar(profile.gender);
            }}
          />
          
          {/* 좌우 네비게이션 버튼 */}
          {profilePhotos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-s-line text-white text-xl"></i>
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-arrow-right-s-line text-white text-xl"></i>
              </button>
            </>
          )}
          
          {/* 사진 인디케이터 */}
          {profilePhotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {profilePhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 별점 평가 */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className="cursor-pointer"
            >
              <i className={`text-3xl ${star <= userRating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'}`}></i>
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">호감도를 체크해주세요</p>
      </div>

      {/* 프로필 정보 */}
      <div className="px-4 py-6 space-y-4">
        {/* 기본 정보 테이블 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="border-b border-r border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">학교</div>
              <div className="font-medium text-gray-800">{profile?.school || '정보없음'}</div>
            </div>
            <div className="border-b border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">키</div>
              <div className="font-medium text-gray-800">{profile?.height || '정보없음'}</div>
            </div>
            <div className="border-b border-r border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">체형</div>
              <div className="font-medium text-gray-800">{profile?.bodyType || '정보없음'}</div>
            </div>
            <div className="border-b border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">스타일</div>
              <div className="font-medium text-gray-800">{profile?.style || '정보없음'}</div>
            </div>
            <div className="border-b border-r border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">종교</div>
              <div className="font-medium text-gray-800">{profile?.religion || '정보없음'}</div>
            </div>
            <div className="border-b border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">MBTI</div>
              <div className="font-medium text-gray-800">{profile?.mbti || '정보없음'}</div>
            </div>
            <div className="border-r border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">흡연</div>
              <div className="font-medium text-gray-800">{profile?.smoking || '정보없음'}</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-1">음주</div>
              <div className="font-medium text-gray-800">{profile?.drinking || '정보없음'}</div>
            </div>
          </div>
        </div>

        {/* MBTI 궁합 버튼 */}
        <button className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <i className="ri-heart-line text-white"></i>
            </div>
            <span className="font-semibold text-gray-800">MBTI 궁합 보기</span>
          </div>
          <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
        </button>

        {/* 관심사 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <i className="ri-heart-3-line mr-2 text-cyan-500"></i>
            관심사
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="bg-cyan-50 text-cyan-600 px-4 py-2 rounded-full text-sm font-medium">음악</span>
            <span className="bg-cyan-50 text-cyan-600 px-4 py-2 rounded-full text-sm font-medium">영화</span>
            <span className="bg-cyan-50 text-cyan-600 px-4 py-2 rounded-full text-sm font-medium">카페</span>
            <span className="bg-cyan-50 text-cyan-600 px-4 py-2 rounded-full text-sm font-medium">독서</span>
          </div>
        </div>

        {/* 자기소개 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <i className="ri-chat-quote-line mr-2 text-cyan-500"></i>
            자기소개
          </h3>
          <p className="text-gray-700 leading-relaxed">{profile?.bio || '자기소개가 없습니다.'}</p>
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-cyan-50 px-8 py-6 flex justify-center space-x-8">
        <button 
          onClick={handleLike}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-cyan-200"
        >
          <i className="ri-heart-fill text-cyan-400 text-2xl"></i>
        </button>
        <button 
          onClick={handlePass}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-gray-200"
        >
          <i className="ri-close-line text-gray-400 text-2xl"></i>
        </button>
      </div>

      {/* 좋아요 토스트 */}
      {showLikeToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-2xl z-50">
          <div className="flex items-center space-x-2">
            <i className="ri-heart-fill text-pink-400"></i>
            <span>{profile.name}님에게 좋아요를 보냈어요!</span>
          </div>
        </div>
      )}

      {/* 매칭 성공 모달 */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-heart-fill text-white text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">매칭 성공! 🎉</h3>
            <p className="text-gray-600 mb-6">
              {profile.name}님과 서로 좋아요를 눌렀어요!<br />
              지금 바로 대화를 시작해보세요.
            </p>
            <div className="space-y-3">
              <button
                onClick={startChatWithMatch}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-full font-medium hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap"
              >
                대화 시작하기
              </button>
              <button
                onClick={() => setShowMatchModal(false)}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
