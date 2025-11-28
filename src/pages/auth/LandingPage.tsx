import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <i className="ri-heart-fill text-white text-4xl"></i>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Attract
          </h1>
          <p className="text-gray-600 text-lg">당신의 특별한 인연을 찾아보세요</p>
        </div>

        {/* 버튼 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
          {/* 로그인 버튼 */}
          <button
            onClick={() => navigate('/login/signin')}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
          >
            로그인
          </button>

          {/* 회원가입 버튼 */}
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white text-cyan-500 py-4 rounded-xl font-semibold text-lg border-2 border-cyan-500 hover:bg-cyan-50 transition-all"
          >
            회원가입
          </button>

          <div className="text-center mt-6 text-sm text-gray-500">
            <p>회원가입 시 전화번호 인증이 필요합니다</p>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            문제가 있으신가요?{' '}
            <button className="text-cyan-500 hover:text-cyan-600 font-medium">
              고객센터
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
