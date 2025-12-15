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
    // 모든 관련 localStorage 데이터 삭제
    localStorage.removeItem('auth_user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_data');
    // 페이지 새로고침으로 상태 초기화
    window.location.href = '/login';
  };

  return (
    <>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] glass z-50 transition-all duration-300" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 py-1 h-14">
          {/* 로고 */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/home')}>
            <h1 className="flex items-center space-x-1 group">
              <div className="relative transform transition-transform group-hover:scale-110 duration-300 -my-2">
                <img 
                  src="/image/icon.png" 
                  alt="Attract 마스코트" 
                  className="w-14 h-14 object-contain drop-shadow-md"
                />
              </div>
              <span className="text-xl font-bold font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent tracking-tight">
                Attract
              </span>
            </h1>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-2">
            {/* 자석 */}
            <button
              onClick={() => navigate('/coin-shop')}
              className="group flex items-center gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5"
            >
              <img 
                src="/image/magnet.png" 
                alt="자석" 
                className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform"
              />
              <span className="text-sm font-bold font-display pr-1">{coins.toLocaleString()}</span>
            </button>

            {/* 알림 */}
            <button
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors relative group"
            >
              <i className="ri-notification-line text-slate-600 text-xl group-hover:text-primary-600 transition-colors"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
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
              <p className="font-bold text-slate-800">{authUser?.name || '사용자'}님</p>
            </div>

            <div className="py-2">
              {[
                {
                  icon: 'ri-user-line',
                  label: '마이페이지',
                  action: () => {
                    setShowMenu(false);
                    navigate('/home');
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
