import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebase } from '../../lib/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultAvatar } from '../../utils/avatarUtils';

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
  profile_image?: string;
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
        const localUser = localStorage.getItem('auth_user');
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

        const { user: data, error } = await firebase.users.getUserById(userId);

        if (error || !data) {
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
            photos: data.photos || [],
            profile_image: data.profile_image || '',
            interests: data.interests || [],
            height: data.height || '',
            bodyType: data.body_type || '',
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

  // 프로필 사진 배열 생성 (profile_image + photos 합치기)
  const profilePhotos = (() => {
    const allPhotos: string[] = [];
    
    if (profile?.profile_image) {
      allPhotos.push(profile.profile_image);
    }
    
    if (profile?.photos && Array.isArray(profile.photos)) {
      profile.photos.forEach(photo => {
        if (photo && !allPhotos.includes(photo)) {
          allPhotos.push(photo);
        }
      });
    }
    
    if (allPhotos.length === 0) {
      return [getDefaultAvatar(profile?.gender || '')];
    }
    
    return allPhotos;
  })();

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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

  // 테마 색상 (cyan 계열)
  const themeGradient = 'from-cyan-400 to-blue-500';
  const themeColor = 'cyan';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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

  const profileInfo = {
    height: profile.height || '-',
    bodyType: profile.bodyType || '-',
    style: profile.style || '-',
    religion: profile.religion || '-',
    smoking: profile.smoking || '-',
    drinking: profile.drinking || '-'
  };

  const interests = profile.interests || [];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 사진 영역 - ProfileDetailPage와 동일 */}
      <div className="relative">
        {/* 뒤로가기 & 수정 버튼 (사진 위) */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
          <button
            onClick={handleBack}
            className="w-11 h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition-all cursor-pointer"
          >
            <i className="ri-arrow-left-s-line text-white text-2xl"></i>
          </button>
          <button 
            onClick={handleEditProfile}
            className="w-11 h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition-all cursor-pointer"
          >
            <i className="ri-edit-line text-white text-xl"></i>
          </button>
        </div>

        {/* 프로필 사진 */}
        <div className="relative w-full aspect-[3/4] max-h-[70vh] bg-slate-200 overflow-hidden">
          <img
            src={profilePhotos[currentPhotoIndex]}
            alt={`${profile.name}`}
            className="w-full h-full object-cover"
          />

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* 좌우 화살표 버튼 */}
          <button
            onClick={handlePrevPhoto}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg z-10"
          >
            <i className="ri-arrow-left-s-line text-white text-2xl"></i>
          </button>
          <button
            onClick={handleNextPhoto}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg z-10"
          >
            <i className="ri-arrow-right-s-line text-white text-2xl"></i>
          </button>

          {/* 사진 인디케이터 (하단 점) */}
          {profilePhotos.length > 1 && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {profilePhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(index); }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer shadow-sm ${
                    index === currentPhotoIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}

          {/* 이름, 나이, 위치 (사진 하단) */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
                  {profile.name}, {profile.age || '??'}
                </h1>
                <p className="text-white/90 flex items-center drop-shadow-md">
                  <i className="ri-map-pin-line mr-1"></i>
                  {profile.location || '위치 미설정'}
                </p>
              </div>
              {/* MBTI 배지 */}
              {profile.mbti && (
                <div className={`bg-gradient-to-r ${themeGradient} px-4 py-2 rounded-full shadow-lg`}>
                  <span className="text-white font-bold">{profile.mbti}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 프로필 콘텐츠 */}
      <div className="px-4 py-6 space-y-4 pb-8">
        {/* 안내 배너 */}
        <div className={`bg-gradient-to-r ${themeGradient} rounded-2xl px-4 py-3`}>
          <div className="flex items-center justify-center space-x-2 text-white">
            <i className="ri-eye-line"></i>
            <span className="text-sm font-medium">다른 사람에게 보이는 내 프로필입니다</span>
          </div>
        </div>

        {/* 자기소개 */}
        {profile.bio && (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center">
              <i className="ri-chat-quote-line mr-2 text-cyan-500"></i>
              자기소개
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* 관심사 */}
        {interests.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <i className={`ri-heart-3-line mr-2 text-${themeColor}-500`}></i>
              관심사
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span 
                  key={index} 
                  className={`bg-${themeColor}-50 text-${themeColor}-600 px-4 py-2 rounded-full text-sm font-medium`}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 상세 정보 */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-2">
            {[
              { icon: 'ri-ruler-line', label: '키', value: profileInfo.height },
              { icon: 'ri-body-scan-line', label: '체형', value: profileInfo.bodyType },
              { icon: 'ri-t-shirt-line', label: '스타일', value: profileInfo.style },
              { icon: 'ri-moon-line', label: '종교', value: profileInfo.religion },
              { icon: 'ri-fire-line', label: '흡연', value: profileInfo.smoking },
              { icon: 'ri-goblet-line', label: '음주', value: profileInfo.drinking },
            ].map((item, index) => (
              <div 
                key={index}
                className={`p-4 ${index % 2 === 0 ? 'border-r border-slate-100' : ''} ${index < 4 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <i className={`${item.icon} text-slate-400`}></i>
                  <span className="text-xs text-slate-400">{item.label}</span>
                </div>
                <span className={`font-semibold ${!item.value || item.value === '-' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {item.value || '-'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 프로필 수정 버튼 */}
        <button
          onClick={handleEditProfile}
          className={`w-full bg-gradient-to-r ${themeGradient} text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2`}
        >
          <i className="ri-edit-line"></i>
          <span>프로필 수정하기</span>
        </button>
      </div>
    </div>
  );
}
