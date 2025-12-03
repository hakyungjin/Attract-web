
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ConfirmationResult } from 'firebase/auth';
import {
  sendVerificationCode,
  verifyCode,
  validatePhoneNumber,
  clearRecaptcha
} from '../../services/phoneAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInPhone, signUpPhone } = useAuth();
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

  // 회원가입 전화번호 인증 관련 state
  const [verificationStep, setVerificationStep] = useState<'phone' | 'verify' | 'info'>('phone');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(180); // 3분
  const [canResend, setCanResend] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

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

  // 타이머
  useEffect(() => {
    if (verificationStep === 'verify' && timer > 0 && !phoneVerified) {
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
  }, [verificationStep, timer, phoneVerified]);

  // 컴포넌트 언마운트 시 reCAPTCHA 정리
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  // 탭 전환 시 회원가입 단계 초기화
  useEffect(() => {
    if (isLogin) {
      setVerificationStep('phone');
      setVerificationCode('');
      setPhoneVerified(false);
      setConfirmationResult(null);
    }
  }, [isLogin]);

  // 시간 포맷팅 (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 인증번호 전송
  const handleSendVerification = async () => {
    const validation = validatePhoneNumber(formData.phoneNumber);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setLoading(true);
    try {
      const result = await sendVerificationCode(formData.phoneNumber);
      setConfirmationResult(result);
      setVerificationStep('verify');
      setTimer(180);
      setCanResend(false);
      alert('인증번호가 전송되었습니다.');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 재전송
  const handleResendCode = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      const result = await sendVerificationCode(formData.phoneNumber);
      setConfirmationResult(result);
      setTimer(180);
      setCanResend(false);
      alert('인증번호가 재전송되었습니다.');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!confirmationResult) {
      alert('인증번호 전송이 필요합니다.');
      return;
    }

    if (verificationCode.length !== 6) {
      alert('인증번호 6자리를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await verifyCode(confirmationResult, verificationCode, formData.phoneNumber);

      if (error) {
        alert(error.message);
        return;
      }

      // 인증 성공
      setPhoneVerified(true);
      setVerificationStep('info');
      alert('전화번호 인증이 완료되었습니다!');
    } catch (error: any) {
      alert('인증에 실패했습니다.');
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
        return;
      }

      // 로그인 성공
      // 프로필이 완성되지 않으면 프로필 완성 페이지로 리다이렉트
      if (!profileCompleted) {
        navigate('/signup-profile', { state: { phoneNumber: cleanPhoneNumber } });
      } else {
        navigate('/');
      }
    } catch (error: any) {
      alert(`로그인 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 전화번호 인증 확인
    if (!phoneVerified) {
      alert('전화번호 인증을 완료해주세요.');
    if (!formData.phoneNumber) {
      alert('전화번호를 입력해주세요.');
      return;
    }

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      alert('올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX)');
      return;
    }

    // 유효성 검사
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
            /* 회원가입 폼 - 단계별 */
            <div className="space-y-4">
              {/* 1단계: 전화번호 입력 */}
              {verificationStep === 'phone' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">전화번호 <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      placeholder="010-1234-5678"
                      maxLength={13}
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      휴대폰 번호로 인증번호가 전송됩니다
                    </p>
                  </div>

                  <button
                    onClick={handleSendVerification}
                    disabled={loading || formData.phoneNumber.length < 13}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '전송 중...' : '인증번호 받기'}
                  </button>
                </div>
              )}

              {/* 2단계: 인증번호 입력 */}
              {verificationStep === 'verify' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">인증번호</label>
                    <p className="text-sm text-gray-600 mb-3">
                      {formData.phoneNumber}로 전송된 인증번호를 입력하세요
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg text-center tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className={`text-sm ${timer > 0 ? 'text-cyan-500' : 'text-red-500'}`}>
                        {timer > 0 ? `남은 시간: ${formatTime(timer)}` : '인증번호가 만료되었습니다'}
                      </p>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={!canResend || loading}
                        className="text-sm text-gray-600 hover:text-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        재전송
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyCode}
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '확인 중...' : '확인'}
                  </button>
                </div>
              )}

              {/* 3단계: 회원정보 입력 */}
              {verificationStep === 'info' && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-green-700 flex items-center">
                      <i className="ri-checkbox-circle-fill mr-2"></i>
                      전화번호 인증 완료
                    </p>
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
                        <option value="">선택</option>
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
                    <input type="checkbox" className="mt-1 mr-2" required />
                    <span className="text-gray-600">
                      <span className="text-cyan-500">이용약관</span> 및 <span className="text-cyan-500">개인정보처리방침</span>에 동의합니다
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '가입 중...' : '회원가입'}
                  </button>
                </form>
              )}
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

              {/* reCAPTCHA 컨테이너 (invisible) */}
              <div id="recaptcha-container"></div>
            </div>
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