import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  name: string;
  phone_number: string;
  age: number;
  gender: string;
  location: string;
  school: string;
  mbti: string;
  profile_image: string;
  coins: number;
  created_at: string;
  last_login: string;
}

interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_name?: string;
  user2_name?: string;
  user1_avatar?: string;
  user2_avatar?: string;
  last_message: string;
  last_message_at: string;
  is_active: boolean;
  created_at: string;
  message_count?: number;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name?: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCoins: 0,
    totalChatRooms: 0,
    totalMessages: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData);
        const totalCoins = usersData.reduce((sum, u) => sum + (u.coins || 0), 0);
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          activeUsers: usersData.filter(u => u.last_login).length,
          totalCoins
        }));
      }

      const { count: roomCount } = await supabase
        .from('chat_rooms')
        .select('*', { count: 'exact', head: true });

      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      setStats(prev => ({
        ...prev,
        totalChatRooms: roomCount || 0,
        totalMessages: msgCount || 0
      }));

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatRooms = async () => {
    setLoading(true);
    try {
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      if (rooms && rooms.length > 0) {
        const userIds = new Set<string>();
        rooms.forEach(room => {
          userIds.add(room.user1_id);
          userIds.add(room.user2_id);
        });

        const { data: usersInfo } = await supabase
          .from('users')
          .select('id, name, profile_image')
          .in('id', Array.from(userIds));

        const userMap = new Map(
          (usersInfo || []).map(u => [u.id, u])
        );

        const roomsWithInfo = await Promise.all(
          rooms.map(async (room) => {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id);

            const user1 = userMap.get(room.user1_id);
            const user2 = userMap.get(room.user2_id);

            return {
              ...room,
              user1_name: user1?.name || '알 수 없음',
              user2_name: user2?.name || '알 수 없음',
              user1_avatar: user1?.profile_image,
              user2_avatar: user2?.profile_image,
              message_count: count || 0
            };
          })
        );

        setChatRooms(roomsWithInfo);
      } else {
        setChatRooms([]);
      }
    } catch (error) {
      console.error('채팅방 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (room: ChatRoom) => {
    setSelectedChatRoom(room);
    setLoadingMessages(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const senderIds = new Set((data || []).map(m => m.sender_id));
      const { data: senders } = await supabase
        .from('users')
        .select('id, name')
        .in('id', Array.from(senderIds));

      const senderMap = new Map(
        (senders || []).map(s => [s.id, s.name])
      );

      const messagesWithNames = (data || []).map(msg => ({
        ...msg,
        sender_name: senderMap.get(msg.sender_id) || '알 수 없음'
      }));

      setMessages(messagesWithNames);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'chats') {
      loadChatRooms();
    }
  }, [activeMenu]);

  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone_number || '').includes(searchQuery)
  );

  const handleGiveCoins = async () => {
    if (!selectedUser || !coinAmount) return;

    try {
      const newCoins = (selectedUser.coins || 0) + parseInt(coinAmount);
      
      const { error } = await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', selectedUser.id);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, coins: newCoins }
          : user
      ));
      setSelectedUser(prev => prev ? { ...prev, coins: newCoins } : null);
      setShowCoinModal(false);
      setCoinAmount('');
      alert('코인이 지급되었습니다!');
    } catch (error) {
      console.error('코인 지급 실패:', error);
      alert('코인 지급에 실패했습니다.');
    }
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  const renderDashboard = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">전체 유저</p>
          <p className="text-xl font-bold text-gray-800">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">활성 유저</p>
          <p className="text-xl font-bold text-green-600">{stats.activeUsers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">총 코인</p>
          <p className="text-xl font-bold text-yellow-600">{stats.totalCoins.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">채팅방</p>
          <p className="text-xl font-bold text-purple-600">{stats.totalChatRooms}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm col-span-2">
          <p className="text-xs text-gray-500">총 메시지</p>
          <p className="text-xl font-bold text-pink-600">{stats.totalMessages.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">최근 가입 유저</h3>
        <div className="space-y-2">
          {users.slice(0, 5).map(user => (
            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {(user.name || '?')[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{user.name || '이름 없음'}</p>
                  <p className="text-xs text-gray-500">{user.phone_number}</p>
                </div>
              </div>
              <p className="text-xs font-medium text-yellow-600">{user.coins || 0} 코인</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUserList = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-3 border-b">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 전화번호 검색..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
        {filteredUsers.map(user => (
          <div key={user.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user.name || '?')[0]
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{user.name || '이름 없음'}</p>
                  <p className="text-xs text-gray-500">{user.phone_number || '-'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(user)}
                className="text-pink-500 text-sm font-medium"
              >
                상세
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center">
                <i className="ri-coin-line text-yellow-500 mr-1"></i>
                {user.coins || 0}
              </span>
              <span>{user.gender === 'male' ? '남' : user.gender === 'female' ? '여' : '-'}</span>
              <span>{user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="p-8 text-center text-gray-500 text-sm">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );

  const renderChatManagement = () => (
    <div className="space-y-4">
      {selectedChatRoom && (
        <button
          onClick={() => setSelectedChatRoom(null)}
          className="flex items-center text-pink-500 text-sm"
        >
          <i className="ri-arrow-left-line mr-1"></i>
          채팅방 목록으로
        </button>
      )}

      {!selectedChatRoom ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">채팅방 목록</h3>
            <button 
              onClick={loadChatRooms}
              className="text-xs text-pink-500"
            >
              <i className="ri-refresh-line mr-1"></i>새로고침
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm">로딩 중...</div>
            ) : chatRooms.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">채팅방이 없습니다.</div>
            ) : (
              chatRooms.map(room => (
                <div
                  key={room.id}
                  onClick={() => loadMessages(room)}
                  className="p-3 border-b cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {(room.user1_name || '?')[0]}
                      </div>
                      <i className="ri-arrow-left-right-line text-gray-400 text-sm"></i>
                      <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">
                        {(room.user2_name || '?')[0]}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{room.message_count}개</span>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-800">
                    {room.user1_name} ↔ {room.user2_name}
                  </p>

                  {room.last_message && (
                    <p className="text-xs text-gray-500 mt-1 truncate">"{room.last_message}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 border-b">
            <h3 className="font-bold text-gray-800 text-sm">
              💬 {selectedChatRoom.user1_name} ↔ {selectedChatRoom.user2_name}
            </h3>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            {loadingMessages ? (
              <div className="text-center text-gray-500 py-10 text-sm">로딩 중...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <i className="ri-message-3-line text-3xl text-gray-300 mb-2 block"></i>
                <p className="text-sm">메시지가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === selectedChatRoom.user1_id ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] ${
                      msg.sender_id === selectedChatRoom.user1_id 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'bg-pink-100 text-pink-900'
                    } rounded-xl px-3 py-2`}>
                      <p className="text-xs font-medium mb-1 opacity-70">{msg.sender_name}</p>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-[10px] mt-1 opacity-50">
                        {new Date(msg.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 헤더 */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center"
        >
          <i className="ri-menu-line text-xl text-gray-600"></i>
        </button>
        <h1 className="font-bold text-gray-800">관리자</h1>
        <button
          onClick={() => navigate('/home')}
          className="w-10 h-10 flex items-center justify-center"
        >
          <i className="ri-home-line text-xl text-gray-600"></i>
        </button>
      </div>

      {/* 사이드바 오버레이 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div className={`fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50 transform transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <i className="ri-admin-line text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">관리자</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center"
          >
            <i className="ri-close-line text-xl text-gray-500"></i>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => handleMenuClick('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              activeMenu === 'dashboard' ? 'bg-pink-50 text-pink-600' : 'text-gray-600'
            }`}
          >
            <i className="ri-dashboard-line text-xl"></i>
            <span className="font-medium">대시보드</span>
          </button>
          
          <button
            onClick={() => handleMenuClick('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              activeMenu === 'users' ? 'bg-pink-50 text-pink-600' : 'text-gray-600'
            }`}
          >
            <i className="ri-user-line text-xl"></i>
            <span className="font-medium">유저 관리</span>
          </button>

          <button
            onClick={() => handleMenuClick('chats')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              activeMenu === 'chats' ? 'bg-pink-50 text-pink-600' : 'text-gray-600'
            }`}
          >
            <i className="ri-chat-3-line text-xl"></i>
            <span className="font-medium">채팅 관리</span>
          </button>
          
          <button
            onClick={() => handleMenuClick('reports')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              activeMenu === 'reports' ? 'bg-pink-50 text-pink-600' : 'text-gray-600'
            }`}
          >
            <i className="ri-flag-line text-xl"></i>
            <span className="font-medium">신고 관리</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={() => navigate('/home')}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl"
          >
            <i className="ri-logout-box-line text-xl"></i>
            <span className="font-medium">메인으로</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-4 pt-20 pb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {activeMenu === 'dashboard' && '대시보드'}
            {activeMenu === 'users' && '유저 관리'}
            {activeMenu === 'chats' && '채팅 관리'}
            {activeMenu === 'reports' && '신고 관리'}
          </h2>
        </div>

        {activeMenu === 'dashboard' && renderDashboard()}
        {activeMenu === 'users' && renderUserList()}
        {activeMenu === 'chats' && renderChatManagement()}
        {activeMenu === 'reports' && (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <i className="ri-flag-line text-3xl text-gray-300 mb-2 block"></i>
            <p className="text-gray-500 text-sm">신고 내역이 없습니다</p>
          </div>
        )}
      </div>

      {/* 유저 상세 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">유저 상세</h3>
              <button onClick={() => setSelectedUser(null)}>
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {selectedUser.profile_image ? (
                    <img src={selectedUser.profile_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (selectedUser.name || '?')[0]
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{selectedUser.name || '이름 없음'}</h4>
                  <p className="text-gray-500 text-sm">{selectedUser.phone_number}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">나이</p>
                    <p className="font-medium text-sm">{selectedUser.age || '-'}세</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">성별</p>
                    <p className="font-medium text-sm">
                      {selectedUser.gender === 'male' ? '남성' : selectedUser.gender === 'female' ? '여성' : '-'}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">보유 코인</p>
                  <p className="text-xl font-bold text-yellow-600">{selectedUser.coins || 0}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">ID</p>
                  <p className="font-mono text-xs break-all">{selectedUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => setShowCoinModal(true)}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl font-medium text-sm"
              >
                <i className="ri-coin-line mr-2"></i>코인 지급
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 코인 지급 모달 */}
      {showCoinModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-4">
            <h3 className="font-bold mb-3">코인 지급</h3>
            <p className="text-gray-500 mb-3 text-sm">{selectedUser.name}님에게 지급</p>
            
            <input
              type="number"
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
              placeholder="코인 수"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl mb-4 text-sm"
            />

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCoinModal(false);
                  setCoinAmount('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm"
              >
                취소
              </button>
              <button
                onClick={handleGiveCoins}
                disabled={!coinAmount || parseInt(coinAmount) <= 0}
                className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-medium disabled:opacity-50 text-sm"
              >
                지급
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
