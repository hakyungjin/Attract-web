import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  coins?: number;
}

export default function Header({ coins = 0 }: HeaderProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const unreadCount = 2; // 읽지 않은 알림 수

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* 로고 */}
          <div className="flex items-center">
            <h1 className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="w-7 h-7 flex items-center justify-center">
                    <i className="ri-heart-fill text-white text-lg"></i>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Attract
              </span>
            </h1>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-3">
            {/* 자석 */}
            <button 
              onClick={() => navigate('/coin-shop')}
              className="flex items-center space-x-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1.5 rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-copper-coin-fill text-sm"></i>
              </div>
              <span className="text-sm font-semibold">{coins}</span>
            </button>

            {/* 알림 */}
            <button 
              onClick={() => navigate('/notifications')}
              className="w-8 h-8 flex items-center justify-center cursor-pointer relative"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-notification-line text-gray-600"></i>
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 메뉴 */}
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-menu-line text-gray-600"></i>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 메뉴 드롭다운 */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg py-2 w-48">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-user-line text-gray-600"></i>
                </div>
                <span>마이페이지</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-settings-line text-gray-600"></i>
                </div>
                <span>설정</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-question-line text-gray-600"></i>
                </div>
                <span>FAQ</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-customer-service-line text-gray-600"></i>
                </div>
                <span>1:1문의</span>
              </div>
            </button>
            <hr className="my-2" />
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-logout-box-line"></i>
                </div>
                <span>로그아웃</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
