import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmationResult } from 'firebase/auth';
import {
  sendVerificationCode,
  verifyCode,
  validatePhoneNumber,
  clearRecaptcha
} from '../../services/phoneAuth';

export default function PhoneLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(180); // 3분
  const [canResend, setCanResend] = useState(false);

  // 타이머
  useEffect(() => {
    if (step === 'verify' && timer > 0) {
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
  }, [step, timer]);

  // 컴포넌트 언마운트 시 reCAPTCHA 정리
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  // 전화번호 포맷팅 (자동 하이픈)
  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // SMS 전송
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setLoading(true);

    try {
      const result = await sendVerificationCode(phoneNumber);
      setConfirmationResult(result);
      setStep('verify');
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
      const result = await sendVerificationCode(phoneNumber);
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
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const { user, error, isNewUser, userData } = await verifyCode(confirmationResult, verificationCode);

      if (error) {
        alert(error.message);
        return;
      }

      if (isNewUser) {
        // 신규 사용자 - 회원가입 페이지로 이동
        alert('신규 사용자입니다. 회원가입을 진행해주세요.');
        // Firebase UID와 전화번호를 state로 전달
        navigate('/signup', {
          state: {
            firebaseUid: user?.uid,
            phoneNumber: phoneNumber
          }
        });
      } else {
        // 기존 사용자 - 로그인 성공
        alert('로그인 성공!');
        console.log('사용자 정보:', userData);
        navigate('/');
      }
    } catch (error: any) {
      alert('인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 전화번호 수정
  const handleEditPhone = () => {
    setStep('phone');
    setVerificationCode('');
    setTimer(180);
    setCanResend(false);
  };

  // 시간 포맷팅 (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

        {/* 로그인 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {step === 'phone' ? '휴대폰 번호 로그인' : '인증번호 확인'}
          </h2>

          {/* 전화번호 입력 */}
          {step === 'phone' && (
            <form onSubmit={handleSendCode} className="space-y-6">
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
                <p className="mt-2 text-xs text-gray-500">
                  휴대폰 번호로 간편하게 로그인하세요
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 13}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '전송 중...' : '인증번호 받기'}
              </button>
            </form>
          )}

          {/* 인증번호 입력 */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    인증번호
                  </label>
                  <button
                    type="button"
                    onClick={handleEditPhone}
                    className="text-xs text-cyan-500 hover:text-cyan-600"
                  >
                    번호 수정
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {phoneNumber}로 전송된 인증번호를 입력하세요
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
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '확인 중...' : '확인'}
              </button>
            </form>
          )}

          {/* reCAPTCHA 컨테이너 (invisible) */}
          <div id="recaptcha-container"></div>
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
