import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * 채팅방 정보 인터페이스
 */
interface ChatRoom {
  roomId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerGender?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

/**
 * 메시지 인터페이스
 */
interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

/**
 * 기본 프로필 이미지 반환 함수
 */
const getDefaultAvatar = (gender?: string) => {
  if (gender === 'male') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

/**
 * ChatTab Props 인터페이스
 */
interface ChatTabProps {
  onChatViewChange?: (isInChat: boolean) => void;
}

/**
 * ChatTab 컴포넌트
 * 매칭된 사용자들과의 채팅을 관리
 */
export default function ChatTab({ onChatViewChange }: ChatTabProps) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  /**
   * 채팅 뷰 상태 변경 시 부모에게 알림
   */
  useEffect(() => {
    onChatViewChange?.(!!selectedRoom);
  }, [selectedRoom, onChatViewChange]);

  /**
   * 메시지 목록이 변경될 때 스크롤을 아래로 이동
   */
  useEffect(() => {
    if (selectedRoom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedRoom]);

  /**
   * 브라우저 뒤로가기 버튼 처리
   */
  useEffect(() => {
    const handlePopState = () => {
      if (selectedRoom) {
        setSelectedRoom(null);
        setMessages([]);
      }
    };

    if (selectedRoom) {
      window.history.pushState({ chatRoom: true }, '');
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedRoom]);

  /**
   * 채팅방 목록 로드 및 실시간 구독 설정
   */
  useEffect(() => {
    if (!authUser?.id) return;
    
    loadChatRooms();
    
    const messageSubscription = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('📨 새 메시지 수신:', payload);
          loadChatRooms();
          
          if (selectedRoom && payload.new.room_id === selectedRoom.roomId) {
            loadMessages(selectedRoom.roomId);
          }
        }
      )
      .subscribe();

    const roomSubscription = supabase
      .channel('chat-rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        () => {
          console.log('🏠 채팅방 변경 감지');
          loadChatRooms();
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      roomSubscription.unsubscribe();
    };
  }, [authUser?.id, selectedRoom]);

  /**
   * 채팅방 목록 로드
   */
  const loadChatRooms = async () => {
    if (!authUser?.id) return;

    try {
      setIsLoading(true);
      
      const userId = String(authUser.id);
      
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          user1_id,
          user2_id,
          last_message,
          last_message_at,
          last_message_sender_id,
          is_active,
          created_at
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('❌ 채팅방 조회 에러:', error);
        setChatRooms([]);
        return;
      }

      if (!rooms || rooms.length === 0) {
        setChatRooms([]);
        return;
      }

      const partnerIds = rooms.map(room => {
        const isUser1 = room.user1_id === userId;
        return isUser1 ? room.user2_id : room.user1_id;
      });

      const { data: partners } = await supabase
        .from('users')
        .select('id, name, profile_image, gender')
        .in('id', partnerIds);

      const partnerMap = new Map(
        (partners || []).map(p => [p.id, p])
      );

      const chatRoomList: ChatRoom[] = await Promise.all(
        rooms.map(async (room) => {
          const partnerId = room.user1_id === userId ? room.user2_id : room.user1_id;
          const partner = partnerMap.get(partnerId);

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('recipient_id', authUser.id)
            .eq('is_read', false);

          return {
            roomId: room.id,
            partnerId: partnerId,
            partnerName: partner?.name || '사용자',
            partnerAvatar: partner?.profile_image || getDefaultAvatar(partner?.gender),
            partnerGender: partner?.gender,
            lastMessage: room.last_message || '대화를 시작해보세요!',
            lastMessageTime: room.last_message_at 
              ? new Date(room.last_message_at).toLocaleTimeString('ko-KR', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                })
              : '방금 전',
            unreadCount: unreadCount || 0
          };
        })
      );

      setChatRooms(chatRoomList);
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
      setChatRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 특정 채팅방의 메시지 목록 로드
   */
  const loadMessages = async (roomId: string) => {
    if (!authUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at, is_read')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('메시지 조회 에러:', error);
        return;
      }

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
        setMessages(formattedMessages);

        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('room_id', roomId)
          .eq('recipient_id', authUser.id)
          .eq('is_read', false);
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  /**
   * 상대방 프로필 상세 페이지로 이동
   */
  const goToProfileDetail = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (error) throw error;

      navigate('/profile-detail', {
        state: {
          profile: {
            id: data.id,
            name: data.name,
            age: data.age,
            gender: data.gender,
            location: data.location,
            school: data.school,
            mbti: data.mbti,
            bio: data.bio,
            photos: data.profile_image ? [data.profile_image] : [],
            interests: data.interests || [],
            height: data.height,
            bodyType: data.body_type,
            style: data.style,
            religion: data.religion,
            smoking: data.smoking,
            drinking: data.drinking,
            isMatched: true
          }
        }
      });
    } catch (error) {
      console.error('프로필 로드 실패:', error);
      alert('프로필을 불러오는데 실패했습니다.');
    }
  };

  /**
   * 채팅방 나가기 (삭제)
   */
  const handleLeaveRoom = async () => {
    if (!selectedRoom) return;

    setIsLeaving(true);
    try {
      await supabase
        .from('messages')
        .delete()
        .eq('room_id', selectedRoom.roomId);

      const { error } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('id', selectedRoom.roomId);

      if (error) throw error;

      setChatRooms(prev => prev.filter(room => room.roomId !== selectedRoom.roomId));
      setSelectedRoom(null);
      setMessages([]);
      setShowLeaveModal(false);
      
      alert('채팅방을 나갔습니다.');
    } catch (error) {
      console.error('채팅방 나가기 실패:', error);
      alert('채팅방 나가기에 실패했습니다.');
    } finally {
      setIsLeaving(false);
    }
  };

  /**
   * 메시지 전송 핸들러
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !authUser?.id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: selectedRoom.roomId,
          sender_id: String(authUser.id),
          recipient_id: String(selectedRoom.partnerId),
          content: newMessage,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      setNewMessage('');
      loadMessages(selectedRoom.roomId);
    } catch (error: any) {
      console.error('❌ 메시지 전송 실패:', error);
      alert(`메시지 전송 실패: ${error.message || '알 수 없는 오류'}`);
    }
  };

  /**
   * 엔터 키 입력 핸들러
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * 채팅방 선택 핸들러
   */
  const handleChatSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    loadMessages(room.roomId);
  };

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    setSelectedRoom(null);
    setMessages([]);
    window.history.replaceState(null, '');
  };

  // ==========================================
  // 채팅 화면 (채팅방 선택된 상태)
  // ==========================================
  if (selectedRoom) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center bg-slate-100">
        <div className="w-full max-w-[400px] bg-white flex flex-col">
        {/* 채팅 헤더 */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0"
          style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors"
            >
              <i className="ri-arrow-left-line text-xl text-slate-600"></i>
            </button>
            
            <button
              onClick={() => goToProfileDetail(selectedRoom.partnerId)}
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={selectedRoom.partnerAvatar || getDefaultAvatar(selectedRoom.partnerGender)}
                alt={selectedRoom.partnerName}
                className="w-10 h-10 rounded-full object-cover object-top shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultAvatar(selectedRoom.partnerGender);
                }}
              />
              <div className="text-left">
                <h3 className="font-bold text-slate-800">{selectedRoom.partnerName}</h3>
                <span className="text-[10px] text-slate-400">프로필 보기 →</span>
              </div>
            </button>
          </div>
          
          <button
            onClick={() => setShowLeaveModal(true)}
            className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-red-50 rounded-full transition-colors text-slate-400 hover:text-red-500"
          >
            <i className="ri-logout-box-r-line text-xl"></i>
          </button>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-chat-smile-2-line text-3xl text-slate-400"></i>
              </div>
              <p className="text-slate-500 text-sm">첫 메시지를 보내보세요! 💬</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === authUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-[75%] ${message.senderId !== authUser?.id ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
                  {message.senderId !== authUser?.id && (
                    <button
                      onClick={() => goToProfileDetail(selectedRoom.partnerId)}
                      className="flex-shrink-0"
                    >
                      <img
                        src={selectedRoom.partnerAvatar || getDefaultAvatar(selectedRoom.partnerGender)}
                        alt={selectedRoom.partnerName}
                        className="w-8 h-8 rounded-full object-cover object-top shadow-sm mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getDefaultAvatar(selectedRoom.partnerGender);
                        }}
                      />
                    </button>
                  )}
                  
                  <div className="flex flex-col">
                    {message.senderId !== authUser?.id && (
                      <span className="text-xs text-slate-400 mb-1 ml-1">{selectedRoom.partnerName}</span>
                    )}
                    
                    <div className="flex items-end space-x-1">
                      {message.senderId === authUser?.id && (
                        <span className="text-[10px] text-slate-400 mb-1">{message.timestamp}</span>
                      )}
                      
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          message.senderId === authUser?.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-sm'
                            : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      
                      {message.senderId !== authUser?.id && (
                        <span className="text-[10px] text-slate-400 mb-1">{message.timestamp}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 */}
        <div 
          className="px-4 pt-3 bg-white border-t border-slate-100 flex-shrink-0"
          style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 12px))' }}
        >
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all text-sm"
              maxLength={500}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                newMessage.trim()
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:scale-105 shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <i className="ri-send-plane-fill text-base"></i>
            </button>
          </div>
        </div>

        {/* 방 나가기 확인 모달 */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-logout-box-r-line text-3xl text-red-500"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">채팅방 나가기</h3>
                <p className="text-sm text-slate-500">
                  채팅방을 나가면 모든 대화 내용이 삭제됩니다.<br />
                  정말 나가시겠습니까?
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium"
                  disabled={isLeaving}
                >
                  취소
                </button>
                <button
                  onClick={handleLeaveRoom}
                  disabled={isLeaving}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {isLeaving ? '나가는 중...' : '나가기'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 채팅방 목록 화면
  // ==========================================
  return (
    <div className="min-h-screen px-5 pt-2">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">채팅</h2>
        <button 
          onClick={loadChatRooms}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-cyan-500 hover:shadow-md transition-all"
        >
          <i className="ri-refresh-line text-xl"></i>
        </button>
      </div>

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-slate-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-40"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : chatRooms.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-3">
            매칭된 대화 ({chatRooms.length})
          </p>
          {chatRooms.map((room) => (
            <div
              key={room.roomId}
              onClick={() => handleChatSelect(room)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 active:scale-[0.98]"
            >
              <div className="flex items-center space-x-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={room.partnerAvatar || getDefaultAvatar(room.partnerGender)}
                    alt={room.partnerName}
                    className="w-14 h-14 rounded-full object-cover object-top shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultAvatar(room.partnerGender);
                    }}
                  />
                  {room.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {room.unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800 truncate">
                      {room.partnerName}
                    </h3>
                    <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">
                      {room.lastMessageTime}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${room.unreadCount > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                    {room.lastMessage}
                  </p>
                </div>

                <i className="ri-arrow-right-s-line text-slate-300 text-xl"></i>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 빈 상태
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-chat-3-line text-4xl text-slate-300"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">아직 채팅이 없어요</h3>
          <p className="text-slate-500 mb-2">매칭이 성사되면 채팅을 시작할 수 있어요!</p>
          <p className="text-xs text-slate-400">
            매칭 탭에서 마음에 드는 상대에게<br />
            하트를 보내보세요 💕
          </p>
        </div>
      )}
    </div>
  );
}
