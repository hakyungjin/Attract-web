import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender?: string) => {
  if (gender === '남자') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

export default function ProfileTab() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '사용자',
    age: 0,
    gender: '여자',
    location: '위치 미설정',
    avatar: '',
    bio: '',
    interests: []
  });
  const [matchingStats, setMatchingStats] = useState({
    received: 0,
    sent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // 현재 사용자 정보 로드
  useEffect(() => {
    const loadUserProfile = () => {
      try {
        // 로컬 스토리지에서 사용자 정보 가져오기
        const localUser = localStorage.getItem('user');
        if (localUser) {
          const userData = JSON.parse(localUser);
          setProfile({
            name: userData.name || '사용자',
            age: userData.age || 0,
            gender: userData.gender || '여자',
            location: userData.location || '위치 미설정',
            avatar: userData.avatar_url || '',
            bio: userData.bio || '',
            interests: userData.interests || []
          });
          console.log('프로필 로드 완료:', userData);
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-sm font-medium text-slate-500">프로필 로드 중...</div>
      </div>
    );
  }

  const handleEditProfile = () => {
    navigate('/profile-edit');
  };

  const handleMatchingRequests = () => {
    navigate('/matching-requests');
  };

  return (
    <div className="px-4 py-6 pb-20 min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-[2rem] shadow-lg shadow-primary-500/5 p-8 animate-slide-up relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary-100 to-secondary-100 opacity-50"></div>
          <div className="relative text-center">
            {/* 프로필 사진 */}
            <div className="relative inline-block mb-4">
              <div className="p-1 bg-white rounded-full shadow-lg">
                <img
                  src={profile.avatar || getDefaultAvatar(profile.gender)}
                  alt={profile.name}
                  className="w-28 h-28 rounded-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getDefaultAvatar(profile.gender);
                  }}
                />
              </div>
              <button className="absolute bottom-2 right-2 w-9 h-9 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-colors cursor-pointer hover:scale-110 transform duration-300 border-2 border-white">
                <i className="ri-camera-line text-lg"></i>
              </button>
            </div>

            {/* 기본 정보 */}
            <h2 className="text-2xl font-bold text-slate-800 mb-1 font-display">{profile.name}</h2>
            <p className="text-slate-500 mb-6 font-medium">{profile.age}세 · {profile.location}</p>

            {/* 프로필 수정 버튼 */}
            <button
              onClick={handleEditProfile}
              className="w-full bg-slate-800 text-white py-3.5 rounded-2xl font-bold hover:bg-black transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-slate-200 hover:shadow-xl transform hover:-translate-y-0.5"
            >
              프로필 수정하기
            </button>
          </div>
        </div>

        {/* 매칭 관리 카드 */}
        <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-[2rem] shadow-xl shadow-primary-500/20 p-6 animate-slide-up text-white relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-10 -mb-10"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center font-display">
                <i className="ri-heart-fill text-pink-300 mr-2 text-xl animate-pulse-soft"></i>
                매칭 현황
              </h3>
              <button
                onClick={handleMatchingRequests}
                className="text-white/80 text-sm font-medium hover:text-white cursor-pointer whitespace-nowrap bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                전체보기
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-colors">
                <div className="text-3xl font-bold mb-1 font-display">{matchingStats.received}</div>
                <div className="text-xs text-white/80 font-medium">받은 요청</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 hover:bg-white/20 transition-colors">
                <div className="text-3xl font-bold mb-1 font-display">{matchingStats.sent}</div>
                <div className="text-xs text-white/80 font-medium">보낸 요청</div>
              </div>
            </div>

            <button
              onClick={handleMatchingRequests}
              className="w-full bg-white text-primary-600 py-3.5 rounded-2xl font-bold hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center shadow-lg"
            >
              <i className="ri-heart-line mr-2 text-lg"></i>
              매칭 관리하기
            </button>
          </div>
        </div>

        {/* 자기소개 */}
        <div className="bg-white rounded-[2rem] shadow-lg shadow-primary-500/5 p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center font-display">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mr-3 text-primary-500">
              <i className="ri-user-smile-line text-lg"></i>
            </div>
            자기소개
          </h3>
          <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl text-sm">{profile.bio}</p>
        </div>

        {/* 관심사 */}
        <div className="bg-white rounded-[2rem] shadow-lg shadow-primary-500/5 p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center font-display">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center mr-3 text-pink-500">
              <i className="ri-heart-line text-lg"></i>
            </div>
            관심사
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-white border border-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md hover:border-primary-200 hover:text-primary-600 transition-all cursor-default"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* 메뉴 */}
        <div className="bg-white rounded-[2rem] shadow-lg shadow-primary-500/5 p-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <i className="ri-settings-3-line text-blue-500 text-xl"></i>
                </div>
                <span className="font-bold text-slate-700 group-hover:text-slate-900">설정</span>
              </div>
              <i className="ri-arrow-right-s-line text-slate-300 group-hover:text-slate-500 text-xl transition-colors"></i>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <i className="ri-shield-check-line text-green-500 text-xl"></i>
                </div>
                <span className="font-bold text-slate-700 group-hover:text-slate-900">개인정보 보호</span>
              </div>
              <i className="ri-arrow-right-s-line text-slate-300 group-hover:text-slate-500 text-xl transition-colors"></i>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <i className="ri-question-line text-purple-500 text-xl"></i>
                </div>
                <span className="font-bold text-slate-700 group-hover:text-slate-900">고객센터</span>
              </div>
              <i className="ri-arrow-right-s-line text-slate-300 group-hover:text-slate-500 text-xl transition-colors"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
