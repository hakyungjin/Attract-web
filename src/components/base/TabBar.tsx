

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
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 flex justify-center pointer-events-none" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-primary-500/20 pointer-events-auto max-w-md w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 group ${isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-1 h-1 bg-primary-500 rounded-full animate-bounce" />
              )}
              <i className={`text-2xl transition-all duration-300 ${isActive ? `${tab.activeIcon} scale-110 drop-shadow-md` : `${tab.icon} group-hover:scale-110`
                }`}></i>
              <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute'
                }`}>
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute inset-0 bg-primary-50 rounded-full -z-10 scale-0 animate-ping opacity-20" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
