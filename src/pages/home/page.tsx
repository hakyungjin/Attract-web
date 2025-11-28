import { useState, useEffect } from 'react';
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
        return <ChatTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <MatchingTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header coins={coins} />
      <main className="pt-20 pb-28 px-4 max-w-screen-xl mx-auto">
        {renderContent()}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
