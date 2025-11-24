import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MatchRequest {
  id: number;
  userId: number;
  name: string;
  age: number;
  gender: string;
  location: string;
  school: string;
  mbti: string;
  bio: string;
  avatar: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender: string) => {
  if (gender === '남자') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

export default function MatchingRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MatchRequest | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  // 받은 매칭 요청
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([
    {
      id: 1,
      userId: 101,
      name: '하얀눈방울e',
      age: 22,
      gender: '여자',
      location: '서울 금천구',
      school: '서울디지털대학교',
      mbti: 'ISFP',
      bio: '음악을 좋아하는 조용한 성격이에요',
      avatar: '',
      timestamp: '5분 전',
      status: 'pending'
    },
    {
      id: 2,
      userId: 102,
      name: '나만의아기고양이',
      age: 20,
      gender: '여자',
      location: '대전 중구',
      school: '한밭대학교',
      mbti: 'ISTP',
      bio: '빵 만들기를 좋아해요',
      avatar: '',
      timestamp: '1시간 전',
      status: 'pending'
    },
    {
      id: 3,
      userId: 103,
      name: '세잎이',
      age: 19,
      gender: '여자',
      location: '충남 아산시',
      school: '선문대학교',
      mbti: 'ESTP',
      bio: '컴퓨터 작업하는 걸 좋아해요',
      avatar: '',
      timestamp: '3시간 전',
      status: 'pending'
    }
  ]);

  // 보낸 매칭 요청
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([
    {
      id: 4,
      userId: 104,
      name: '눈망울e',
      age: 22,
      gender: '여자',
      location: '부산 동구',
      school: '부산디지털대학교',
      mbti: 'ISFP',
      bio: '헤드폰으로 음악 듣는 걸 좋아해요',
      avatar: '',
      timestamp: '어제',
      status: 'pending'
    },
    {
      id: 5,
      userId: 105,
      name: '띠로리이',
      age: 27,
      gender: '여자',
      location: '서울 금천구',
      school: '서울대학교',
      mbti: 'ESTJ',
      bio: '베이킹을 좋아하는 활발한 성격이에요',
      avatar: '',
      timestamp: '2일 전',
      status: 'accepted'
    },
    {
      id: 6,
      userId: 106,
      name: '으아니',
      age: 19,
      gender: '여자',
      location: '서울 광진구',
      school: '세종대학교',
      mbti: 'ISTJ',
      bio: '고양이를 좋아해요',
      avatar: '',
      timestamp: '3일 전',
      status: 'rejected'
    }
  ]);

  const handleAcceptRequest = (request: MatchRequest) => {
    setSelectedUser(request);
    setShowAcceptModal(true);
  };

  const confirmAccept = () => {
    if (selectedUser) {
      // 요청 상태 업데이트
      setReceivedRequests(prev =>
        prev.map(req =>
          req.id === selectedUser.id ? { ...req, status: 'accepted' } : req
        )
      );

      // 채팅방 생성 이벤트 발생
      const event = new CustomEvent('openChat', {
        detail: {
          userId: selectedUser.userId,
          userName: selectedUser.name,
          userAvatar: selectedUser.avatar || getDefaultAvatar(selectedUser.gender)
        }
      });
      window.dispatchEvent(event);

      setShowAcceptModal(false);
      setSelectedUser(null);

      // 채팅 탭으로 이동
      setTimeout(() => {
        navigate('/');
      }, 500);
    }
  };

  const handleRejectRequest = (requestId: number) => {
    setReceivedRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );
  };

  const handleCancelRequest = (requestId: number) => {
    setSentRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleProfileClick = (request: MatchRequest) => {
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
          character: request.avatar
        }
      }
    });
  };

  const handleAccept = (requestId: number) => {
    const request = receivedRequests.find(req => req.id === requestId);
    if (request) {
      handleAcceptRequest(request);
    }
  };

  const handleReject = (requestId: number) => {
    handleRejectRequest(requestId);
  };

  const handleCancel = (requestId: number) => {
    handleCancelRequest(requestId);
  };

  const pendingReceivedRequests = receivedRequests.filter(req => req.status === 'pending');
  const pendingSentRequests = sentRequests.filter(req => req.status === 'pending');
  const acceptedSentRequests = sentRequests.filter(req => req.status === 'accepted');
  const rejectedSentRequests = sentRequests.filter(req => req.status === 'rejected');

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
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'received'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          받은 요청 ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'sent'
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
          <div className="space-y-3">
            {receivedRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={request.avatar}
                    alt={request.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-gray-800">{request.name}</h3>
                      <span className="text-sm text-gray-500">{request.age}세</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{request.location}</p>
                    <p className="text-xs text-gray-400">{request.timeAgo}</p>
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
        ) : (
          <div className="space-y-3">
            {sentRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={request.avatar}
                    alt={request.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-gray-800">{request.name}</h3>
                      <span className="text-sm text-gray-500">{request.age}세</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{request.location}</p>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'pending'
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
                      <span className="text-xs text-gray-400">{request.timeAgo}</span>
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

      {/* 성공 알림 */}
      {showSuccessAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-heart-fill text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">매칭 성공!</h3>
            <p className="text-gray-600 mb-6">
              축하합니다! 새로운 인연이 시작되었어요 💕
            </p>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-full font-medium hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
