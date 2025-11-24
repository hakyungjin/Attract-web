import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  location: string;
  school: string;
  mbti: string;
  avatar: string;
  coins: number;
  status: 'active' | 'inactive' | 'banned';
  lastLogin: string;
  createdAt: string;
  matchCount: number;
  messageCount: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: '하얀눈방울e',
      email: 'snow@example.com',
      age: 22,
      gender: '여자',
      location: '서울 금천구',
      school: '서울디지털대학교',
      mbti: 'ISFP',
      avatar: 'https://lovelyharu.com/data/character/thumb-TTHVyEtmHJ_1725434222_300x300.jpg',
      coins: 150,
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      createdAt: '2023-12-01',
      matchCount: 23,
      messageCount: 156
    },
    {
      id: 2,
      name: '나만의아기고양이',
      email: 'cat@example.com',
      age: 20,
      gender: '여자',
      location: '대전 중구',
      school: '한밭대학교',
      mbti: 'ISTP',
      avatar: 'https://lovelyharu.com/data/character/thumb-HWHHTbQhNX_1736148423_300x300.jpg',
      coins: 80,
      status: 'active',
      lastLogin: '2024-01-15 13:15',
      createdAt: '2023-11-15',
      matchCount: 15,
      messageCount: 89
    },
    {
      id: 3,
      name: '세잎이',
      email: 'clover@example.com',
      age: 19,
      gender: '여자',
      location: '충남 아산시',
      school: '선문대학교',
      mbti: 'ESTP',
      avatar: 'https://lovelyharu.com/data/character/thumb-KOAXjl7vXB_1725434279_300x300.jpg',
      coins: 200,
      status: 'active',
      lastLogin: '2024-01-15 11:20',
      createdAt: '2023-10-20',
      matchCount: 31,
      messageCount: 234
    },
    {
      id: 4,
      name: '띠로리이',
      email: 'ddirori@example.com',
      age: 27,
      gender: '여자',
      location: '서울 금천구',
      school: '서울대학교',
      mbti: 'ESTJ',
      avatar: 'https://lovelyharu.com/data/character/thumb-CEZVu9Um98_1725434222_300x300.jpg',
      coins: 50,
      status: 'inactive',
      lastLogin: '2024-01-10 09:00',
      createdAt: '2023-09-05',
      matchCount: 8,
      messageCount: 45
    },
    {
      id: 5,
      name: '으아니',
      email: 'uani@example.com',
      age: 19,
      gender: '여자',
      location: '서울 광진구',
      school: '세종대학교',
      mbti: 'ISTJ',
      avatar: 'https://lovelyharu.com/data/character/thumb-ANSXxJWhNK_1717561056_300x300.jpg',
      coins: 120,
      status: 'active',
      lastLogin: '2024-01-15 10:45',
      createdAt: '2023-08-12',
      matchCount: 19,
      messageCount: 112
    },
    {
      id: 6,
      name: '달콤소소찡',
      email: 'sweet@example.com',
      age: 23,
      gender: '여자',
      location: '전북 전주시',
      school: '예원예술대학교',
      mbti: 'ENTP',
      avatar: 'https://lovelyharu.com/data/character/thumb-HZJBTbg55v_1736148423_300x300.jpg',
      coins: 300,
      status: 'active',
      lastLogin: '2024-01-14 22:30',
      createdAt: '2023-07-28',
      matchCount: 42,
      messageCount: 389
    },
    {
      id: 7,
      name: '어피치',
      email: 'apeach@example.com',
      age: 24,
      gender: '여자',
      location: '서울 강남구',
      school: '한양대학교',
      mbti: 'ESTP',
      avatar: 'https://lovelyharu.com/data/character/thumb-UEAPrPtjRq_1722489509_300x300.jpg',
      coins: 0,
      status: 'banned',
      lastLogin: '2024-01-05 15:00',
      createdAt: '2023-06-10',
      matchCount: 5,
      messageCount: 23
    }
  ]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalCoins: users.reduce((sum, u) => sum + u.coins, 0),
    todayLogins: users.filter(u => u.lastLogin.includes('2024-01-15')).length
  };

  const handleGiveCoins = () => {
    if (selectedUser && coinAmount) {
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, coins: user.coins + parseInt(coinAmount) }
          : user
      ));
      setSelectedUser(prev => prev ? { ...prev, coins: prev.coins + parseInt(coinAmount) } : null);
      setShowCoinModal(false);
      setCoinAmount('');
    }
  };

  const handleStatusChange = (userId: number, newStatus: 'active' | 'inactive' | 'banned') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">전체 유저</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-xl text-blue-600"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">활성 유저</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-user-follow-line text-xl text-green-600"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">총 코인</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalCoins}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="ri-coin-line text-xl text-yellow-600"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">오늘 접속</p>
              <p className="text-2xl font-bold text-purple-600">{stats.todayLogins}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="ri-login-box-line text-xl text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 접속 유저 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">최근 접속 유저</h3>
        <div className="space-y-3">
          {users
            .sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime())
            .slice(0, 5)
            .map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover object-top" />
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.lastLogin}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-600' :
                  user.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '정지'}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderUserList = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 검색 */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="유저 이름 또는 이메일 검색..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* 유저 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유저</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">코인</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">최근 접속</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover object-top" />
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-1">
                    <i className="ri-coin-line text-yellow-500"></i>
                    <span className="font-medium">{user.coins}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-600' :
                    user.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '정지'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">{user.lastLogin}</td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-pink-500 hover:text-pink-600 font-medium text-sm cursor-pointer"
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg z-40">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <i className="ri-admin-line text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">관리자</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
              activeMenu === 'dashboard' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-dashboard-line text-xl"></i>
            <span className="font-medium">대시보드</span>
          </button>
          
          <button
            onClick={() => setActiveMenu('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
              activeMenu === 'users' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-user-line text-xl"></i>
            <span className="font-medium">유저 관리</span>
          </button>
          
          <button
            onClick={() => setActiveMenu('reports')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
              activeMenu === 'reports' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-flag-line text-xl"></i>
            <span className="font-medium">신고 관리</span>
          </button>
          
          <button
            onClick={() => setActiveMenu('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
              activeMenu === 'settings' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-settings-line text-xl"></i>
            <span className="font-medium">설정</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
          >
            <i className="ri-logout-box-line text-xl"></i>
            <span className="font-medium">메인으로</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeMenu === 'dashboard' && '대시보드'}
              {activeMenu === 'users' && '유저 관리'}
              {activeMenu === 'reports' && '신고 관리'}
              {activeMenu === 'settings' && '설정'}
            </h2>
            <p className="text-gray-500 mt-1">
              {activeMenu === 'dashboard' && '서비스 현황을 한눈에 확인하세요'}
              {activeMenu === 'users' && '유저 정보를 관리하고 코인을 지급하세요'}
              {activeMenu === 'reports' && '신고된 유저를 확인하고 처리하세요'}
              {activeMenu === 'settings' && '서비스 설정을 관리하세요'}
            </p>
          </div>

          {/* 콘텐츠 */}
          {activeMenu === 'dashboard' && renderDashboard()}
          {activeMenu === 'users' && renderUserList()}
          {activeMenu === 'reports' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-flag-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">신고 내역이 없습니다</h3>
              <p className="text-gray-500">신고된 유저가 없습니다</p>
            </div>
          )}
          {activeMenu === 'settings' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-settings-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">설정</h3>
              <p className="text-gray-500">설정 기능은 준비 중입니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 유저 상세 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">유저 상세 정보</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 flex items-center justify-center cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* 프로필 */}
              <div className="flex items-center space-x-4 mb-6">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-20 h-20 rounded-full object-cover object-top" />
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedUser.name}</h4>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedUser.status === 'active' ? 'bg-green-100 text-green-600' :
                    selectedUser.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {selectedUser.status === 'active' ? '활성' : selectedUser.status === 'inactive' ? '비활성' : '정지'}
                  </span>
                </div>
              </div>

              {/* 정보 */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">나이</p>
                    <p className="font-medium">{selectedUser.age}세</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">성별</p>
                    <p className="font-medium">{selectedUser.gender}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">지역</p>
                    <p className="font-medium">{selectedUser.location}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">MBTI</p>
                    <p className="font-medium">{selectedUser.mbti}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">학교</p>
                  <p className="font-medium">{selectedUser.school}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">코인</p>
                    <p className="font-bold text-yellow-600">{selectedUser.coins}</p>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">매칭</p>
                    <p className="font-bold text-pink-600">{selectedUser.matchCount}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">메시지</p>
                    <p className="font-bold text-blue-600">{selectedUser.messageCount}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">최근 접속</p>
                  <p className="font-medium">{selectedUser.lastLogin}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">가입일</p>
                  <p className="font-medium">{selectedUser.createdAt}</p>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowCoinModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-coin-line mr-2"></i>
                  코인 지급
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'active')}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedUser.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                    }`}
                  >
                    활성화
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'inactive')}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedUser.status === 'inactive' 
                        ? 'bg-gray-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    비활성화
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'banned')}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedUser.status === 'banned' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                    }`}
                  >
                    정지
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 코인 지급 모달 */}
      {showCoinModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">코인 지급</h3>
            <p className="text-gray-500 mb-4">{selectedUser.name}님에게 코인을 지급합니다</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">지급할 코인 수</label>
              <input
                type="number"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCoinModal(false);
                  setCoinAmount('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium cursor-pointer whitespace-nowrap"
              >
                취소
              </button>
              <button
                onClick={handleGiveCoins}
                disabled={!coinAmount || parseInt(coinAmount) <= 0}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl font-medium disabled:opacity-50 cursor-pointer whitespace-nowrap"
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
