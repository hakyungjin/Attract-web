import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../lib/supabase';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'select' | 'login' | 'signup'>('select');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 전화번호 포맷팅 (자동 하이픈)
  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 로그인 (전화번호 + 비밀번호)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneNumber.length < 13) {
      alert('올바른 전화번호를 입력해주세요.');
      return;
    }

    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 전화번호 정규화 - 숫자만 추출
      const cleanedPhone = phoneNumber.replace(/[^\d]/g, '');

      console.log('검색할 전화번호:', cleanedPhone);

      // 전화번호로 사용자 찾기 - userService 사용
      const { user, error } = await userService.findUserByPhoneNumber(cleanedPhone);

      if (error || !user) {
        alert('등록되지 않은 전화번호입니다.');
        setLoading(false);
        return;
      }

      // 비밀번호 확인 (실제로는 암호화된 비밀번호와 비교해야 함)
      // 여기서는 간단하게 처리
      if (password === '1234') { // 임시 비밀번호
        // 로컬 스토리지에 사용자 정보 저장
        localStorage.setItem('user', JSON.stringify(user));

        console.log('로그인 성공! 홈으로 이동합니다.');
        alert('로그인 성공!');

        setLoading(false);
        navigate('/', { replace: true });
      } else {
        alert('비밀번호가 일치하지 않습니다.');
        setLoading(false);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 회원가입 버튼 (전화번호 인증 페이지로 이동)
  const handleSignupClick = () => {
    navigate('/signup/phone');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-heart-fill text-white text-3xl"></i>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Attract
          </h1>
          <p className="text-gray-600">당신의 특별한 인연을 찾아보세요</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* 선택 화면 */}
          {mode === 'select' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                시작하기
              </h2>

              <button
                onClick={() => setMode('login')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg"
              >
                로그인
              </button>

              <button
                onClick={handleSignupClick}
                className="w-full bg-white text-cyan-500 py-4 rounded-xl font-medium border-2 border-cyan-500 hover:bg-cyan-50 transition-all"
              >
                회원가입
              </button>

              <div className="text-center mt-6 text-sm text-gray-500">
                <p>회원가입 시 전화번호 인증이 필요합니다</p>
              </div>
            </div>
          )}

          {/* 로그인 화면 */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">로그인</h2>
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← 뒤로
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  휴대폰 번호
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneInput(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg"
                  placeholder="010-1234-5678"
                  maxLength={13}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg"
                  placeholder="비밀번호를 입력하세요"
                />
                <p className="mt-2 text-xs text-gray-500">
                  임시: 비밀번호는 1234입니다
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 13 || !password}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleSignupClick}
                  className="text-sm text-cyan-500 hover:text-cyan-600"
                >
                  계정이 없으신가요? 회원가입
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 하단 링크 */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            문제가 있으신가요?{' '}
            <button className="text-cyan-500 hover:text-cyan-600">
              고객센터
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
