import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/base/Header';
import TabBar from '../../components/base/TabBar';
import MatchingTab from './components/MatchingTab';
import CommunityTab from './components/CommunityTab';
import ChatTab from './components/ChatTab';
import ProfileTab from './components/ProfileTab';

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('matching');
  const [coins] = useState(150);
  const [isInChatView, setIsInChatView] = useState(false);

  /**
   * 탭 변경 핸들러 - 탭 전환 시 스크롤을 맨 위로 이동
   * @param tab - 전환할 탭 이름
   */
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // 스크롤을 맨 위로 부드럽게 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 페이지 진입 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    // 로그인 체크 - Supabase 인증 또는 로컬 스토리지 확인
    if (!loading) {
      const localUser = localStorage.getItem('user');
      if (!user && !localUser) {
        navigate('/login');
      }
    }
  }, [loading, user, navigate]);

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'matching':
        return <MatchingTab />;
      case 'community':
        return <CommunityTab />;
      case 'chat':
        return <ChatTab onChatViewChange={setIsInChatView} />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <MatchingTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {!isInChatView && <Header coins={coins} />}
      <main 
        className={isInChatView ? '' : 'pb-28'}
        style={isInChatView ? {} : { paddingTop: 'calc(5rem + env(safe-area-inset-top))' }}
      >
        {renderContent()}
      </main>
      {!isInChatView && <TabBar activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  );
}
