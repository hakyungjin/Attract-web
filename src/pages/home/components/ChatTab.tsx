import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface ChatUser {
  id: string;
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
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender?: string) => {
  if (gender === 'male') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

export default function ChatTab() {
  const { user: authUser } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // 메시지 목록이 변경될 때 스크롤을 아래로 이동
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedChat]);

  // 채팅 목록 로드
  useEffect(() => {
    if (!authUser?.id) return;
    loadChatList();
    
    // 실시간 메시지 구독
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadChatList();
          if (selectedChat) {
            loadMessages(selectedChat);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [authUser?.id, selectedChat]);

  const loadChatList = async () => {
    if (!authUser?.id) return;

    try {
      // 내가 참여한 모든 대화 상대 찾기
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('sender_id, recipient_id')
        .or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!sentMessages) return;

      // 대화 상대 리스트 추출 및 중복 제거
      const partners = new Set<string>();
      sentMessages.forEach(msg => {
        if (msg.sender_id === authUser.id) {
          partners.add(msg.recipient_id);
        } else {
          partners.add(msg.sender_id);
        }
      });

      // 모든 파트너의 정보를 한 번에 조회
      const partnerIds = Array.from(partners);
      if (partnerIds.length === 0) {
        setChatUsers([]);
        return;
      }

      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, profile_image, gender')
        .in('id', partnerIds);

      if (!usersData) {
        setChatUsers([]);
        return;
      }

      // 사용자 맵 생성
      const usersMap = Object.fromEntries(
        usersData.map(user => [user.id, user])
      );

      // 각 파트너의 마지막 메시지 로드
      const chatList: ChatUser[] = [];
      for (const partnerId of partnerIds) {
        const userData = usersMap[partnerId];
        if (!userData) continue;

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at, is_read, sender_id')
          .or(`and(sender_id.eq.${authUser.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${authUser.id})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        chatList.push({
          id: userData.id,
          name: userData.name || '사용자',
          avatar: userData.profile_image || getDefaultAvatar(userData.gender),
          lastMessage: lastMsg?.content || 'Conversation started',
          lastMessageTime: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }) : '방금 전',
          unreadCount: lastMsg && !lastMsg.is_read && lastMsg.sender_id === partnerId ? 1 : 0,
          isOnline: true,
          gender: userData.gender
        });
      }

      setChatUsers(chatList);
    } catch (error) {
      console.error('채팅 목록 로드 실패:', error);
    }
  };

  const loadMessages = async (partnerId: string) => {
    if (!authUser?.id) return;

    try {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at, is_read')
        .or(`and(sender_id.eq.${authUser.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${authUser.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          isRead: msg.is_read
        }));
        setMessages(prev => ({
          ...prev,
          [partnerId]: formattedMessages
        }));

        // 메시지 읽음 표시
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('recipient_id', authUser.id)
          .eq('sender_id', partnerId);
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !authUser?.id) return;

    try {
      // DB에 메시지 저장
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: authUser.id,
          recipient_id: selectedChat,
          content: newMessage,
          is_read: false
        });

      if (error) throw error;

      // UI 업데이트 (DB 구독으로 자동 반영됨)
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (userId: string) => {
    setSelectedChat(userId);
    loadMessages(userId);
  };

  if (selectedChat) {
    const currentUser = chatUsers.find(user => user.id === selectedChat);
    const chatMessages = messages[selectedChat] || [];

    return (
      <div className="fixed inset-0 top-0 bottom-20 flex flex-col bg-slate-50 z-50">
        {/* 채팅 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/90 backdrop-blur-md flex-shrink-0 pt-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedChat(null)}
              className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors"
            >
              <i className="ri-arrow-left-line text-xl text-slate-600"></i>
            </button>
            <div className="relative">
              <img
                src={currentUser?.avatar || getDefaultAvatar(currentUser?.gender)}
                alt={currentUser?.name}
                loading="lazy"
                decoding="async"
                className="w-10 h-10 rounded-full object-cover object-top shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultAvatar(currentUser?.gender);
                }}
              />
              {currentUser?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 font-display">{currentUser?.name}</h3>
              {currentUser?.isOnline && <span className="text-[10px] text-green-500 font-medium">온라인</span>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-primary-500">
              <i className="ri-phone-line text-xl"></i>
            </button>
            <button className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-primary-500">
              <i className="ri-video-line text-xl"></i>
            </button>
            <button className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-primary-500">
              <i className="ri-more-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === authUser?.id ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div className="flex items-end space-x-2 max-w-[80%]">
                {message.senderId !== authUser?.id && (
                  <img
                    src={currentUser?.avatar || getDefaultAvatar(currentUser?.gender)}
                    alt={currentUser?.name}
                    loading="lazy"
                    decoding="async"
                    className="w-8 h-8 rounded-full object-cover object-top shadow-sm mb-1"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultAvatar(currentUser?.gender);
                    }}
                  />
                )}
                <div
                  className={`px-5 py-3 rounded-2xl shadow-sm ${message.senderId === authUser?.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-none'
                      : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                    }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* 시간 표시 */}
          {chatMessages.length > 0 && (
            <div className="text-center py-2">
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {chatMessages[chatMessages.length - 1]?.timestamp}
              </span>
            </div>
          )}

          {/* 스크롤 앵커 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 */}
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-primary-500">
              <i className="ri-add-line text-xl"></i>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="w-full px-5 py-3 bg-slate-50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm border border-transparent focus:border-primary-200"
                maxLength={500}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors">
                <i className="ri-emotion-line text-xl"></i>
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${newMessage.trim()
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:scale-105 hover:shadow-primary-500/30'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
            >
              <i className="ri-send-plane-fill text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-20 min-h-screen">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-display text-slate-800">채팅</h2>
          <div className="flex space-x-2">
            <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-primary-500 hover:shadow-md transition-all">
              <i className="ri-search-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* 채팅 목록 */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Recent Messages</h3>
          {chatUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleChatSelect(user.id)}
              className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer border border-slate-50 group transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user.avatar || getDefaultAvatar(user.gender)}
                    alt={user.name}
                    loading="lazy"
                    decoding="async"
                    className="w-14 h-14 rounded-2xl object-cover object-top shadow-sm group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultAvatar(user.gender);
                    }}
                  />
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800 truncate text-base font-display group-hover:text-primary-600 transition-colors">{user.name}</h3>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{user.lastMessageTime}</span>
                  </div>
                  <p className={`text-sm truncate ${user.unreadCount > 0 ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                    {user.lastMessage}
                  </p>
                </div>

                {user.unreadCount > 0 && (
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-primary-500/30 animate-bounce">
                    {user.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {chatUsers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <i className="ri-chat-3-line text-4xl text-slate-300"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-display">아직 채팅이 없어요</h3>
            <p className="text-slate-500">매칭된 친구들과 대화를 시작해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
