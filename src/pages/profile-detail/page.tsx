import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { sendMatchRequestPush, sendMatchSuccessPush } from '../../services/fcmService';
import { analyzeMBTICompatibility, getCompatibilityColor, getCompatibilityEmoji, type MBTICompatibility } from '../../services/mbtiCompatibility';
import { getDefaultAvatar } from '../../utils/avatarUtils';
import { logger } from '../../utils/logger';

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
  hasLikedMe?: boolean;
  isMatched?: boolean;
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

export default function ProfileDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const profile = (location.state?.profile || location.state?.authorData) as Profile;

  const [showLikeToast, setShowLikeToast] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCoinConfirmModal, setShowCoinConfirmModal] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showMBTIModal, setShowMBTIModal] = useState(false);
  const [myMBTI, setMyMBTI] = useState<string | null>(null);
  const [compatibility, setCompatibility] = useState<MBTICompatibility | null>(null);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const MATCH_COST = 50;

  const getCurrentUserId = () => {
    const localUser = localStorage.getItem('user');
    if (!localUser) return null;
    try {
      const userData = JSON.parse(localUser);
      return userData.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const isOwnProfile = currentUserId && profile?.id === currentUserId;

  useEffect(() => {
    if (!authUser && !currentUserId) {
      setShowLoginModal(true);
    }
  }, [authUser, currentUserId]);

  useEffect(() => {
    const loadUserCoins = async () => {
      if (!authUser?.id) return;
      const { data } = await supabase
        .from('users')
        .select('coins, mbti')
        .eq('id', authUser.id)
        .single();
      if (data) {
        setUserCoins(data.coins || 0);
        setMyMBTI(data.mbti || null);
      }
    };
    loadUserCoins();
  }, [authUser?.id]);

  // profile_image와 photos 배열을 모두 합쳐서 사진 목록 생성
  const profilePhotos = (() => {
    const allPhotos: string[] = [];
    
    // profile_image가 있으면 첫 번째로 추가
    if (profile?.profile_image) {
      allPhotos.push(profile.profile_image);
    }
    
    // photos 배열이 있으면 추가 (중복 제거)
    if (profile?.photos && Array.isArray(profile.photos)) {
      profile.photos.forEach(photo => {
        if (photo && !allPhotos.includes(photo)) {
          allPhotos.push(photo);
        }
      });
    }
    
    // 사진이 하나도 없으면 기본 아바타 사용
    if (allPhotos.length === 0) {
      return [getDefaultAvatar(profile?.gender || '')];
    }
    
    return allPhotos;
  })();

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

  // DB 필드명(snake_case)과 인터페이스 필드명(camelCase) 모두 체크
  const profileInfo = {
    school: profile?.school || '',
    height: profile?.height || '',
    bodyType: profile?.bodyType || (profile as any)?.body_type || '',
    style: profile?.style || '',
    religion: profile?.religion || '',
    mbti: profile?.mbti || '',
    smoking: profile?.smoking || '',
    drinking: profile?.drinking || ''
  };

  const interests = profile?.interests || [];

  const handleLikeClick = () => {
    if (!authUser?.id || !profile?.id) {
      setShowLoginModal(true);
      return;
    }
    setShowCoinConfirmModal(true);
  };

  const handleLike = async () => {
    setShowCoinConfirmModal(false);
    setIsLikeAnimating(true);

    try {
      if (!authUser?.id || !profile?.id) {
        setShowLoginModal(true);
        return;
      }

      if (userCoins < MATCH_COST) {
        alert(`자석이 부족합니다. 현재 ${userCoins}개 보유 중`);
        navigate('/coin-shop');
        return;
      }

      const fromUserId = String(authUser.id);
      const toUserId = String(profile.id);

      logger.info('매칭 요청 정보', { fromUserId, toUserId });

      const { data: reverseRequest } = await supabase
        .from('matching_requests')
        .select('id')
        .eq('from_user_id', toUserId)
        .eq('to_user_id', fromUserId)
        .eq('status', 'pending')
        .limit(1);

      const isMutualMatch = reverseRequest && reverseRequest.length > 0;

      const { data: myRequest } = await supabase
        .from('matching_requests')
        .select('id')
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', toUserId)
        .limit(1);

      if (myRequest && myRequest.length > 0) {
        alert('이미 매칭 요청을 보낸 상대입니다');
        setIsLikeAnimating(false);
        return;
      }

      const { error: coinError } = await supabase
        .from('users')
        .update({ coins: userCoins - MATCH_COST })
        .eq('id', authUser.id);

      if (coinError) {
        logger.error('코인 차감 실패', coinError);
        alert('자석 차감에 실패했습니다.');
        setIsLikeAnimating(false);
        return;
      }

      setUserCoins(prev => prev - MATCH_COST);

      const { error } = await supabase
        .from('matching_requests')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          status: isMutualMatch ? 'accepted' : 'pending'
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          alert('이미 매칭 요청을 보낸 상대입니다');
          setIsLikeAnimating(false);
          return;
        }
        throw error;
      }

      if (isMutualMatch) {
        await supabase
          .from('matching_requests')
          .update({ status: 'accepted' })
          .eq('from_user_id', toUserId)
          .eq('to_user_id', fromUserId);

        const { data: chatRoom, error: chatError } = await supabase
          .from('chat_rooms')
          .insert({
            user1_id: fromUserId,
            user2_id: toUserId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (chatError) {
          logger.error('채팅방 생성 실패', chatError);
        }

        await supabase.from('notifications').insert([
          {
            user_id: toUserId,
            type: 'match_success',
            title: '매칭 성사! 💕',
            message: `${authUser.name || '누군가'}님과 매칭되었습니다!`,
            data: { matched_user_id: fromUserId, chat_room_id: chatRoom?.id },
            read: false
          },
          {
            user_id: fromUserId,
            type: 'match_success',
            title: '매칭 성사! 💕',
            message: `${profile.name}님과 매칭되었습니다!`,
            data: { matched_user_id: toUserId, chat_room_id: chatRoom?.id },
            read: false
          }
        ]);

        await sendMatchSuccessPush(toUserId, authUser.name || '누군가', chatRoom?.id);
        setIsLikeAnimating(false);
        setShowMatchModal(true);
      } else {
        await supabase.from('notifications').insert({
          user_id: toUserId,
          type: 'match_request',
          title: '새로운 매칭 요청',
          message: `${authUser.name || '누군가'}님이 매칭을 요청했습니다`,
          data: { from_user_id: fromUserId, from_user_name: authUser.name },
          read: false
        });

        await sendMatchRequestPush(toUserId, authUser.name || '누군가', fromUserId);
        setIsLikeAnimating(false);
        setShowLikeToast(true);
        setTimeout(() => {
          setShowLikeToast(false);
          navigate(-1);
        }, 2000);
      }
    } catch (error: any) {
      logger.error('매칭 요청 실패', error);
      alert('매칭 요청에 실패했습니다: ' + (error?.message || '알 수 없는 오류'));
      setIsLikeAnimating(false);
    }
  };

  const handlePass = () => {
    navigate(-1);
  };

  const startChatWithMatch = () => {
    setShowMatchModal(false);
    const event = new CustomEvent('openChat', {
      detail: {
        userId: profile.id,
        userName: profile.name,
        userAvatar: profilePhotos[0] || ''
      }
    });
    window.dispatchEvent(event);
    navigate('/');
  };

  const handleMBTICompatibility = () => {
    if (!myMBTI) {
      alert('내 MBTI 정보가 없습니다. 프로필을 업데이트해주세요.');
      return;
    }

    if (!profile?.mbti) {
      alert('상대방의 MBTI 정보가 없습니다.');
      return;
    }

    const result = analyzeMBTICompatibility(myMBTI, profile.mbti);
    setCompatibility(result);
    setShowMBTIModal(true);
  };

  // 성별에 따른 테마 색상
  const isFemale = profile?.gender === 'female' || profile?.gender === '여자';
  const themeGradient = isFemale 
    ? 'from-rose-500 via-pink-500 to-fuchsia-500' 
    : 'from-cyan-500 via-blue-500 to-indigo-500';
  const themeColor = isFemale ? 'rose' : 'cyan';

  return (
    <div className={`bg-cyan-50 pb-20 ${showLoginModal ? 'overflow-hidden' : ''}`}>
      {/* 프로필 컨텐츠 - 로그인 모달이 떠있으면 blur 처리 */}
    <div className={`min-h-screen bg-slate-50 ${showLoginModal ? 'overflow-hidden' : ''}`}>
      <div className={`${showLoginModal ? 'blur-sm pointer-events-none' : ''}`}>
        
        {/* 사진 영역 - 전체화면 스타일 */}
        <div className="relative">
          {/* 뒤로가기 & 메뉴 버튼 (사진 위) */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
            <button
              onClick={handleBack}
              className="w-11 h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition-all cursor-pointer"
            >
              <i className="ri-arrow-left-s-line text-white text-2xl"></i>
            </button>
            <button 
              onClick={() => {
                const choice = window.confirm('이 사용자를 신고하시겠습니까?');
                if (choice) alert('신고 기능 준비중입니다.');
              }}
              className="w-11 h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/50 transition-all cursor-pointer"
            >
              <i className="ri-more-2-fill text-white text-xl"></i>
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
                  <div className="flex items-center space-x-3 text-white/90">
                    {profile.location && (
                      <span className="flex items-center text-sm">
                        <i className="ri-map-pin-line mr-1"></i>
                        {profile.location}
                      </span>
                    )}
                    {profileInfo.school !== '비공개' && (
                      <span className="flex items-center text-sm">
                        <i className="ri-graduation-cap-line mr-1"></i>
                        {profileInfo.school}
                      </span>
                    )}
                  </div>
                </div>

                {/* MBTI 뱃지 */}
                {profileInfo.mbti !== '비공개' && (
                  <button
                    onClick={handleMBTICompatibility}
                    className={`bg-gradient-to-r ${themeGradient} px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <span className="text-white font-bold text-sm">{profileInfo.mbti}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 프로필 정보 영역 */}
        <div className="px-4 py-6 space-y-4 pb-36">
          
          {/* 자기소개 (가장 먼저, 가장 크게) */}
          {profile?.bio && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
                "{profile.bio}"
              </p>
            </div>
          )}

          {/* MBTI 궁합 카드 */}
          <button
            onClick={handleMBTICompatibility}
            className={`w-full bg-gradient-to-r ${themeGradient} rounded-3xl p-5 shadow-xl flex items-center justify-between hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-3xl">💕</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-white text-lg block">우리의 궁합은?</span>
                <span className="text-white/80 text-sm">
                  {myMBTI || '?'} × {profile?.mbti || '?'} 궁합 확인하기
                </span>
              </div>
            </div>
            <i className="ri-arrow-right-s-line text-3xl text-white/80 group-hover:translate-x-1 transition-transform"></i>
          </button>

          {/* 관심사 */}
          {interests.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center text-lg">
                <i className={`ri-heart-3-line mr-2 text-${themeColor}-500`}></i>
                관심사
              </h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <span 
                    key={index} 
                    className={`bg-${themeColor}-50 text-${themeColor}-600 px-4 py-2.5 rounded-full text-sm font-medium border border-${themeColor}-100`}
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
                  <span className={`font-semibold ${!item.value ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.value || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        {!isOwnProfile && (
          <div 
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent px-6 py-4 flex justify-center items-center space-x-6"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          >
            {/* 패스 버튼 */}
            <button
              onClick={handlePass}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer border-2 border-slate-200 group"
            >
              <i className="ri-close-line text-slate-400 text-3xl group-hover:text-slate-600 transition-colors"></i>
            </button>

            {/* 하트 버튼 */}
            <button
              onClick={handleLikeClick}
              disabled={isLikeAnimating}
              className={`w-20 h-20 bg-gradient-to-r ${themeGradient} rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all cursor-pointer disabled:opacity-70 ${
                isLikeAnimating ? 'animate-pulse scale-110' : ''
              }`}
            >
              <i className={`ri-heart-fill text-white text-4xl ${isLikeAnimating ? 'animate-bounce' : ''}`}></i>
            </button>

            {/* MBTI 궁합 버튼 */}
            <button
              onClick={handleMBTICompatibility}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer border-2 border-purple-200 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">💜</span>
            </button>
          </div>
        )}
      </div>

      {/* 좋아요 토스트 */}
      {showLikeToast && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className={`bg-gradient-to-r ${themeGradient} text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center space-x-3 animate-bounce`}>
            <i className="ri-heart-fill text-2xl"></i>
            <span className="font-bold text-lg">{profile.name}님에게 하트를 보냈어요!</span>
          </div>
        </div>
      )}

      {/* 코인 확인 모달 */}
      {showCoinConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-scale-in">
            <div className={`w-20 h-20 bg-gradient-to-r ${themeGradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl`}>
              <i className="ri-heart-fill text-white text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">하트를 보낼까요?</h3>
            <p className="text-slate-600 mb-2">
              <span className="font-bold">{profile.name}</span>님에게<br />
              마음을 전하려면 자석 <span className={`font-bold text-${themeColor}-500`}>{MATCH_COST}개</span>가 필요해요
            </p>
            <div className={`bg-${themeColor}-50 rounded-2xl p-4 mb-4`}>
              <p className={`text-sm text-${themeColor}-700 flex items-center justify-center`}>
                <i className="ri-refresh-line mr-2"></i>
                거절 시 자석이 환불됩니다
              </p>
            </div>
            <p className="text-slate-500 mb-6">
              내 자석: <span className="font-bold text-slate-800">{userCoins}개</span>
            </p>
            <div className="space-y-3">
              <button
                onClick={handleLike}
                disabled={userCoins < MATCH_COST}
                className={`w-full bg-gradient-to-r ${themeGradient} text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
              >
                {userCoins < MATCH_COST ? '자석이 부족해요' : '💕 하트 보내기'}
              </button>
              <button
                onClick={() => setShowCoinConfirmModal(false)}
                className="w-full text-slate-500 py-3 font-medium hover:text-slate-700 transition-colors cursor-pointer"
              >
                다음에 할게요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 매칭 성공 모달 */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-scale-in">
            {/* 양쪽 프로필 사진 */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <img 
                  src={profilePhotos[0]} 
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                />
              </div>
              <div className={`w-16 h-16 bg-gradient-to-r ${themeGradient} rounded-full flex items-center justify-center -mx-4 z-10 shadow-xl`}>
                <span className="text-3xl">💕</span>
              </div>
              <div className="relative">
                <img 
                  src={(authUser as any)?.profile_image || getDefaultAvatar('')} 
                  alt="나"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">매칭 성공! 🎉</h3>
            <p className="text-slate-600 mb-6">
              {profile.name}님과 서로 마음이 통했어요!<br />
              지금 바로 대화를 시작해보세요
            </p>
            <div className="space-y-3">
              <button
                onClick={startChatWithMatch}
                className={`w-full bg-gradient-to-r ${themeGradient} text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all cursor-pointer shadow-lg`}
              >
                💬 대화 시작하기
              </button>
              <button
                onClick={() => setShowMatchModal(false)}
                className="w-full text-slate-500 py-3 font-medium hover:text-slate-700 transition-colors cursor-pointer"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-scale-in">
            <div className={`w-20 h-20 bg-gradient-to-r ${themeGradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <i className="ri-lock-line text-white text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">로그인이 필요해요</h3>
            <p className="text-slate-600 mb-6">
              프로필을 확인하고<br />
              매칭을 시작하려면 로그인해주세요
            </p>
            <button
              onClick={() => navigate('/login')}
              className={`w-full bg-gradient-to-r ${themeGradient} text-white py-4 rounded-full font-bold hover:opacity-90 transition-all shadow-lg cursor-pointer`}
            >
              로그인하기
            </button>
          </div>
        </div>
      )}

      {/* MBTI 궁합 모달 */}
      {showMBTIModal && compatibility && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto animate-scale-in relative">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowMBTIModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <i className="ri-close-line text-xl text-slate-600"></i>
            </button>
            
            <div className="text-center mb-6 pt-2">
              <div className="text-6xl mb-4">{getCompatibilityEmoji(compatibility.level)}</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{compatibility.title}</h3>
              <div className="flex items-center justify-center gap-3">
                <span className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-bold">{myMBTI}</span>
                <span className="text-2xl">×</span>
                <span className="bg-pink-100 text-pink-600 px-4 py-2 rounded-full font-bold">{profile?.mbti}</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 font-medium">궁합 점수</span>
                <span className="text-3xl font-bold" style={{ color: getCompatibilityColor(compatibility.level) }}>
                  {compatibility.score}점
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-1000"
                  style={{
                    width: `${compatibility.score}%`,
                    backgroundColor: getCompatibilityColor(compatibility.level)
                  }}
                ></div>
              </div>
            </div>

            <p className="text-slate-600 mb-5 bg-slate-50 p-4 rounded-2xl leading-relaxed">
              {compatibility.description}
            </p>

            <div className="mb-5">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center text-lg">
                <span className="text-green-500 mr-2">💚</span> 이런 점이 좋아요
              </h4>
              <ul className="space-y-2">
                {compatibility.strengths.slice(0, 3).map((strength, index) => (
                  <li key={index} className="text-slate-600 flex items-start bg-green-50 p-3 rounded-xl">
                    <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-5">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center text-lg">
                <span className="text-amber-500 mr-2">💛</span> 주의할 점
              </h4>
              <ul className="space-y-2">
                {compatibility.challenges.slice(0, 2).map((challenge, index) => (
                  <li key={index} className="text-slate-600 flex items-start bg-amber-50 p-3 rounded-xl">
                    <i className="ri-alert-line text-amber-500 mr-2 mt-0.5"></i>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-5">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                <span className="mr-2">💡</span> 연애 꿀팁
              </h4>
              <p className="text-slate-700">{compatibility.advice}</p>
            </div>

            <button
              onClick={() => setShowMBTIModal(false)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all cursor-pointer shadow-lg"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
