import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  coins?: number;
}

export default function Header({ coins = 0 }: HeaderProps) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 읽지 않은 알림 개수 로드
  useEffect(() => {
    if (!authUser?.id) return;
    
    loadUnreadCount();

    // 30초마다 알림 개수 갱신
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [authUser?.id]);

  const loadUnreadCount = async () => {
    try {
      if (!authUser?.id) {
        setUnreadCount(0);
        return;
      }

      // RLS 정책이 자동으로 user_id를 필터링하므로 user_id 필터는 추가하지 않음
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('알림 개수 로드 실패:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 glass z-50 transition-all duration-300">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
          {/* 로고 */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="flex items-center space-x-2 group">
              <div className="relative transform transition-transform group-hover:scale-110 duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <div className="w-7 h-7 flex items-center justify-center">
                    <i className="ri-heart-fill text-white text-xl animate-pulse-soft"></i>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-400 rounded-full border-2 border-white animate-bounce"></div>
              </div>
              <span className="text-2xl font-bold font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent tracking-tight">
                Attract
              </span>
            </h1>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-3">
            {/* 자석 */}
            <button
              onClick={() => navigate('/coin-shop')}
              className="group flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:-translate-y-0.5"
            >
              <i className="ri-copper-coin-fill text-lg group-hover:rotate-12 transition-transform"></i>
              <span className="text-sm font-bold font-display">{coins.toLocaleString()}</span>
            </button>

            {/* 알림 */}
            <button
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors relative group"
            >
              <i className="ri-notification-line text-slate-600 text-xl group-hover:text-primary-600 transition-colors"></i>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 메뉴 */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors group"
            >
              <i className={`ri-menu-line text-slate-600 text-xl group-hover:text-primary-600 transition-colors ${showMenu ? 'rotate-90' : ''} duration-300`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* 메뉴 드롭다운 */}
      {showMenu && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setShowMenu(false)} />
          <div className="fixed top-20 right-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl py-2 w-56 z-50 animate-slide-up border border-white/20">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm text-slate-500">환영합니다!</p>
              <p className="font-bold text-slate-800">사용자님</p>
            </div>

            <div className="py-2">
              {[
                {
                  icon: 'ri-user-line',
                  label: '마이페이지',
                  action: () => {
                    setShowMenu(false);
                    navigate('/');
                    // 프로필 탭으로 전환하는 이벤트 발생
                    setTimeout(() => {
                      const event = new CustomEvent('switchTab', { detail: { tab: 'profile' } });
                      window.dispatchEvent(event);
                    }, 100);
                  }
                },
                {
                  icon: 'ri-settings-line',
                  label: '설정',
                  action: () => {
                    setShowMenu(false);
                    navigate('/settings');
                  }
                },
                {
                  icon: 'ri-question-line',
                  label: 'FAQ',
                  action: () => {
                    setShowMenu(false);
                    navigate('/faq');
                  }
                },
                {
                  icon: 'ri-customer-service-line',
                  label: '1:1문의',
                  action: () => {
                    setShowMenu(false);
                    navigate('/support');
                  }
                },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full text-left px-4 py-2.5 hover:bg-primary-50 text-slate-600 hover:text-primary-600 transition-colors flex items-center space-x-3 group"
                >
                  <i className={`${item.icon} text-lg group-hover:scale-110 transition-transform`}></i>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors flex items-center space-x-3 group"
              >
                <i className="ri-logout-box-line text-lg group-hover:scale-110 transition-transform"></i>
                <span className="font-medium">로그아웃</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
