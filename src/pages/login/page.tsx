
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ConfirmationResult } from 'firebase/auth';
import { clearRecaptcha, sendVerificationCode, verifyCode } from '../../services/phoneAuth';
import { logPageView } from '../../services/analytics';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInPhone, signUpPhone } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // 로그인 중 전체 화면 로딩
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    gender: 'male'
  });

  // SMS 인증 관련 상태
  const [verificationStep, setVerificationStep] = useState<'input' | 'verify' | 'verified'>('input');
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verifiedFirebaseUid, setVerifiedFirebaseUid] = useState<string | null>(null);
  
  // 약관 모달 상태
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // 약관 동의 상태
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // 개발 모드 여부
  const isDevelopment = import.meta.env.DEV;

  // 타이머
  useEffect(() => {
    if (verificationStep === 'verify' && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [verificationStep, timer]);

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
    // 전화번호 변경 시 인증 상태 초기화
    if (verificationStep !== 'input') {
      setVerificationStep('input');
      setVerificationCode('');
      setConfirmationResult(null);
      setVerifiedFirebaseUid(null);
      clearRecaptcha();
    }
  };

  // 전화번호 유효성 검사 (010으로 시작, 11자리)
  const isValidPhoneNumber = (phone: string) => {
    const numbers = phone.replace(/[^\d]/g, '');
    return numbers.length === 11 && numbers.startsWith('010');
  };

  // 시간 포맷팅 (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 인증번호 전송
   */
  const handleSendVerificationCode = async () => {
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      alert('올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX)');
      return;
    }

    setSendingCode(true);

    try {
      // Firebase Console에서 테스트 전화번호를 등록해두면 DEV에서도 실제 SMS 없이 테스트 가능
      const result = await sendVerificationCode(formData.phoneNumber);
      setConfirmationResult(result);

      setVerificationStep('verify');
      setTimer(180);
      setCanResend(false);
      alert(
        isDevelopment
          ? '개발 모드: Firebase Console의 테스트 전화번호/코드를 사용해 테스트하세요.'
          : '인증번호가 전송되었습니다.'
      );
    } catch (error: any) {
      console.error('SMS 발송 오류:', error);
      alert(error.message || 'SMS 발송에 실패했습니다.');
    } finally {
      setSendingCode(false);
    }
  };

  /**
   * 인증번호 재전송
   */
  const handleResendCode = async () => {
    if (!canResend) return;
    await handleSendVerificationCode();
  };

  /**
   * 인증번호 확인
   */
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      alert('인증번호 6자리를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (!confirmationResult) {
        alert('인증번호를 먼저 요청해주세요.');
        return;
      }

      const { user, error } = await verifyCode(
        confirmationResult,
        verificationCode,
        formData.phoneNumber
      );

      if (error || !user) {
        alert(error?.message || '인증번호가 일치하지 않거나 만료되었습니다.');
        return;
      }

      setVerifiedFirebaseUid(user.uid);
      setVerificationStep('verified');
      alert('전화번호 인증이 완료되었습니다!');
    } catch (error) {
      alert('인증 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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
        setLoading(false);  // 로딩 상태 해제
        return;
      }

      // 로그인 성공
      setLoading(false);
      
      // 프로필이 완성되지 않으면 프로필 완성 페이지로 리다이렉트
      if (!profileCompleted) {
        navigate('/signup-profile', { state: { phoneNumber: cleanPhoneNumber } });
      } else {
        // 로그인 중 화면 표시 후 홈으로 이동
        setIsLoggingIn(true);
        setTimeout(() => {
          navigate('/home');
        }, 1500); // 1.5초 후 이동
      }
    } catch (error: any) {
      alert(`로그인 오류: ${error.message}`);
      setLoading(false);
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
    if (verificationStep !== 'verified') {
      alert('전화번호 인증을 완료해주세요.');
      return;
    }

    // 약관 동의 확인
    if (!agreeTerms) {
      alert('이용약관 및 개인정보처리방침에 동의해주세요.');
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
        firebaseUid: verifiedFirebaseUid || undefined,
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

  // 탭 전환 시 인증 상태 초기화
  const handleTabChange = (isLoginTab: boolean) => {
    setIsLogin(isLoginTab);
    setVerificationStep('input');
    setVerificationCode('');
    setTimer(180);
    setCanResend(false);
    setAgreeTerms(false);
    setConfirmationResult(null);
    setVerifiedFirebaseUid(null);
    clearRecaptcha();
  };

  // 로그인 중 전체 화면 로딩
  if (isLoggingIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          {/* 로고 */}
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-8">
            <img
              src="/image/icon.png"
              alt="Attract Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          
          {/* 로딩 스피너 */}
          <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
          
          {/* 텍스트 */}
          <h2 className="text-xl font-bold text-slate-800 mb-1">로그인 중</h2>
          <p className="text-slate-400 text-sm">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

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
              onClick={() => handleTabChange(true)}
              className={`flex-1 py-3 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${isLogin ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' : 'text-gray-600'
                }`}
            >
              로그인
            </button>
            <button
              onClick={() => handleTabChange(false)}
              className={`flex-1 py-3 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${!isLogin ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' : 'text-gray-600'
                }`}
            >
              회원가입
            </button>
          </div>

          {/* 개발 모드 표시 */}
          {isDevelopment && !isLogin && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-yellow-700 text-center">
                🛠️ 개발 모드: 인증번호가 콘솔에 출력됩니다
              </p>
            </div>
          )}

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
              {/* 전화번호 + SMS 인증 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={verificationStep === 'verified'}
                    className={`flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${
                      verificationStep === 'verified' ? 'bg-gray-100' : ''
                    }`}
                    placeholder="010-1234-5678"
                    maxLength={13}
                  />
                  {verificationStep === 'input' && (
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={sendingCode || !isValidPhoneNumber(formData.phoneNumber)}
                      className="px-4 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                    >
                      {sendingCode ? '전송중...' : '인증'}
                    </button>
                  )}
                  {verificationStep === 'verified' && (
                    <div className="flex items-center px-3 py-3 bg-green-100 text-green-700 rounded-xl font-medium whitespace-nowrap text-xs">
                      <i className="ri-check-line"></i>완료
                    </div>
                  )}
                </div>
              </div>

              {/* 인증번호 입력 */}
              {verificationStep === 'verify' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    인증번호 *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center tracking-widest text-sm"
                      placeholder="000000"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 6}
                      className="px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm text-gray-700"
                    >
                      확인
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2 text-gray-500">
                    <p className={timer > 0 ? 'text-gray-500' : 'text-red-500'}>
                      {timer > 0 ? `남은 시간: ${formatTime(timer)}` : '인증번호가 만료되었습니다'}
                    </p>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={!canResend || sendingCode}
                      className="text-cyan-500 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      재전송
                    </button>
                  </div>
                </div>
              )}

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
                <input 
                  type="checkbox" 
                  className="mt-1 mr-2" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="text-gray-600">
                  <button type="button" onClick={() => setShowTermsModal(true)} className="text-cyan-500 hover:underline">이용약관</button> 및 <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-cyan-500 hover:underline">개인정보처리방침</button>에 동의합니다
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || verificationStep !== 'verified'}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '가입 중...' : '회원가입'}
              </button>
            </form>
          )}

        </div>

        {/* Firebase PhoneAuth - invisible reCAPTCHA container */}
        <div id="recaptcha-container" />

        {/* 하단 링크 */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            문제가 있으신가요?{' '}
            <button onClick={() => navigate('/support')} className="text-cyan-500 hover:text-cyan-600 cursor-pointer whitespace-nowrap">
              고객센터
            </button>
          </p>
        </div>

        {/* 사업자 정보 */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200 text-xs text-gray-400 space-y-1">
          <p>Attract (어트랙트)</p>
          <p>대표: 최윤석 | 사업자등록번호: 576-18-02378</p>
          <p>주소: 서울특별시 강서구 마곡중앙1로 71</p>
          <p>이메일: cys7204086@naver.com| 전화: 010-3150-4086</p>
          <p className="mt-2">© 2024 Attract. All rights reserved.</p>
        </div>
      </div>

      {/* 이용약관 모달 */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTermsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">이용약관</h3>
              <button onClick={() => setShowTermsModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-4">
              <h4 className="font-bold text-gray-800">제1조 (목적)</h4>
              <p>이 약관은 Attract(이하 "회사")가 제공하는 소개팅 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
              
              <h4 className="font-bold text-gray-800">제2조 (용어의 정의)</h4>
              <p>1. "서비스"란 회사가 제공하는 모든 소개팅 관련 서비스를 의미합니다.</p>
              <p>2. "회원"이란 이 약관에 동의하고 서비스를 이용하는 자를 말합니다.</p>
              <p>3. "코인"이란 서비스 내에서 사용되는 가상화폐를 의미합니다.</p>
              
              <h4 className="font-bold text-gray-800">제3조 (약관의 효력)</h4>
              <p>이 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.</p>
              
              <h4 className="font-bold text-gray-800">제4조 (서비스 이용)</h4>
              <p>1. 회원은 만 19세 이상이어야 합니다.</p>
              <p>2. 회원은 본인 인증을 완료해야 서비스를 이용할 수 있습니다.</p>
              <p>3. 허위 정보를 입력할 경우 서비스 이용이 제한될 수 있습니다.</p>
              
              <h4 className="font-bold text-gray-800">제5조 (결제 및 환불)</h4>
              <p>1. 코인 구매 후 사용하지 않은 코인은 구매일로부터 7일 이내에 환불 가능합니다.</p>
              <p>2. 이미 사용된 코인은 환불되지 않습니다.</p>
              
              <h4 className="font-bold text-gray-800">제6조 (면책조항)</h4>
              <p>회사는 회원 간의 만남으로 인해 발생하는 문제에 대해 책임지지 않습니다.</p>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPrivacyModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">개인정보처리방침</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-4">
              <h4 className="font-bold text-gray-800">1. 수집하는 개인정보 항목</h4>
              <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:</p>
              <p>- 필수: 이름, 휴대폰번호, 성별, 나이</p>
              <p>- 선택: 프로필 사진, 지역, 학교/직장, MBTI, 관심사</p>
              
              <h4 className="font-bold text-gray-800">2. 개인정보 수집 목적</h4>
              <p>- 회원 식별 및 본인 인증</p>
              <p>- 매칭 서비스 제공</p>
              <p>- 서비스 개선 및 신규 서비스 개발</p>
              <p>- 불량 회원 관리</p>
              
              <h4 className="font-bold text-gray-800">3. 개인정보 보유 기간</h4>
              <p>회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
              
              <h4 className="font-bold text-gray-800">4. 개인정보의 제3자 제공</h4>
              <p>회사는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다. 다만, 회원의 동의가 있거나 법령에 의한 경우는 예외로 합니다.</p>
              
              <h4 className="font-bold text-gray-800">5. 회원의 권리</h4>
              <p>회원은 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며, 회원 탈퇴를 요청할 수 있습니다.</p>
              
              <h4 className="font-bold text-gray-800">6. 연락처</h4>
              <p>개인정보 관련 문의: support@attract.com</p>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
