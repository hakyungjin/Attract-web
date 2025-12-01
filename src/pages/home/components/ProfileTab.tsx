import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender?: string) => {
  if (gender === '남자' || gender === 'male') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

export default function ProfileTab() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
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
    loadUserProfile();
    loadMatchingStats();
  }, [authUser?.id]);

  const loadUserProfile = async () => {
    try {
      if (!authUser?.id) {
        setIsLoading(false);
        return;
      }

      // Supabase에서 최신 사용자 데이터 로드
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('프로필 로드 실패:', error);
        setIsLoading(false);
        return;
      }

      if (userData) {
        setProfile({
          name: userData.name || '사용자',
          age: userData.age || 0,
          gender: userData.gender === 'male' ? '남자' : '여자',
          location: userData.location || '위치 미설정',
          avatar: userData.avatar_url || userData.profile_image || '',
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

  const loadMatchingStats = async () => {
    try {
      if (!authUser?.id) return;

      // 받은 매칭 요청 개수
      const { count: receivedCount } = await supabase
        .from('matching_requests')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', authUser.id)
        .eq('status', 'pending');

      // 보낸 매칭 요청 개수
      const { count: sentCount } = await supabase
        .from('matching_requests')
        .select('*', { count: 'exact', head: true })
        .eq('from_user_id', authUser.id)
        .eq('status', 'pending');

      setMatchingStats({
        received: receivedCount || 0,
        sent: sentCount || 0
      });
    } catch (error) {
      console.error('매칭 통계 로드 실패:', error);
    }
  };

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
              <button onClick={handleEditProfile} className="absolute bottom-2 right-2 w-9 h-9 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-colors cursor-pointer hover:scale-110 transform duration-300 border-2 border-white">
                <i className="ri-camera-line text-lg"></i>
              </button>
            </div>

            {/* 기본 정보 */}
            <h2 className="text-2xl font-bold text-slate-800 mb-1 font-display">{profile.name}</h2>
            <p className="text-slate-500 mb-4 font-medium">{profile.age}세 · {profile.location}</p>

            {/* 버튼 그룹 */}
            <div className="space-y-2">
              <button
                onClick={handleEditProfile}
                className="w-full bg-slate-800 text-white py-3 rounded-2xl font-bold hover:bg-black transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-slate-200 hover:shadow-xl transform hover:-translate-y-0.5"
              >
                프로필 수정하기
              </button>
              <button
                onClick={() => navigate('/profile-detail', { state: { profile: { 
                  id: authUser?.id,
                  name: profile.name,
                  age: profile.age,
                  gender: profile.gender === '남자' ? 'male' : 'female',
                  location: profile.location,
                  bio: profile.bio,
                  interests: profile.interests,
                  photos: profile.avatar ? [profile.avatar] : []
                }}})}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-2xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-eye-line"></i>
                내 프로필 미리보기
              </button>
            </div>
          </div>
        </div>

        {/* 매칭 현황 카드 - 새로운 UI */}
        <div className="bg-white rounded-[2rem] shadow-lg shadow-primary-500/5 p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg text-slate-800 font-display">매칭 현황</h3>
            <button
              onClick={handleMatchingRequests}
              className="text-primary-500 text-sm font-medium hover:text-primary-600 cursor-pointer"
            >
              전체보기
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 받은 요청 */}
            <div 
              onClick={handleMatchingRequests}
              className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <i className="ri-heart-fill text-pink-500 text-xl"></i>
                </div>
                <span className="text-2xl font-bold text-pink-600">{matchingStats.received}</span>
              </div>
              <div className="text-sm font-bold text-pink-700">받은 요청</div>
              <div className="text-xs text-pink-500 mt-0.5">새로운 관심 표시</div>
            </div>

            {/* 보낸 요청 */}
            <div 
              onClick={handleMatchingRequests}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <i className="ri-send-plane-fill text-blue-500 text-xl"></i>
                </div>
                <span className="text-2xl font-bold text-blue-600">{matchingStats.sent}</span>
              </div>
              <div className="text-sm font-bold text-blue-700">보낸 요청</div>
              <div className="text-xs text-blue-500 mt-0.5">대기 중인 요청</div>
            </div>
          </div>
        </div>

        {/* 광고 배너 1 */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 animate-slide-up cursor-pointer hover:shadow-md transition-all" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <i className="ri-advertisement-line text-2xl text-amber-500"></i>
              </div>
              <div>
                <p className="font-bold text-amber-800">광고 영역 1</p>
                <p className="text-xs text-amber-600">여기에 광고가 표시됩니다</p>
              </div>
            </div>
            <i className="ri-arrow-right-s-line text-amber-400 text-xl"></i>
          </div>
        </div>

        {/* 광고 배너 2 */}
        <div className="bg-gradient-to-r from-violet-100 to-purple-100 rounded-2xl p-4 animate-slide-up cursor-pointer hover:shadow-md transition-all" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <i className="ri-gift-line text-2xl text-violet-500"></i>
              </div>
              <div>
                <p className="font-bold text-violet-800">광고 영역 2</p>
                <p className="text-xs text-violet-600">여기에 광고가 표시됩니다</p>
              </div>
            </div>
            <i className="ri-arrow-right-s-line text-violet-400 text-xl"></i>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="bg-white rounded-[2rem] shadow-lg shadow-primary-500/5 p-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="space-y-1">
            <button onClick={() => navigate('/settings')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <i className="ri-settings-3-line text-blue-500 text-xl"></i>
                </div>
                <span className="font-bold text-slate-700 group-hover:text-slate-900">설정</span>
              </div>
              <i className="ri-arrow-right-s-line text-slate-300 group-hover:text-slate-500 text-xl transition-colors"></i>
            </button>

            <button onClick={() => alert('개인정보 보호 정책 페이지 준비중입니다.')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <i className="ri-shield-check-line text-green-500 text-xl"></i>
                </div>
                <span className="font-bold text-slate-700 group-hover:text-slate-900">개인정보 보호</span>
              </div>
              <i className="ri-arrow-right-s-line text-slate-300 group-hover:text-slate-500 text-xl transition-colors"></i>
            </button>

            <button onClick={() => navigate('/support')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
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
