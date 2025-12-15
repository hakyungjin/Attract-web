import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 text-white overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 네비게이션 */}
        <nav className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <img src="/image/icon.png" alt="Attract" className="w-10 h-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              어트랙트
            </span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/20 transition-all border border-white/20"
          >
            로그인
          </button>
        </nav>

        {/* 히어로 섹션 */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-lg mx-auto">
            {/* 배지 */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-sm text-white/80">새로운 인연이 기다리고 있어요</span>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              <span className="block">설레는 만남의 시작</span>
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                어트랙트
              </span>
            </h1>

            {/* 설명 */}
            <p className="text-lg text-white/70 mb-10 leading-relaxed">
              진정한 인연을 찾는 당신을 위한 프리미엄 소개팅 앱.<br />
              매칭, 채팅, 커뮤니티로 특별한 만남을 시작하세요.
            </p>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate('/signup/quick')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-2xl font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all"
              >
                무료로 시작하기
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                로그인
              </button>
            </div>

            {/* 특징 */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="ri-heart-fill text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-sm mb-1">스마트 매칭</h3>
                <p className="text-xs text-white/60">취향에 맞는 이상형 추천</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="ri-chat-heart-fill text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-sm mb-1">실시간 채팅</h3>
                <p className="text-xs text-white/60">매칭된 상대와 대화</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="ri-group-fill text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-sm mb-1">커뮤니티</h3>
                <p className="text-xs text-white/60">다양한 이야기 공유</p>
              </div>
            </div>
          </div>
        </main>

        {/* 푸터 */}
        <footer className="px-6 py-6 border-t border-white/10">
          <div className="max-w-lg mx-auto">
            {/* 링크 */}
            <div className="flex items-center justify-center space-x-6 mb-4">
              <button
                onClick={() => navigate('/policy/terms')}
                className="text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                이용약관
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => navigate('/policy/privacy')}
                className="text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                개인정보처리방침
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => navigate('/support')}
                className="text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                고객센터
              </button>
            </div>

            {/* 저작권 */}
            <p className="text-center text-xs text-white/40">
              © 2024 Attract. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

