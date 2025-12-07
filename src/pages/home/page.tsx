import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/base/Header';
import TabBar from '../../components/base/TabBar';
import MatchingTab from './components/MatchingTab';
import CommunityTab from './components/CommunityTab';
import ChatTab from './components/ChatTab';
import ProfileTab from './components/ProfileTab';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('matching');
  const [coins, setCoins] = useState(0);
  const [isInChatView, setIsInChatView] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true); // 데이터 로딩 상태
  const [communityKey, setCommunityKey] = useState(0); // 커뮤니티 새로고침용 key

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

  // 게시물 작성 후 돌아왔을 때 커뮤니티 탭 새로고침
  useEffect(() => {
    const state = location.state as { refreshCommunity?: boolean; activeTab?: string } | null;
    if (state?.refreshCommunity) {
      // 커뮤니티 탭으로 전환
      if (state.activeTab) {
        setActiveTab(state.activeTab);
      }
      // 커뮤니티 탭 새로고침 (key 변경으로 컴포넌트 리마운트)
      setCommunityKey(prev => prev + 1);
      // state 초기화 (뒤로가기 시 다시 새로고침 방지)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // 로그인 체크 - Supabase 인증 또는 로컬 스토리지 확인
    if (!loading) {
      const localUser = localStorage.getItem('user');
      if (!user && !localUser) {
        navigate('/login');
      }
    }
  }, [loading, user, navigate]);

  // 데이터 로딩 (코인, 채팅 등)
  useEffect(() => {
    const loadInitialData = async () => {
      if (loading) return; // auth 로딩 중이면 대기
      
      const localUser = localStorage.getItem('user');
      const userId = user?.id || (localUser ? JSON.parse(localUser).id : null);
      
      if (!userId) {
        setIsDataLoading(false);
        return;
      }

      try {
        // 병렬로 데이터 로드
        const [userDataResult, chatRoomsResult] = await Promise.all([
          // 유저 정보 (코인 등)
          supabase
            .from('users')
            .select('coins')
            .eq('id', userId)
            .single(),
          // 채팅방 목록 프리로드
          supabase
            .from('chat_rooms')
            .select('id')
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .limit(10)
        ]);

        if (userDataResult.data) {
          setCoins(userDataResult.data.coins || 0);
        }

        // 최소 로딩 시간 보장 (너무 빠르면 깜빡임)
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadInitialData();
  }, [loading, user]);

  // 로딩 중일 때 표시 (자동 로그인 체크 + 데이터 로딩)
  if (loading || isDataLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          {/* 로고 */}
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-8">
            <img
              src="/image/icon.png"
              alt="Attract Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          
          {/* 로딩 스피너 */}
          <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
          
          {/* 텍스트 */}
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            {loading ? '로그인 확인 중' : '데이터 불러오는 중'}
          </h2>
          <p className="text-slate-400 text-sm">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'matching':
        return <MatchingTab />;
      case 'community':
        // key가 변경되면 컴포넌트가 리마운트되어 새로고침됨
        return <CommunityTab key={communityKey} />;
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
