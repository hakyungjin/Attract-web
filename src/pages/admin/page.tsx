import { useState, useEffect } from 'react';
import { firebase } from '../../lib/firebaseService';

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
  bank_account?: string;
  account_holder?: string;
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

interface PaymentRequest {
  id: string;
  user_id: string;
  user_name?: string;
  user_phone?: string;
  bank_account?: string;
  account_holder?: string;
  coins: number;
  price: number;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCoins: 0,
    totalChatRooms: 0,
    totalMessages: 0
  });

  const handleAdminLogin = () => {
    if (adminPassword === '5174') {
      setIsAuthenticated(true);
      setPasswordError('');
      setAdminPassword('');
    } else {
      setPasswordError('관리자 코드가 잘못되었습니다.');
      setAdminPassword('');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { users: usersData } = await firebase.users.getAllUsers(1000);

      if (usersData) {
        setUsers(usersData as any);
        const totalCoins = usersData.reduce((sum, u) => sum + (u.coins || 0), 0);
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          activeUsers: usersData.filter(u => u.last_login).length,
          totalCoins
        }));
      }

      const { chatRooms: roomsData } = await firebase.chat.getAllChatRooms(1000);
      
      setStats(prev => ({
        ...prev,
        totalChatRooms: roomsData.length,
        totalMessages: 0 // Firebase에서는 전체 메시지 수를 가져오기 어려움
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
      const { chatRooms: rooms, error } = await firebase.chat.getAllChatRooms(100);

      if (error) throw error;

      if (rooms && rooms.length > 0) {
        const userIds = new Set<string>();
        rooms.forEach(room => {
          userIds.add(room.user1_id);
          userIds.add(room.user2_id);
        });

        const roomsWithInfo = await Promise.all(
          rooms.map(async (room) => {
            const { user: user1 } = await firebase.users.getUserById(room.user1_id);
            const { user: user2 } = await firebase.users.getUserById(room.user2_id);
            const { messages } = await firebase.chat.getMessages(room.id, 1);

            return {
              ...room,
              user1_name: user1?.name || '알 수 없음',
              user2_name: user2?.name || '알 수 없음',
              user1_avatar: user1?.profile_image || user1?.avatar_url,
              user2_avatar: user2?.profile_image || user2?.avatar_url,
              message_count: messages.length // 실제로는 더 많을 수 있음
            };
          })
        );

        setChatRooms(roomsWithInfo as any);
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
      const { messages: data, error } = await firebase.chat.getMessages(room.id, 100);

      if (error) throw error;

      const messagesWithInfo = await Promise.all((data || []).map(async (m) => {
        const { user: sender } = await firebase.users.getUserById(m.sender_id);
        return {
          ...m,
          sender_name: sender?.name || '알 수 없음'
        };
      }));

      setMessages(messagesWithInfo as any);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'chats') {
      loadChatRooms();
    } else if (activeMenu === 'payments') {
      loadPaymentRequests();
    }
  }, [activeMenu]);

  const loadPaymentRequests = async () => {
    setLoading(true);
    try {
      const { payments, error } = await firebase.payments.getAllPayments();
      
      if (error) throw error;

      if (payments && payments.length > 0) {
        const paymentsWithUserInfo = await Promise.all(
          payments.map(async (payment: any) => {
            const { user } = await firebase.users.getUserById(payment.user_id);
            const userInfo = user as any;
            return {
              ...payment,
              user_name: userInfo?.name || '알 수 없음',
              user_phone: userInfo?.phone_number || '-',
              bank_account: userInfo?.bank_account || '-',
              account_holder: userInfo?.account_holder || '-'
            };
          })
        );

        setPaymentRequests(paymentsWithUserInfo as any);
      } else {
        setPaymentRequests([]);
      }
    } catch (error) {
      console.error('입금 신청 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone_number || '').includes(searchQuery)
  );

  const handleGiveCoins = async () => {
    if (!selectedUser || !coinAmount) return;

    try {
      const amount = parseInt(coinAmount);
      const { error } = await firebase.coins.incrementCoins(selectedUser.id, amount);

      if (error) throw error;

      const newCoins = (selectedUser.coins || 0) + amount;
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

  const renderPaymentManagement = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm">입금 신청 내역</h3>
          <button 
            onClick={loadPaymentRequests}
            className="text-xs text-pink-500"
          >
            <i className="ri-refresh-line mr-1"></i>새로고침
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">로딩 중...</div>
          ) : paymentRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">입금 신청이 없습니다.</div>
          ) : (
            paymentRequests.map(payment => (
              <div
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  payment.status === 'pending' ? 'bg-yellow-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{payment.user_name}</p>
                    <p className="text-xs text-gray-500">{payment.user_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">{payment.coins.toLocaleString()} 자석</p>
                    <p className="text-xs text-gray-500">{payment.price.toLocaleString()}원</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    payment.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-700'
                      : payment.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {payment.status === 'pending' ? '확인 중' : payment.status === 'completed' ? '완료' : '취소'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(payment.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedPayment && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">입금 신청 상세</h3>
            <button
              onClick={() => setSelectedPayment(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">신청자</p>
              <p className="font-bold text-gray-800">{selectedPayment.user_name}</p>
              <p className="text-xs text-gray-500">{selectedPayment.user_phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">자석</p>
                <p className="font-bold text-gray-800">{selectedPayment.coins.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">금액</p>
                <p className="font-bold text-gray-800">{selectedPayment.price.toLocaleString()}원</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">입금 계좌</p>
              <p className="font-bold text-gray-800">{selectedPayment.bank_account}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">입금자 명</p>
              <p className="font-bold text-gray-800">{selectedPayment.account_holder}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">신청 시간</p>
              <p className="font-bold text-gray-800">{new Date(selectedPayment.created_at).toLocaleString('ko-KR')}</p>
            </div>

            <div className={`rounded-lg p-3 text-center ${
              selectedPayment.status === 'pending' 
                ? 'bg-yellow-50'
                : selectedPayment.status === 'completed'
                ? 'bg-green-50'
                : 'bg-gray-50'
            }`}>
              <p className="text-xs text-gray-500 mb-1">상태</p>
              <p className={`font-bold ${
                selectedPayment.status === 'pending' 
                  ? 'text-yellow-700'
                  : selectedPayment.status === 'completed'
                  ? 'text-green-700'
                  : 'text-gray-700'
              }`}>
                {selectedPayment.status === 'pending' ? '확인 중' : selectedPayment.status === 'completed' ? '완료' : '취소'}
              </p>
            </div>
          </div>
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

  // 인증되지 않았을 때 로그인 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <i className="ri-admin-line text-white text-2xl"></i>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            관리자 패널
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            관리자 코드를 입력해주세요
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="관리자 코드"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-lg tracking-widest"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2 text-center">{passwordError}</p>
              )}
            </div>

            <button
              onClick={handleAdminLogin}
              disabled={!adminPassword}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              관리자 로그인
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            본 사이트와 독립적으로 운영됩니다
          </p>
        </div>
      </div>
    );
  }

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
        <div className="w-10 h-10 flex items-center justify-center"></div>
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
            onClick={() => handleMenuClick('payments')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              activeMenu === 'payments' ? 'bg-pink-50 text-pink-600' : 'text-gray-600'
            }`}
          >
            <i className="ri-bank-card-line text-xl"></i>
            <span className="font-medium">입금 신청</span>
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
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-logout-box-line text-xl"></i>
            <span className="font-medium">로그아웃</span>
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
            {activeMenu === 'payments' && '입금 신청'}
            {activeMenu === 'reports' && '신고 관리'}
          </h2>
        </div>

        {activeMenu === 'dashboard' && renderDashboard()}
        {activeMenu === 'users' && renderUserList()}
        {activeMenu === 'chats' && renderChatManagement()}
        {activeMenu === 'payments' && renderPaymentManagement()}
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

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">입금 계좌</p>
                  <p className="font-medium text-sm break-all">
                    {(selectedUser as any).bank_account || '-'}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">입금자 명</p>
                  <p className="font-medium text-sm">
                    {(selectedUser as any).account_holder || '-'}
                  </p>
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
