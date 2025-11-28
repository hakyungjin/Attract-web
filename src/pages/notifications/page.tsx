import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  type: 'like' | 'match' | 'message' | 'community';
  message: string;
  time: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authUser?.id) {
      loadNotifications();
    }
  }, [authUser?.id]);

  const loadNotifications = async () => {
    try {
      if (!authUser?.id) {
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      console.log('알림 로드 시작:', authUser.id);

      // Supabase에서 알림 데이터 로드 (RLS가 user_id 필터링)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('알림 로드 오류:', error);
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      console.log('로드된 알림:', data);

      // 데이터 변환
      const formattedNotifications = (data || []).map(notification => ({
        id: notification.id,
        type: notification.type as 'like' | 'match' | 'message' | 'community',
        message: notification.message || notification.content || '',
        time: formatTimeAgo(notification.created_at),
        isRead: notification.read || false
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('알림 로드 실패:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 시간 포맷팅 함수
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'ri-heart-fill text-red-500';
      case 'match':
        return 'ri-user-heart-fill text-pink-500';
      case 'message':
        return 'ri-message-fill text-blue-500';
      case 'community':
        return 'ri-chat-3-fill text-green-500';
      default:
        return 'ri-notification-fill text-gray-500';
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-left-line text-gray-700 text-xl"></i>
              </div>
            </button>
            <h1 className="text-lg font-bold">알림</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          {notifications.length > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer whitespace-nowrap"
            >
              모두 읽음
            </button>
          )}
        </div>
      </header>

      {/* 알림 목록 */}
      <main className="pt-16 pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <i className="ri-notification-off-line text-4xl text-gray-300"></i>
              </div>
            </div>
            <p className="text-gray-500 text-center">새로운 알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                  !notification.isRead ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <i className={getNotificationIcon(notification.type) + ' text-2xl'}></i>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-close-line text-gray-400"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
