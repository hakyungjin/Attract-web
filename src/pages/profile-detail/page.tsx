import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { sendMatchRequestPush, sendMatchSuccessPush } from '../../services/fcmService';
import { analyzeMBTICompatibility, getCompatibilityColor, getCompatibilityEmoji, type MBTICompatibility } from '../../services/mbtiCompatibility';

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

  // profile 또는 authorData를 받음
  const profile = (location.state?.profile || location.state?.authorData) as Profile;

  const [userRating, setUserRating] = useState(0);
  const [showLikeToast, setShowLikeToast] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showMBTIModal, setShowMBTIModal] = useState(false);
  const [myMBTI, setMyMBTI] = useState<string | null>(null);
  const [compatibility, setCompatibility] = useState<MBTICompatibility | null>(null);

  // 현재 로그인한 사용자 확인
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

  // 로그인한 사용자의 MBTI 가져오기
  useEffect(() => {
    const loadMyMBTI = async () => {
      if (!authUser?.id) return;

      const { data } = await supabase
        .from('users')
        .select('mbti')
        .eq('id', authUser.id)
        .single();

      if (data?.mbti) {
        setMyMBTI(data.mbti);
      }
    };

    loadMyMBTI();
  }, [authUser?.id]);

  // 기본 프로필 이미지
  const getDefaultAvatar = (gender: string) => {
    if (gender === '남자' || gender === 'male') {
      return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
    }
    return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
  };

  // 프로필 사진 배열 - 사진이 없으면 기본 이미지 사용
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

  const handleLike = async () => {
    try {
      if (!authUser?.id || !profile?.id) {
        alert('로그인 후 이용해주세요');
        return;
      }

      const fromUserId = String(authUser.id);
      const toUserId = String(profile.id);

      console.log('📝 매칭 요청 정보:', { fromUserId, toUserId });

      // 상대방이 나에게 보낸 요청이 있는지 확인 (상호 매칭 체크)
      const { data: reverseRequest } = await supabase
        .from('matching_requests')
        .select('id')
        .eq('from_user_id', toUserId)
        .eq('to_user_id', fromUserId)
        .eq('status', 'pending')
        .limit(1);

      const isMutualMatch = reverseRequest && reverseRequest.length > 0;
      console.log('상호 매칭 여부:', isMutualMatch);

      // 내가 이미 보낸 요청이 있는지 확인
      const { data: myRequest } = await supabase
        .from('matching_requests')
        .select('id')
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', toUserId)
        .limit(1);

      if (myRequest && myRequest.length > 0) {
        alert('이미 매칭 요청을 보낸 상대입니다');
        return;
      }

      // matching_requests 테이블에 매칭 요청 저장
      const { data, error } = await supabase
        .from('matching_requests')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          status: isMutualMatch ? 'accepted' : 'pending'
        })
        .select();

      console.log('매칭 요청 결과:', { data, error });

      if (error) {
        if (error.code === '23505') {
          alert('이미 매칭 요청을 보낸 상대입니다');
          return;
        }
        throw error;
      }

      if (isMutualMatch) {
        // 상호 매칭 성사! 상대방 요청도 accepted로 업데이트
        await supabase
          .from('matching_requests')
          .update({ status: 'accepted' })
          .eq('from_user_id', toUserId)
          .eq('to_user_id', fromUserId);

        // 채팅방 생성
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
          console.error('채팅방 생성 실패:', chatError);
        } else {
          console.log('✅ 채팅방 생성 완료:', chatRoom);
        }

        // 양쪽에 매칭 성사 알림 (DB)
        await supabase.from('notifications').insert([
          {
            user_id: toUserId,
            type: 'match_success',
            title: '매칭 성사! 💕',
            message: `${authUser.name || '누군가'}님과 매칭되었습니다! 대화를 시작해보세요.`,
            data: { matched_user_id: fromUserId, chat_room_id: chatRoom?.id },
            read: false
          },
          {
            user_id: fromUserId,
            type: 'match_success',
            title: '매칭 성사! 💕',
            message: `${profile.name}님과 매칭되었습니다! 대화를 시작해보세요.`,
            data: { matched_user_id: toUserId, chat_room_id: chatRoom?.id },
            read: false
          }
        ]);

        // 🔔 푸시 알림 전송 (상대방에게)
        await sendMatchSuccessPush(toUserId, authUser.name || '누군가', chatRoom?.id);

        setShowMatchModal(true);
      } else {
        // 일반 매칭 요청 - 상대방에게 알림만
        await supabase.from('notifications').insert({
          user_id: toUserId,
          type: 'match_request',
          title: '새로운 매칭 요청',
          message: `${authUser.name || '누군가'}님이 매칭을 요청했습니다`,
          data: { from_user_id: fromUserId, from_user_name: authUser.name },
          read: false
        });

        // 🔔 푸시 알림 전송
        await sendMatchRequestPush(toUserId, authUser.name || '누군가', fromUserId);

        setShowLikeToast(true);
        setTimeout(() => {
          setShowLikeToast(false);
          navigate(-1);
        }, 2000);
      }
    } catch (error: any) {
      console.error('매칭 요청 실패:', error);
      alert('매칭 요청에 실패했습니다: ' + (error?.message || '알 수 없는 오류'));
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
              src={profilePhotos[0]}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover"
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
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
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

        {/* MBTI 궁합 버튼 */}
        {!isOwnProfile && myMBTI && profile?.mbti && (
          <button
            onClick={handleMBTICompatibility}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <i className="ri-heart-line text-white"></i>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">MBTI 궁합 보기</div>
                <div className="text-xs text-gray-500">{myMBTI} × {profile.mbti}</div>
              </div>
            </div>
            <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
          </button>
        )}

        {/* 관심사 */}
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

        {/* 자기소개 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <i className="ri-chat-quote-line mr-2 text-cyan-500"></i>
            자기소개
          </h3>
          <p className="text-gray-700 leading-relaxed">{profile?.bio || '자기소개가 없습니다.'}</p>
        </div>
      </div>

      {/* 하단 액션 버튼 - 자기 자신의 프로필이 아닐 때만 표시 */}
      {!isOwnProfile && (
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
      )}

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

      {/* MBTI 궁합 모달 */}
      {showMBTIModal && compatibility && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full my-8">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">MBTI 궁합 분석</h3>
              <button
                onClick={() => setShowMBTIModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>

            {/* MBTI 표시 */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-lg">{myMBTI}</span>
                </div>
                <p className="text-sm text-gray-600">나</p>
              </div>
              <div className="text-3xl">{getCompatibilityEmoji(compatibility.level)}</div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-lg">{profile.mbti}</span>
                </div>
                <p className="text-sm text-gray-600">{profile.name}</p>
              </div>
            </div>

            {/* 궁합 점수 */}
            <div className="text-center mb-6">
              <div
                className="text-6xl font-bold mb-2"
                style={{ color: getCompatibilityColor(compatibility.level) }}
              >
                {compatibility.score}
              </div>
              <div
                className="text-xl font-semibold mb-1"
                style={{ color: getCompatibilityColor(compatibility.level) }}
              >
                {compatibility.title}
              </div>
              <p className="text-sm text-gray-600">{compatibility.description}</p>
            </div>

            {/* 진행 바 */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${compatibility.score}%`,
                  backgroundColor: getCompatibilityColor(compatibility.level)
                }}
              />
            </div>

            {/* 장점 */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <i className="ri-checkbox-circle-line text-green-500 mr-2"></i>
                장점
              </h4>
              <ul className="space-y-2">
                {compatibility.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 주의사항 */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <i className="ri-error-warning-line text-orange-500 mr-2"></i>
                주의사항
              </h4>
              <ul className="space-y-2">
                {compatibility.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-sm text-gray-700">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 조언 */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <i className="ri-lightbulb-line text-purple-500 mr-2"></i>
                조언
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{compatibility.advice}</p>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowMBTIModal(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
