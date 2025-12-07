import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  sendVerificationSMS,
  verifyCode as verifySsodaaCode,
  sendVerificationSMSTest
} from '../../services/ssodaaSmsService';

/**
 * 휴대폰 번호 로그인 페이지 (쏘다 SMS 인증)
 * 
 * 흐름:
 * 1. 전화번호 입력 → 인증번호 SMS 발송
 * 2. 인증번호 확인 → Supabase에서 사용자 조회
 * 3. 기존 사용자면 로그인, 신규면 회원가입 페이지로 이동
 */
export default function PhoneLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(180); // 3분
  const [canResend, setCanResend] = useState(false);
  
  // 개발 모드 여부 (테스트용)
  const isDevelopment = import.meta.env.DEV;

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

  /**
   * 전화번호 포맷팅 (자동 하이픈)
   */
  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  /**
   * 전화번호 유효성 검사
   */
  const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
    const cleaned = phone.replace(/[\s-]/g, '');
    const phoneRegex = /^(0(10|11|16|17|18|19))\d{7,8}$/;

    if (!phoneRegex.test(cleaned)) {
      return {
        valid: false,
        error: '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)'
      };
    }

    return { valid: true };
  };

  /**
   * SMS 인증번호 전송
   */
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
      let success: boolean;
      
      if (isDevelopment) {
        // 개발 모드: 콘솔에 인증번호 출력 (실제 SMS 미발송)
        const testCode = await sendVerificationSMSTest(phoneNumber);
        console.log(`🔐 테스트 인증번호: ${testCode}`);
        success = true;
      } else {
        // 운영 모드: 실제 SMS 발송
        success = await sendVerificationSMS(phoneNumber);
      }

      if (success) {
        setStep('verify');
        setTimer(180);
        setCanResend(false);
        alert(isDevelopment 
          ? '개발 모드: 콘솔에서 인증번호를 확인하세요.' 
          : '인증번호가 전송되었습니다.'
        );
      } else {
        alert('인증번호 발송에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('SMS 발송 오류:', error);
      alert(error.message || 'SMS 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 인증번호 재전송
   */
  const handleResendCode = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      let success: boolean;
      
      if (isDevelopment) {
        const testCode = await sendVerificationSMSTest(phoneNumber);
        console.log(`🔐 재발송 테스트 인증번호: ${testCode}`);
        success = true;
      } else {
        success = await sendVerificationSMS(phoneNumber);
      }

      if (success) {
        setTimer(180);
        setCanResend(false);
        alert(isDevelopment 
          ? '개발 모드: 콘솔에서 인증번호를 확인하세요.' 
          : '인증번호가 재전송되었습니다.'
        );
      }
    } catch (error: any) {
      alert(error.message || 'SMS 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 인증번호 확인 및 로그인 처리
   */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      alert('인증번호 6자리를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 쏘다 SMS 인증번호 확인
      const isValid = verifySsodaaCode(phoneNumber, verificationCode);

      if (!isValid) {
        alert('인증번호가 일치하지 않거나 만료되었습니다.');
        setLoading(false);
        return;
      }

      // Supabase에서 사용자 조회
      const cleanPhone = phoneNumber.replace(/-/g, '');
      const { data: existingUser, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', cleanPhone)
        .maybeSingle();

      if (queryError && queryError.code !== 'PGRST116') {
        console.error('사용자 조회 오류:', queryError);
        throw new Error('사용자 정보를 확인하는데 실패했습니다.');
      }

      if (existingUser) {
        // 기존 사용자 - 로그인 성공
        console.log('✅ 로그인 성공:', existingUser);
        localStorage.setItem('user', JSON.stringify(existingUser));
        alert('로그인 성공!');
        navigate('/');
      } else {
        // 신규 사용자 - 회원가입 페이지로 이동
        alert('신규 사용자입니다. 회원가입을 진행해주세요.');
        navigate('/signup', {
          state: {
            phoneNumber: phoneNumber,
            verified: true // 인증 완료 상태 전달
          }
        });
      }
    } catch (error: any) {
      console.error('인증 오류:', error);
      alert(error.message || '인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 전화번호 수정 (인증번호 화면에서 뒤로가기)
   */
  const handleEditPhone = () => {
    setStep('phone');
    setVerificationCode('');
    setTimer(180);
    setCanResend(false);
  };

  /**
   * 시간 포맷팅 (mm:ss)
   */
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
              <img
                src="/image/icon.png"
                alt="Attract Logo"
                className="w-28 h-28 rounded-3xl object-cover drop-shadow-lg"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Attract
          </h1>
          <p className="text-gray-600">두근거리는 첫 만남처럼</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {step === 'phone' ? '휴대폰 번호 로그인' : '인증번호 확인'}
          </h2>

          {/* 개발 모드 표시 */}
          {isDevelopment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-yellow-700 text-center">
                🛠️ 개발 모드: 인증번호가 콘솔에 출력됩니다
              </p>
            </div>
          )}

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
        </div>

        {/* 하단 링크 */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            문제가 있으신가요?{' '}
            <button onClick={() => navigate('/support')} className="text-cyan-500 hover:text-cyan-600">
              고객센터
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
