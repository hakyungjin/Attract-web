import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebase } from '../../lib/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { sendMatchAcceptNotification } from '../../services/ssodaaSmsService';
import { getDefaultAvatar } from '../../utils/avatarUtils';
import { logger } from '../../utils/logger';

interface MatchRequest {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  school: string;
  mbti?: string;
  bio: string;
  avatar: string;
  timestamp: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

// 남은 시간 계산 헬퍼 함수
const getRemainingTime = (createdAt: Date): string => {
  const now = new Date();
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24시간 후
  const remaining = expiresAt.getTime() - now.getTime();
  
  if (remaining <= 0) return '만료됨';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  }
  return `${minutes}분 남음`;
};

export default function MatchingRequestsPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MatchRequest | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const MATCH_COST = 50; // 매칭 비용

  useEffect(() => {
    if (authUser?.id) {
      loadRequests();
    }
  }, [authUser?.id]);

  // 24시간 지난 요청 자동 거절 및 환불 처리
  const processExpiredRequests = async (requests: any[], type: 'received' | 'sent') => {
    const now = new Date();
    const expiredRequests = requests.filter(req => {
      if (req.status !== 'pending') return false;
      const createdAt = new Date(req.created_at);
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursDiff >= 24;
    });

    for (const req of expiredRequests) {
      try {
        // 상태를 expired로 변경 - Firebase 사용
        await firebase.matching.updateMatchingRequestStatus(req.id, 'expired');

        // 요청 보낸 사람에게 코인 환불
        const senderId = type === 'received' ? req.from_user_id : req.from_user_id;

        // 코인 증가 - Firebase 사용
        await firebase.users.incrementCoins(senderId, MATCH_COST);

        // 환불 알림 전송 - Firebase 사용
        await firebase.notifications.createNotification({
          user_id: senderId,
          type: 'refund',
          title: '자석 환불 💎',
          message: `매칭 요청이 24시간 초과로 자동 만료되어 자석 ${MATCH_COST}개가 환불되었습니다.`,
          data: {},
          read: false,
          created_at: new Date().toISOString()
        });

        console.log(`만료된 요청 처리 완료: ${req.id}`);
      } catch (error) {
        console.error('만료 요청 처리 실패', error);
      }
    }

    return expiredRequests.length > 0;
  };

  const loadRequests = async () => {
    if (!authUser?.id) return;
    setIsLoading(true);

    try {
      const currentUserId = String(authUser.id);

      // 1. 받은 요청 조회 (pending만) - Firebase 사용
      const { requests: receivedData, error: receivedError } = await firebase.matching.getReceivedRequests(currentUserId, 'pending');

      // 2. 보낸 요청 조회 (모든 상태) - Firebase 사용
      const { requests: sentData, error: sentError } = await firebase.matching.getSentRequests(currentUserId);

      if (receivedError || sentError) {
        logger.error('매칭 요청 조회 실패', receivedError || sentError);
        return;
      }

      // 3. 24시간 지난 요청 자동 처리
      let needsReload = false;
      if (receivedData && receivedData.length > 0) {
        const processed = await processExpiredRequests(receivedData, 'received');
        if (processed) needsReload = true;
      }
      if (sentData && sentData.length > 0) {
        const pendingSent = sentData.filter(s => s.status === 'pending');
        const processed = await processExpiredRequests(pendingSent, 'sent');
        if (processed) needsReload = true;
      }

      // 만료 처리 후 다시 로드 필요하면 재귀 호출
      if (needsReload) {
        setIsLoading(false);
        loadRequests();
        return;
      }

      // 3. 모든 관련 사용자 ID 수집
      const fromUserIds = receivedData?.map(r => r.from_user_id) || [];
      const toUserIds = sentData?.map(s => s.to_user_id) || [];
      const allUserIds = [...new Set([...fromUserIds, ...toUserIds])];

      // 4. Firebase에서 사용자 정보 조회 (각 사용자를 개별적으로 조회)
      let usersMap: Record<string, any> = {};
      if (allUserIds.length > 0) {
        await Promise.all(
          allUserIds.map(async (userId) => {
            const { user, error } = await firebase.users.getUserById(userId);
            if (!error && user) {
              usersMap[userId] = user;
            }
          })
        );
      }

      // 5. 받은 요청 데이터 매핑
      if (receivedData) {
        const received: MatchRequest[] = receivedData
          .filter(req => usersMap[req.from_user_id]) // 사용자 정보가 있는 경우만
          .map(req => {
            const user = usersMap[req.from_user_id];
            return {
              id: req.id.toString(),
              userId: req.from_user_id,
              name: user.name || '사용자',
              age: user.age || 20,
              gender: user.gender || 'unknown',
              location: user.location || '위치 미설정',
              school: user.school || '학교 미설정',
              mbti: user.mbti,
              bio: user.bio || '자기소개가 없습니다.',
              avatar: user.profile_image || getDefaultAvatar(user.gender),
              timestamp: new Date(req.created_at).toLocaleString('ko-KR'),
              createdAt: new Date(req.created_at),
              status: req.status as 'pending' | 'accepted' | 'rejected' | 'expired'
            };
          })
          .filter(r => r.status === 'pending');

        setReceivedRequests(received);
      }

      // 6. 보낸 요청 데이터 매핑
      if (sentData) {
        const sent: MatchRequest[] = sentData
          .filter(req => usersMap[req.to_user_id]) // 사용자 정보가 있는 경우만
          .map(req => {
            const user = usersMap[req.to_user_id];
            return {
              id: req.id.toString(),
              userId: req.to_user_id,
              name: user.name || '사용자',
              age: user.age || 20,
              gender: user.gender || 'unknown',
              location: user.location || '위치 미설정',
              school: user.school || '학교 미설정',
              mbti: user.mbti,
              bio: user.bio || '자기소개가 없습니다.',
              avatar: user.profile_image || getDefaultAvatar(user.gender),
              timestamp: new Date(req.created_at).toLocaleString('ko-KR'),
              createdAt: new Date(req.created_at),
              status: req.status as 'pending' | 'accepted' | 'rejected' | 'expired'
            };
          });

        setSentRequests(sent);
      }
    } catch (error) {
      logger.error('매칭 요청 로드 실패', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAcceptRequest = (request: MatchRequest) => {
    setSelectedUser(request);
    setShowAcceptModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedUser || !authUser?.id) return;

    try {
      const currentUserId = String(authUser.id);
      const otherUserId = String(selectedUser.userId);

      // 1. 내 코인 잔액 확인
      const { data: userData } = await supabase
        .from('users')
        .select('coins')
        .eq('id', currentUserId)
        .single();

      const myCoins = userData?.coins || 0;

      if (myCoins < MATCH_COST) {
        alert(`자석이 부족합니다. 현재 ${myCoins}개 보유 중 (필요: ${MATCH_COST}개)`);
        setShowAcceptModal(false);
        navigate('/coin-shop');
        return;
      }

      // 2. 내 코인 차감
      await supabase
        .from('users')
        .update({ coins: myCoins - MATCH_COST })
        .eq('id', currentUserId);

      // 3. 매칭 요청 상태 업데이트
      await supabase
        .from('matching_requests')
        .update({ status: 'accepted' })
        .eq('id', selectedUser.id);

      // 4. 상대방이 나에게 보낸 요청도 있는지 확인하고 업데이트
      await supabase
        .from('matching_requests')
        .update({ status: 'accepted' })
        .eq('from_user_id', otherUserId)
        .eq('to_user_id', currentUserId)
        .eq('status', 'pending');

      // 5. 채팅방 생성 (이미 존재하지 않는 경우만)
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`)
        .single();

      if (!existingRoom) {
        const { data: chatRoom, error: chatError } = await supabase
          .from('chat_rooms')
          .insert({
            user1_id: currentUserId,
            user2_id: otherUserId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (chatError) {
          logger.error('채팅방 생성 실패', chatError);
        } else {
          logger.info('채팅방 생성 완료', { chatRoom });
        }
      }

      // 매칭 수락 SMS 알림 발송
      try {
        // 요청 보낸 사람에게 SMS 발송
        const { data: otherUserData } = await supabase
          .from('users')
          .select('phone_number')
          .eq('id', otherUserId)
          .single();

        if (otherUserData?.phone_number) {
          await sendMatchAcceptNotification(
            otherUserData.phone_number,
            authUser.name || '누군가'
          );
        }
      } catch (smsError) {
        logger.error('매칭 수락 SMS 발송 실패', smsError);
        // SMS 발송 실패는 무시하고 계속 진행
      }

      // 채팅방 시작 이벤트
      const event = new CustomEvent('openChat', {
        detail: {
          userId: selectedUser.userId,
          userName: selectedUser.name,
          userAvatar: selectedUser.avatar
        }
      });
      window.dispatchEvent(event);

      setShowAcceptModal(false);
      setSelectedUser(null);
      loadRequests();

      // 채팅 탭으로 이동
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      logger.error('요청 수락 실패', error);
      alert('요청 수락에 실패했습니다.');
    }
  };

  const handleRejectRequest = async (requestId: string, fromUserId: string) => {
    if (!authUser?.id) return;

    try {
      // 1. 매칭 요청 상태를 rejected로 업데이트
      await supabase
        .from('matching_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      // 2. 요청 보낸 사람에게 코인 환불
      const { data: senderData } = await supabase
        .from('users')
        .select('coins')
        .eq('id', fromUserId)
        .single();

      if (senderData) {
        await supabase
          .from('users')
          .update({ coins: (senderData.coins || 0) + MATCH_COST })
          .eq('id', fromUserId);

        // 환불 알림 전송
        await supabase.from('notifications').insert({
          user_id: fromUserId,
          type: 'refund',
          title: '자석 환불 💎',
          message: `매칭 요청이 거절되어 자석 ${MATCH_COST}개가 환불되었습니다.`,
          data: {},
          read: false
        });
      }

      loadRequests();
    } catch (error) {
      logger.error('요청 거절 실패', error);
      alert('요청 거절에 실패했습니다.');
    }
  };

  const handleProfileClick = (request: MatchRequest) => {
    const avatarUrl = request.avatar || getDefaultAvatar(request.gender);
    navigate('/profile-detail', {
      state: {
        profile: {
          id: request.userId,
          name: request.name,
          age: request.age,
          gender: request.gender,
          location: request.location,
          school: request.school,
          mbti: request.mbti,
          bio: request.bio,
          character: avatarUrl,
          photos: avatarUrl ? [avatarUrl] : [] // photos 배열 추가
        }
      }
    });
  };

  const handleAccept = (requestId: string) => {
    const request = receivedRequests.find(req => req.id === requestId);
    if (request) {
      handleAcceptRequest(request);
    }
  };

  const handleReject = (requestId: string, userId: string) => {
    handleRejectRequest(requestId, userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-cyan-500 animate-spin mb-4"></i>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="text-lg font-bold">매칭 관리</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white px-4 py-3 flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'received'
            ? 'bg-cyan-500 text-white'
            : 'bg-gray-100 text-gray-600'
            }`}
        >
          받은 요청 ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'sent'
            ? 'bg-cyan-500 text-white'
            : 'bg-gray-100 text-gray-600'
            }`}
        >
          보낸 요청 ({sentRequests.length})
        </button>
      </div>

      {/* 요청 목록 */}
      <div className="px-4 py-4">
        {activeTab === 'received' ? (
          receivedRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                <i className="ri-mail-open-line text-4xl text-gray-300"></i>
              </div>
              <p className="text-gray-500 font-medium">받은 매칭 요청이 없습니다</p>
              <p className="text-gray-400 text-sm mt-1">프로필을 완성하고 좋아요를 받아보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={request.avatar || getDefaultAvatar(request.gender)}
                      alt={request.name}
                      loading="lazy"
                      decoding="async"
                      className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleProfileClick(request)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-800 cursor-pointer hover:text-cyan-500" onClick={() => handleProfileClick(request)}>{request.name}</h3>
                        <span className="text-sm text-gray-500">{request.age}세</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{request.location}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">{request.timestamp}</span>
                        <span className="text-xs text-orange-500 font-medium">
                          <i className="ri-time-line mr-0.5"></i>
                          {getRemainingTime(request.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-full text-sm font-medium hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleReject(request.id, request.userId)}
                      className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : sentRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
              <i className="ri-mail-send-line text-4xl text-gray-300"></i>
            </div>
            <p className="text-gray-500 font-medium">보낸 매칭 요청이 없습니다</p>
            <p className="text-gray-400 text-sm mt-1">마음에 드는 사람에게 매칭을 신청해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sentRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={request.avatar || getDefaultAvatar(request.gender)}
                    alt={request.name}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleProfileClick(request)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-gray-800 cursor-pointer hover:text-cyan-500" onClick={() => handleProfileClick(request)}>{request.name}</h3>
                      <span className="text-sm text-gray-500">{request.age}세</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{request.location}</p>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : request.status === 'accepted'
                            ? 'bg-cyan-100 text-cyan-700'
                            : request.status === 'expired'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {request.status === 'pending'
                          ? '대기중'
                          : request.status === 'accepted'
                            ? '수락됨'
                            : request.status === 'expired'
                              ? '만료됨 (환불완료)'
                              : '거절됨 (환불완료)'}
                      </span>
                      {request.status === 'pending' && (
                        <span className="text-xs text-orange-500 font-medium">
                          <i className="ri-time-line mr-0.5"></i>
                          {getRemainingTime(request.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 성공 모달 */}
      {showAcceptModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-heart-fill text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">매칭 수락</h3>
            <p className="text-gray-600 mb-2">
              {selectedUser.name}님과의 매칭을 수락하시겠습니까?
            </p>
            <p className="text-cyan-600 font-medium mb-2">
              자석 {MATCH_COST}개가 소모됩니다
            </p>
            <div className="bg-cyan-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-cyan-700">
                <i className="ri-information-line mr-1"></i>
                상대가 거절하면 자석이 환불됩니다
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-full font-medium hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
              >
                취소
              </button>
              <button
                onClick={confirmAccept}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-full font-medium hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap"
              >
                수락
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
