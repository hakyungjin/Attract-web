
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { firebase } from '../../lib/firebaseService';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInPhone, signUpPhone } = useAuth();
  
  // 리다이렉트된 경우 원래 페이지로 돌아가기
  const from = (location.state as any)?.from?.pathname || '/';
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    gender: 'male'
  });
  
  // 중복확인 상태
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // 전화번호 포맷팅 (010-XXXX-XXXX)
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phoneNumber: formatted });
  };

  // 전화번호 유효성 검사 (010으로 시작, 11자리)
  const isValidPhoneNumber = (phone: string) => {
    const numbers = phone.replace(/[^\d]/g, '');
    return numbers.length === 11 && numbers.startsWith('010');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.phoneNumber || !formData.password) {
        alert('전화번호와 비밀번호를 입력해주세요.');
        setLoading(false);
        return;
      }

      if (!isValidPhoneNumber(formData.phoneNumber)) {
        alert('올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX)');
        setLoading(false);
        return;
      }

      // 전화번호에서 '-' 제거
      const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
      console.log('로그인 시도:', cleanPhoneNumber);
      
      const { error, profileCompleted } = await signInPhone(cleanPhoneNumber, formData.password);

      console.log('로그인 결과:', { error, profileCompleted });

      if (error) {
        alert(`로그인 실패: ${error.message}`);
        setLoading(false);
        return;
      }

      // 로그인 성공
      console.log('로그인 성공, 프로필 완성 여부:', profileCompleted);
      
      // 프로필이 완성되지 않으면 프로필 완성 페이지로 리다이렉트
      if (!profileCompleted) {
        navigate('/signup-profile', { state: { phoneNumber: cleanPhoneNumber } });
      } else {
        // 원래 가려던 페이지로 이동 (없으면 홈으로)
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      alert(`로그인 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 전화번호 중복확인
   */
  const handleCheckPhone = async () => {
    if (!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber)) {
      alert('올바른 전화번호를 입력해주세요.');
      return;
    }

    setCheckingPhone(true);
    try {
      const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
      const { user: existingUser } = await signUpPhone(cleanPhoneNumber, '', { name: '' });

      // signUpPhone이 에러를 반환하면 중복
      if (existingUser || !existingUser) {
        // 실제 중복 확인을 위해 findUserByPhoneNumber 사용
        const { user } = await firebase.users.findUserByPhoneNumber(cleanPhoneNumber);
        if (user) {
          alert('이미 가입된 전화번호입니다.');
          setIsPhoneChecked(false);
        } else {
          alert('사용 가능한 전화번호입니다.');
          setIsPhoneChecked(true);
        }
      }
    } catch (error: any) {
      console.error('중복확인 오류:', error);
      alert(`중복확인 실패: ${error.message || '알 수 없는 오류'}`);
      setIsPhoneChecked(false);
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phoneNumber) {
      alert('전화번호를 입력해주세요.');
      return;
    }

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      alert('올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX)');
      return;
    }

    // 전화번호 중복확인
    if (!isPhoneChecked) {
      alert('전화번호 중복확인을 완료해주세요.');
      return;
    }

    if (!formData.name) {
      alert('이름을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
      
      // 1단계: 중복 확인
      const { error: signupError } = await signUpPhone(cleanPhoneNumber, formData.password || 'temp', {
        name: formData.name,
        gender: formData.gender,
      });

      if (signupError) {
        alert(`중복 확인 실패: ${signupError.message}`);
        return;
      }

      // 중복 확인 완료 - 회원가입 진행
      alert('중복 확인이 완료되었습니다. 회원가입을 계속 진행해주세요.');
      navigate('/signup-profile', { state: { phoneNumber: cleanPhoneNumber, name: formData.name } });
    } catch (error: any) {
      alert(`회원가입 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <img
                src="/image/icon.png"
                alt="Attract Logo"
                className="w-20 h-20 rounded-2xl object-cover drop-shadow-lg"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Attract
          </h1>
          <p className="text-gray-600">두근거리는 첫 만남처럼</p>
        </div>

        {/* 로그인/회원가입 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* 탭 전환 */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${isLogin ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' : 'text-gray-600'
                }`}
            >
              로그인
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${!isLogin ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' : 'text-gray-600'
                }`}
            >
              회원가입
            </button>
          </div>

          {/* 로그인 폼 */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  placeholder="010-1234-5678"
                  maxLength={13}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-600">로그인 상태 유지</span>
                </label>
                <button type="button" onClick={() => navigate('/support')} className="text-cyan-500 hover:text-cyan-600 cursor-pointer whitespace-nowrap">
                  비밀번호 찾기
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          ) : (
            /* 회원가입 폼 */
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">전화번호 <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    placeholder="010-1234-5678"
                    maxLength={13}
                    disabled={isPhoneChecked}
                  />
                  <button
                    type="button"
                    onClick={handleCheckPhone}
                    disabled={!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber) || checkingPhone || isPhoneChecked}
                    className="px-4 py-3 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                  >
                    {checkingPhone ? '확인중...' : isPhoneChecked ? '✓ 완료' : '중복확인'}
                  </button>
                </div>

                {/* 중복확인 완료 표시 */}
                {isPhoneChecked && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <i className="ri-checkbox-circle-fill"></i>
                    <span>사용 가능한 전화번호입니다.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">나이 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="19"
                    max="99"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    placeholder="나이"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">성별 <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm pr-8"
                  >
                    <option value="">성별을 선택하세요</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  placeholder="8자 이상 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인 <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>

              <label className="flex items-start cursor-pointer text-sm">
                <input type="checkbox" className="mt-1 mr-2" />
                <span className="text-gray-600">
                  <button type="button" onClick={() => navigate('/policy/terms')} className="text-cyan-500 hover:underline">이용약관</button> 및 <button type="button" onClick={() => navigate('/policy/privacy')} className="text-cyan-500 hover:underline">개인정보처리방침</button>에 동의합니다
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !isPhoneChecked}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '가입 중...' : '회원가입'}
              </button>
              
              {/* 안내 문구 */}
              <div className="text-center mt-4 text-xs text-gray-500">
                <p>정보까지 다 입력해야 회원가입이 완료됩니다</p>
              </div>
            </form>
          )}

        </div>

        {/* 하단 링크 */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            문제가 있으신가요?{' '}
            <button onClick={() => navigate('/support')} className="text-cyan-500 hover:text-cyan-600 cursor-pointer whitespace-nowrap">
              고객센터
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}