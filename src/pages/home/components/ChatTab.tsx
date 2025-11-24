import { useState, useEffect, useRef } from 'react';

interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  gender?: string;
}

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender?: string) => {
  if (gender === '남자') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

export default function ChatTab() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatUsers, setChatUsers] = useState<ChatUser[]>([
    {
      id: 1,
      name: '하얀눈방울e',
      avatar: '',
      lastMessage: '안녕하세요! 반가워요 😊',
      lastMessageTime: '오후 2:30',
      unreadCount: 2,
      isOnline: true,
      gender: '여자'
    },
    {
      id: 2,
      name: '나만의아기고양이',
      avatar: '',
      lastMessage: '오늘 날씨가 정말 좋네요!',
      lastMessageTime: '오후 1:15',
      unreadCount: 0,
      isOnline: false,
      gender: '여자'
    },
    {
      id: 3,
      name: '세잎이',
      avatar: '',
      lastMessage: '커피 한 잔 어떠세요?',
      lastMessageTime: '오전 11:20',
      unreadCount: 1,
      isOnline: true,
      gender: '여자'
    },
    {
      id: 4,
      name: '띠로리이',
      avatar: '',
      lastMessage: '네, 좋아요! 언제 만날까요?',
      lastMessageTime: '어제',
      unreadCount: 0,
      isOnline: false,
      gender: '여자'
    }
  ]);

  const [messages, setMessages] = useState<Record<number, Message[]>>({
    1: [
      {
        id: 1,
        senderId: 1,
        content: '안녕하세요! 프로필 보고 연락드려요',
        timestamp: '오후 2:25',
        isRead: true
      },
      {
        id: 2,
        senderId: 0, // 내가 보낸 메시지
        content: '안녕하세요! 반가워요 😊',
        timestamp: '오후 2:26',
        isRead: true
      },
      {
        id: 3,
        senderId: 1,
        content: '혹시 시간 되실 때 커피 한 잔 어떠세요?',
        timestamp: '오후 2:30',
        isRead: false
      }
    ],
    2: [
      {
        id: 1,
        senderId: 2,
        content: '오늘 날씨가 정말 좋네요!',
        timestamp: '오후 1:15',
        isRead: true
      }
    ],
    3: [
      {
        id: 1,
        senderId: 3,
        content: '커피 한 잔 어떠세요?',
        timestamp: '오전 11:20',
        isRead: false
      }
    ],
    4: [
      {
        id: 1,
        senderId: 0,
        content: '언제 시간 되세요?',
        timestamp: '어제 오후 3:00',
        isRead: true
      },
      {
        id: 2,
        senderId: 4,
        content: '네, 좋아요! 언제 만날까요?',
        timestamp: '어제 오후 3:15',
        isRead: true
      }
    ]
  });

  // 메시지 목록이 변경될 때 스크롤을 아래로 이동
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedChat]);

  // 하트 수락으로 새 채팅방 열기 이벤트 리스너
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      const { userId, userName, userAvatar } = event.detail;
      
      // 이미 존재하는 채팅인지 확인
      const existingChat = chatUsers.find(user => user.id === userId);
      
      if (!existingChat) {
        // 새 채팅 사용자 추가
        const newChatUser: ChatUser = {
          id: userId,
          name: userName,
          avatar: userAvatar,
          lastMessage: '매칭되었습니다! 안녕하세요 😊',
          lastMessageTime: '방금 전',
          unreadCount: 0,
          isOnline: true,
          gender: '여자'
        };
        
        setChatUsers(prev => [newChatUser, ...prev]);
        
        // 초기 메시지 추가
        setMessages(prev => ({
          ...prev,
          [userId]: [
            {
              id: 1,
              senderId: 0,
              content: '매칭되었습니다! 안녕하세요 😊',
              timestamp: new Date().toLocaleTimeString('ko-KR', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }),
              isRead: true
            }
          ]
        }));
      }
      
      // 해당 채팅방으로 이동
      setSelectedChat(userId);
    };

    window.addEventListener('openChat', handleOpenChat as EventListener);
    
    return () => {
      window.removeEventListener('openChat', handleOpenChat as EventListener);
    };
  }, [chatUsers]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const newMsg: Message = {
        id: (messages[selectedChat]?.length || 0) + 1,
        senderId: 0, // 내가 보낸 메시지
        content: newMessage,
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        isRead: true
      };

      setMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMsg]
      }));

      // 채팅 목록에서 마지막 메시지 업데이트
      setChatUsers(prev => prev.map(user => 
        user.id === selectedChat 
          ? { ...user, lastMessage: newMessage, lastMessageTime: '방금 전' }
          : user
      ));

      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (userId: number) => {
    setSelectedChat(userId);
    
    // 읽지 않은 메시지 수 초기화
    setChatUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, unreadCount: 0 } : user
    ));
  };

  if (selectedChat) {
    const currentUser = chatUsers.find(user => user.id === selectedChat);
    const chatMessages = messages[selectedChat] || [];

    return (
      <div className="fixed inset-0 top-16 bottom-20 flex flex-col bg-white">
        {/* 채팅 헤더 */}
        <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedChat(null)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
            <div className="relative">
              <img
                src={currentUser?.avatar || getDefaultAvatar(currentUser?.gender)}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full object-cover object-top"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultAvatar(currentUser?.gender);
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{currentUser?.name}</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 flex items-center justify-center cursor-pointer">
              <i className="ri-phone-line text-xl text-gray-600"></i>
            </button>
            <button className="w-8 h-8 flex items-center justify-center cursor-pointer">
              <i className="ri-video-line text-xl text-gray-600"></i>
            </button>
            <button className="w-8 h-8 flex items-center justify-center cursor-pointer">
              <i className="ri-more-line text-xl text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end space-x-2 max-w-xs">
                {message.senderId !== 0 && (
                  <img
                    src={currentUser?.avatar || getDefaultAvatar(currentUser?.gender)}
                    alt={currentUser?.name}
                    className="w-6 h-6 rounded-full object-cover object-top"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultAvatar(currentUser?.gender);
                    }}
                  />
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.senderId === 0
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* 시간 표시 */}
          {chatMessages.length > 0 && (
            <div className="text-center">
              <span className="text-xs text-gray-400">
                {chatMessages[chatMessages.length - 1]?.timestamp}
              </span>
            </div>
          )}
          
          {/* 스크롤 앵커 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 */}
        <div className="p-4 border-t bg-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button className="w-8 h-8 flex items-center justify-center cursor-pointer">
              <i className="ri-add-line text-xl text-gray-600"></i>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                maxLength={500}
              />
            </div>
            <button className="w-8 h-8 flex items-center justify-center cursor-pointer">
              <i className="ri-emotion-line text-xl text-gray-600"></i>
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                newMessage.trim()
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-send-plane-fill"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-20">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">채팅</h2>
        </div>

        {/* 채팅 목록 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 mb-3">최근 채팅</h3>
          {chatUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleChatSelect(user.id)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={user.avatar || getDefaultAvatar(user.gender)}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover object-top"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultAvatar(user.gender);
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                    <span className="text-xs text-gray-500">{user.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{user.lastMessage}</p>
                </div>
                
                {user.unreadCount > 0 && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {user.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {chatUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-chat-3-line text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">아직 채팅이 없어요</h3>
            <p className="text-gray-600">매칭된 친구들과 대화를 시작해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
