import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * 채팅방 정보 인터페이스
 * chat_rooms 테이블에서 조회한 데이터를 표현
 */
interface ChatRoom {
  roomId: string;           // 채팅방 ID
  partnerId: string;        // 상대방 사용자 ID
  partnerName: string;      // 상대방 이름
  partnerAvatar: string;    // 상대방 프로필 이미지
  partnerGender?: string;   // 상대방 성별
  lastMessage: string;      // 마지막 메시지
  lastMessageTime: string;  // 마지막 메시지 시간
  unreadCount: number;      // 안 읽은 메시지 수
  isOnline: boolean;        // 온라인 상태 (현재는 항상 true)
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
 * @param gender 성별 ('male' | 'female')
 * @returns 기본 아바타 이미지 URL
 */
const getDefaultAvatar = (gender?: string) => {
  if (gender === 'male') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

/**
 * ChatTab 컴포넌트
 * 매칭된 사용자들과의 채팅을 관리하는 메인 컴포넌트
 * - 채팅방 목록 표시
 * - 1:1 채팅 기능
 * - 실시간 메시지 수신
 */
export default function ChatTab() {
  const { user: authUser } = useAuth();
  
  // 현재 선택된 채팅방 정보
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅방 목록 및 메시지
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 메시지 목록이 변경될 때 스크롤을 아래로 이동
   */
  useEffect(() => {
    if (selectedRoom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedRoom]);

  /**
   * 채팅방 목록 로드 및 실시간 구독 설정
   */
  useEffect(() => {
    if (!authUser?.id) return;
    
    loadChatRooms();
    
    // 실시간 메시지 구독 (새 메시지 도착 시 목록 갱신)
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
          loadChatRooms(); // 채팅방 목록 갱신
          
          // 현재 열려있는 채팅방의 메시지인 경우 메시지 목록 갱신
          if (selectedRoom && payload.new.room_id === selectedRoom.roomId) {
            loadMessages(selectedRoom.roomId);
          }
        }
      )
      .subscribe();

    // 채팅방 실시간 구독 (새 채팅방 생성 시)
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
   * chat_rooms 테이블에서 내가 참여한 채팅방 목록을 조회
   */
  const loadChatRooms = async () => {
    if (!authUser?.id) return;

    try {
      setIsLoading(true);
      
      // 디버깅: 현재 사용자 ID 확인
      console.log('🔍 [ChatTab] 현재 사용자 ID:', authUser.id);
      console.log('🔍 [ChatTab] ID 타입:', typeof authUser.id);
      
      // 내가 참여한 채팅방 조회 (user_id를 문자열로 비교)
      const userId = String(authUser.id);
      console.log('🔍 [ChatTab] 변환된 userId:', userId);
      
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
        console.error('❌ [ChatTab] 채팅방 조회 에러:', error);
        setChatRooms([]);
        return;
      }

      // 디버깅: 조회된 채팅방 확인
      console.log('📋 [ChatTab] 조회된 채팅방:', rooms);
      console.log('📋 [ChatTab] 채팅방 수:', rooms?.length || 0);

      if (!rooms || rooms.length === 0) {
        console.log('⚠️ [ChatTab] 채팅방이 없습니다.');
        setChatRooms([]);
        return;
      }

      // 상대방 사용자 ID 목록 추출 (문자열 비교)
      const partnerIds = rooms.map(room => {
        const isUser1 = room.user1_id === userId;
        console.log(`🔍 [ChatTab] Room ${room.id}: user1=${room.user1_id}, user2=${room.user2_id}, isUser1=${isUser1}`);
        return isUser1 ? room.user2_id : room.user1_id;
      });

      console.log('👥 [ChatTab] 상대방 ID 목록:', partnerIds);

      // 상대방 정보 일괄 조회
      const { data: partners } = await supabase
        .from('users')
        .select('id, name, profile_image, gender')
        .in('id', partnerIds);

      console.log('👥 [ChatTab] 상대방 정보:', partners);

      // 상대방 정보 맵 생성
      const partnerMap = new Map(
        (partners || []).map(p => [p.id, p])
      );

      // 각 채팅방의 안 읽은 메시지 수 조회
      const chatRoomList: ChatRoom[] = await Promise.all(
        rooms.map(async (room) => {
          const partnerId = room.user1_id === userId ? room.user2_id : room.user1_id;
          const partner = partnerMap.get(partnerId);

          // 안 읽은 메시지 수 조회
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
            unreadCount: unreadCount || 0,
            isOnline: true // TODO: 실제 온라인 상태 구현
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
   * @param roomId 채팅방 ID
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

        // 메시지 읽음 표시
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
   * 메시지 전송 핸들러
   * 현재 선택된 채팅방에 메시지를 전송
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !authUser?.id) return;

    try {
      // 디버깅: 전송 정보 확인
      console.log('📤 [ChatTab] 메시지 전송 시도:', {
        room_id: selectedRoom.roomId,
        sender_id: authUser.id,
        recipient_id: selectedRoom.partnerId,
        content: newMessage.substring(0, 20) + '...'
      });

      // DB에 메시지 저장 (room_id 포함)
      const { data, error } = await supabase
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

      if (error) {
        console.error('❌ [ChatTab] 메시지 전송 에러:', error);
        throw error;
      }

      console.log('✅ [ChatTab] 메시지 전송 성공:', data);

      // 입력창 초기화 (실시간 구독으로 메시지 목록 자동 갱신됨)
      setNewMessage('');
      
      // 즉시 메시지 목록 갱신 (더 빠른 UX를 위해)
      loadMessages(selectedRoom.roomId);
    } catch (error: any) {
      console.error('❌ [ChatTab] 메시지 전송 실패:', error);
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
   * @param room 선택한 채팅방
   */
  const handleChatSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    loadMessages(room.roomId);
  };

  // ==========================================
  // 채팅 화면 (채팅방 선택된 상태)
  // ==========================================
  if (selectedRoom) {
    return (
      <div className="fixed inset-0 top-0 bottom-20 flex flex-col bg-slate-50 z-50">
        {/* 채팅 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/90 backdrop-blur-md flex-shrink-0 pt-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setSelectedRoom(null);
                setMessages([]);
              }}
              className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors"
            >
              <i className="ri-arrow-left-line text-xl text-slate-600"></i>
            </button>
            <div className="relative">
              <img
                src={selectedRoom.partnerAvatar || getDefaultAvatar(selectedRoom.partnerGender)}
                alt={selectedRoom.partnerName}
                loading="lazy"
                decoding="async"
                className="w-10 h-10 rounded-full object-cover object-top shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultAvatar(selectedRoom.partnerGender);
                }}
              />
              {selectedRoom.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 font-display">{selectedRoom.partnerName}</h3>
              {selectedRoom.isOnline && <span className="text-[10px] text-green-500 font-medium">온라인</span>}
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
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-chat-smile-2-line text-3xl text-slate-400"></i>
              </div>
              <p className="text-slate-500 text-sm">첫 메시지를 보내보세요! 💬</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === authUser?.id ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                <div className="flex items-end space-x-2 max-w-[80%]">
                  {message.senderId !== authUser?.id && (
                    <img
                      src={selectedRoom.partnerAvatar || getDefaultAvatar(selectedRoom.partnerGender)}
                      alt={selectedRoom.partnerName}
                      loading="lazy"
                      decoding="async"
                      className="w-8 h-8 rounded-full object-cover object-top shadow-sm mb-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getDefaultAvatar(selectedRoom.partnerGender);
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
            ))
          )}

          {/* 시간 표시 */}
          {messages.length > 0 && (
            <div className="text-center py-2">
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {messages[messages.length - 1]?.timestamp}
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

  // ==========================================
  // 채팅방 목록 화면
  // ==========================================
  return (
    <div className="px-4 py-6 pb-20 min-h-screen">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-display text-slate-800">채팅</h2>
          <div className="flex space-x-2">
            <button 
              onClick={loadChatRooms}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-primary-500 hover:shadow-md transition-all"
            >
              <i className="ri-refresh-line text-xl"></i>
            </button>
            <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-primary-500 hover:shadow-md transition-all">
              <i className="ri-search-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-40"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 채팅방 목록 */}
            <div className="space-y-4">
              {chatRooms.length > 0 && (
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                  매칭된 대화 ({chatRooms.length})
                </h3>
              )}
              {chatRooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => handleChatSelect(room)}
                  className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 cursor-pointer border border-slate-50 group transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={room.partnerAvatar || getDefaultAvatar(room.partnerGender)}
                        alt={room.partnerName}
                        loading="lazy"
                        decoding="async"
                        className="w-14 h-14 rounded-2xl object-cover object-top shadow-sm group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getDefaultAvatar(room.partnerGender);
                        }}
                      />
                      {room.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-slate-800 truncate text-base font-display group-hover:text-primary-600 transition-colors">
                          {room.partnerName}
                        </h3>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          {room.lastMessageTime}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${room.unreadCount > 0 ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                        {room.lastMessage}
                      </p>
                    </div>

                    {room.unreadCount > 0 && (
                      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-primary-500/30 animate-bounce">
                        {room.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 빈 상태 */}
            {chatRooms.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <i className="ri-chat-3-line text-4xl text-slate-300"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 font-display">아직 채팅이 없어요</h3>
                <p className="text-slate-500 mb-4">매칭이 성사되면 채팅을 시작할 수 있어요!</p>
                <p className="text-xs text-slate-400">
                  프로필 탭에서 마음에 드는 상대에게<br />
                  매칭 요청을 보내보세요 💕
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
