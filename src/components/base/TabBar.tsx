import { useState } from 'react';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-2">
        <button
          onClick={() => onTabChange('matching')}
          className={`flex flex-col items-center justify-center py-2 px-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'matching' ? 'text-pink-500' : 'text-gray-400'
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center mb-1">
            <i className="ri-heart-line text-xl"></i>
          </div>
          <span className="text-xs font-medium">매칭</span>
        </button>

        <button
          onClick={() => onTabChange('community')}
          className={`flex flex-col items-center justify-center py-2 px-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'community' ? 'text-pink-500' : 'text-gray-400'
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center mb-1">
            <i className="ri-group-line text-xl"></i>
          </div>
          <span className="text-xs font-medium">커뮤니티</span>
        </button>

        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center justify-center py-2 px-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'chat' ? 'text-pink-500' : 'text-gray-400'
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center mb-1">
            <i className="ri-chat-3-line text-xl"></i>
          </div>
          <span className="text-xs font-medium">채팅</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center py-2 px-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'profile' ? 'text-pink-500' : 'text-gray-400'
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center mb-1">
            <i className="ri-user-line text-xl"></i>
          </div>
          <span className="text-xs font-medium">My페이지</span>
        </button>
      </div>
    </div>
  );
}
