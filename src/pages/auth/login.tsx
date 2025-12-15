import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithPhone } from '../../services/authService';
import { COMPANY_INFO } from '../../constants/companyInfo';

export default function LoginAuthPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim() || phoneNumber.length < 13) {
      alert('올바른 전화번호를 입력해주세요.');
      return;
    }

    if (!password.trim() || password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPhone(phoneNumber, password);

      if (!result.success) {
        alert(result.error || '로그인에 실패했습니다.');
        return;
      }

      // 로그인 성공 - localStorage에 저장
      localStorage.setItem('user', JSON.stringify(result.user));
      alert('로그인 되었습니다!');
      navigate('/home');
    } catch (error: any) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <img
                  src="/image/icon.png"
                  alt="Attract Logo"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">어트랙트</h1>
          <p className="text-sm text-gray-600 mt-2">로그인</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                휴대폰 번호
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneInput(e.target.value))}
                placeholder="010-1234-5678"
                maxLength={13}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-center font-medium"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <i className={`ri-${showPassword ? 'eye-off' : 'eye'}-line`}></i>
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 cursor-pointer mt-6"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all cursor-pointer"
          >
            회원가입
          </button>
        </div>

        {/* 하단 텍스트 */}
        <p className="text-center text-xs text-gray-600 mt-6">
          비밀번호를 잊으셨나요?{' '}
          <button
            onClick={() => alert('고객센터에 문의해주세요.')}
            className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer"
          >
            고객센터
          </button>
        </p>

        {/* 회사 정보 */}
        <div className="mt-8 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-primary-600 mb-3">{COMPANY_INFO.brandName}</h3>
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
