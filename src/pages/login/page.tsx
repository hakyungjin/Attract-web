
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sendVerificationSMS, verifyCode } from '../../services/ssodaaSmsService';

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
  
  // SMS 인증 상태
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

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
      const { error, profileCompleted } = await signInPhone(cleanPhoneNumber, formData.password);

      if (error) {
        alert(`로그인 실패: ${error.message}`);
        return;
      }

      // 로그인 성공
      // 프로필이 완성되지 않으면 프로필 완성 페이지로 리다이렉트
      if (!profileCompleted) {
        navigate('/signup-profile', { state: { phoneNumber: cleanPhoneNumber } });
      } else {
        // 원래 가려던 페이지로 이동 (없으면 홈으로)
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      alert(`로그인 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 인증번호 발송
   */
  const handleSendVerificationCode = async () => {
    if (!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber)) {
      alert('올바른 전화번호를 입력해주세요.');
      return;
    }

    setSendingCode(true);
    try {
      const success = await sendVerificationSMS(formData.phoneNumber);
      if (success) {
        setIsCodeSent(true);
        alert('인증번호가 발송되었습니다. 3분 내에 입력해주세요.');
      } else {
        alert('인증번호 발송에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('인증번호 발송 오류:', error);
      alert(`인증번호 발송 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSendingCode(false);
    }
  };

  /**
   * 인증번호 확인
   */
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('6자리 인증번호를 입력해주세요.');
      return;
    }

    setVerifyingCode(true);
    try {
      const isValid = await verifyCode(formData.phoneNumber, verificationCode);
      if (isValid) {
        setIsCodeVerified(true);
        alert('인증이 완료되었습니다!');
      } else {
        alert('인증번호가 일치하지 않거나 만료되었습니다.');
      }
    } catch (error: any) {
      console.error('인증번호 확인 오류:', error);
      alert(`인증 확인 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setVerifyingCode(false);
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

    // 전화번호 인증 확인
    if (!isCodeVerified) {
      alert('전화번호 인증을 완료해주세요.');
      return;
    }

    if (!formData.name) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (!formData.age) {
      alert('나이를 입력해주세요.');
      return;
    }

    if (!formData.gender || formData.gender === '') {
      alert('성별을 선택해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
      const { error } = await signUpPhone(cleanPhoneNumber, formData.password, {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
      });

      if (error) {
        alert(`회원가입 실패: ${error.message}`);
        return;
      }

      alert('회원가입이 완료되었습니다! 프로필을 완성해주세요.');
      navigate('/signup-profile', { state: { phoneNumber: cleanPhoneNumber } });
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
                    disabled={isCodeVerified}
                  />
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber) || sendingCode || isCodeVerified}
                    className="px-4 py-3 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                  >
                    {sendingCode ? '발송중...' : isCodeVerified ? '✓ 완료' : '발송'}
                  </button>
                </div>
                
                {/* 인증번호 입력 (인증번호 발송 후 표시) */}
                {isCodeSent && !isCodeVerified && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                      placeholder="인증번호 6자리 입력"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={!verificationCode || verificationCode.length !== 6 || verifyingCode}
                      className="px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {verifyingCode ? '확인중...' : '인증 확인'}
                    </button>
                  </div>
                )}
                
                {/* 인증 완료 표시 */}
                {isCodeVerified && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <i className="ri-checkbox-circle-fill"></i>
                    <span>전화번호 인증이 완료되었습니다.</span>
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
                disabled={loading || !isCodeVerified}
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