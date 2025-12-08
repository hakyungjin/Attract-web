import { useNavigate } from 'react-router-dom';
import { COMPANY_INFO } from '../../constants/companyInfo';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <img
                  src="/image/icon.png"
                  alt="Attract Logo"
                  className="w-16 h-16 object-contain"
                />
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
            <button onClick={() => navigate('/support')} className="text-cyan-500 hover:text-cyan-600 font-medium">
              고객센터
            </button>
          </p>
        </div>

        {/* 회사 정보 */}
        <div className="mt-8 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text mb-3">{COMPANY_INFO.brandName}</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p className="font-semibold">{COMPANY_INFO.companyFullName}</p>
              <p>대표자 : {COMPANY_INFO.ceo}</p>
              <p>법인명 : {COMPANY_INFO.companyShortName}</p>
              <p>사업자등록번호 : {COMPANY_INFO.businessNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
