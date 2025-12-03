

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'matching', icon: 'ri-heart-3-line', activeIcon: 'ri-heart-3-fill', label: '매칭' },
    { id: 'community', icon: 'ri-group-line', activeIcon: 'ri-group-fill', label: '커뮤니티' },
    { id: 'chat', icon: 'ri-chat-3-line', activeIcon: 'ri-chat-3-fill', label: '채팅' },
    { id: 'profile', icon: 'ri-user-line', activeIcon: 'ri-user-fill', label: 'My' },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] z-50 bg-white border-t border-gray-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
            >
              <i className={`text-2xl ${isActive ? tab.activeIcon : tab.icon}`}></i>
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
