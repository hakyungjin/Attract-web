import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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
  status: 'pending' | 'accepted' | 'rejected';
}

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender: string) => {
  if (gender === 'male') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
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

  useEffect(() => {
    if (authUser?.id) {
      loadRequests();
    }
  }, [authUser?.id]);

  const loadRequests = async () => {
    if (!authUser?.id) return;
    setIsLoading(true);

    try {
      // 받은 요청
      const { data: receivedData } = await supabase
        .from('matching_requests')
        .select(`
          id,
          from_user_id,
          status,
          created_at
        `)
        .eq('to_user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (receivedData) {
        const received: MatchRequest[] = [];
        
        for (const req of receivedData) {
          // 각 사용자 정보 따로 조회
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, age, gender, location, school, mbti, bio, profile_image')
            .eq('id', req.from_user_id)
            .single();

          if (userData) {
            received.push({
              id: req.id.toString(),
              userId: req.from_user_id,
              name: userData.name || '사용자',
              age: userData.age || 20,
              gender: userData.gender || 'unknown',
              location: userData.location || '위치 미설정',
              school: userData.school || '학교 미설정',
              mbti: userData.mbti,
              bio: userData.bio || '자기소개가 없습니다.',
              avatar: userData.profile_image || getDefaultAvatar(userData.gender),
              timestamp: new Date(req.created_at).toLocaleString('ko-KR'),
              status: req.status as 'pending' | 'accepted' | 'rejected'
            });
          }
        }
        
        setReceivedRequests(received.filter(r => r.status === 'pending'));
      }

      // 보낸 요청
      const { data: sentData } = await supabase
        .from('matching_requests')
        .select(`
          id,
          to_user_id,
          status,
          created_at
        `)
        .eq('from_user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (sentData) {
        const sent: MatchRequest[] = [];
        
        for (const req of sentData) {
          // 각 사용자 정보 따로 조회
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, age, gender, location, school, mbti, bio, profile_image')
            .eq('id', req.to_user_id)
            .single();

          if (userData) {
            sent.push({
              id: req.id.toString(),
              userId: req.to_user_id,
              name: userData.name || '사용자',
              age: userData.age || 20,
              gender: userData.gender || 'unknown',
              location: userData.location || '위치 미설정',
              school: userData.school || '학교 미설정',
              mbti: userData.mbti,
              bio: userData.bio || '자기소개가 없습니다.',
              avatar: userData.profile_image || getDefaultAvatar(userData.gender),
              timestamp: new Date(req.created_at).toLocaleString('ko-KR'),
              status: req.status as 'pending' | 'accepted' | 'rejected'
            });
          }
        }
        
        setSentRequests(sent);
      }
    } catch (error) {
      console.error('매칭 요청 로드 실패:', error);
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
      // 매칭 요청 상태 업데이트
      await supabase
        .from('matching_requests')
        .update({ status: 'accepted' })
        .eq('id', selectedUser.id);

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
      console.error('요청 수락 실패:', error);
      alert('요청 수락에 실패했습니다.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!authUser?.id) return;

    try {
      await supabase
        .from('matching_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      loadRequests();
    } catch (error) {
      console.error('요청 거절 실패:', error);
      alert('요청 거절에 실패했습니다.');
    }
  };

  const handleCancelRequest = (requestId: string) => {
    setSentRequests(prev => prev.filter(req => req.id !== requestId));
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

  const handleReject = (requestId: string) => {
    handleRejectRequest(requestId);
  };

  const handleCancel = (requestId: string) => {
    handleCancelRequest(requestId);
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
                      className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleProfileClick(request)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-800 cursor-pointer hover:text-cyan-500" onClick={() => handleProfileClick(request)}>{request.name}</h3>
                        <span className="text-sm text-gray-500">{request.age}세</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{request.location}</p>
                      <p className="text-xs text-gray-400">{request.timestamp}</p>
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
                      onClick={() => handleReject(request.id)}
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
                            : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {request.status === 'pending'
                          ? '대기중'
                          : request.status === 'accepted'
                            ? '수락됨'
                            : '거절됨'}
                      </span>
                      <span className="text-xs text-gray-400">{request.timestamp}</span>
                    </div>
                  </div>
                </div>
                {request.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(request.id)}
                    className="w-full mt-4 bg-gray-100 text-gray-600 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    요청 취소
                  </button>
                )}
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
            <p className="text-gray-600 mb-6">
              {selectedUser.name}님과의 매칭을 수락하시겠습니까?
            </p>
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
