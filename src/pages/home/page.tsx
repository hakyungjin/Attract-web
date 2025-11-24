import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/base/Header';
import TabBar from '../../components/base/TabBar';
import MatchingTab from './components/MatchingTab';
import CommunityTab from './components/CommunityTab';
import ChatTab from './components/ChatTab';
import ProfileTab from './components/ProfileTab';

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matching');
  const [coins, setCoins] = useState(150);

  useEffect(() => {
    // 로그인 체크
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

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
    <div className="min-h-screen bg-gray-50">
      <Header coins={coins} />
      <main className="pt-16 pb-20">
        {renderContent()}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
