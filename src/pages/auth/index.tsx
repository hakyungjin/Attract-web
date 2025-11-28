import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmationResult } from 'firebase/auth';
import { supabase } from '../../lib/supabase';
import {
  sendVerificationCode,
  verifyCode,
  validatePhoneNumber,
  clearRecaptcha
} from '../../services/phoneAuth';
import { hashPassword } from '../../services/passwordService';

type AuthStep = 'phone' | 'verify' | 'signup';

interface SignupData {
  phone_number: string;
  name: string;
  age: number | null;
  gender: string;
  location: string;
  school: string;
  job: string;
  bio: string;
  avatar_url: string | null;
  password: string;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const [signupData, setSignupData] = useState<SignupData>({
    phone_number: '',
    name: '',
    age: null,
    gender: 'male',
    location: '',
    school: '',
    job: '',
    bio: '',
    avatar_url: null,
    password: ''
  });

  // 타이머
  useEffect(() => {
    if (step === 'verify' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
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

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => clearRecaptcha();
  }, []);

  // 전화번호 포맷팅
  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // Step 1: SMS 전송
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // 중복 확인
    const cleanedPhone = phoneNumber.replace(/[^\d]/g, '');
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', cleanedPhone);

    if (error) {
      console.error('중복 확인 오류:', error);
    }

    if (existingUsers && existingUsers.length > 0) {
      alert('이미 등록된 전화번호입니다.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendVerificationCode(phoneNumber);
      setConfirmationResult(result);
      setSignupData(prev => ({ ...prev, phone_number: cleanedPhone }));
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

  // Step 2: SMS 인증
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationResult || !verificationCode.trim()) {
      alert('인증번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyCode(confirmationResult, verificationCode);

      if (result.error) {
        alert(result.error.message);
        return;
      }

      // 인증 성공 → 회원정보 입력 페이지로
      setStep('signup');
    } catch (error: any) {
      alert('인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: 회원정보 입력 및 저장
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (!signupData.password.trim() || signupData.password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      // 비밀번호 해싱
      const hashedPassword = await hashPassword(signupData.password);

      // 사용자 생성
      const { data, error } = await supabase
        .from('users')
        .insert({
          phone_number: signupData.phone_number,
          name: signupData.name.trim(),
          age: signupData.age,
          gender: signupData.gender,
          location: signupData.location.trim() || null,
          school: signupData.school.trim() || null,
          job: signupData.job.trim() || null,
          bio: signupData.bio.trim() || null,
          avatar_url: signupData.avatar_url,
          password: hashedPassword, // 해시된 비밀번호 저장
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('회원가입 실패:', error);
        alert('회원가입에 실패했습니다.');
        return;
      }

      // localStorage에 저장
      localStorage.setItem('user', JSON.stringify(data));
      alert('회원가입이 완료되었습니다!');
      navigate('/');
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="ri-heart-fill text-white text-3xl"></i>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">어트랙트</h1>
          <p className="text-sm text-gray-600 mt-2">새로운 인연을 시작하세요</p>
        </div>

        {/* 콘텐츠 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          {/* Step 1: 전화번호 입력 */}
          {step === 'phone' && (
            <form onSubmit={handleSendCode} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading || !phoneNumber}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? '전송 중...' : '인증번호 받기'}
              </button>

              <div id="recaptcha-container" className="mt-4"></div>
            </form>
          )}

          {/* Step 2: 인증번호 입력 */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  인증번호
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-center font-mono text-lg"
                    required
                  />
                  <div className="text-sm font-semibold text-primary-600">
                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {phoneNumber}로 전송된 인증번호를 입력하세요.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? '확인 중...' : '인증하기'}
              </button>

              {canResend && (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full text-primary-600 py-2 rounded-xl font-semibold border-2 border-primary-200 hover:bg-primary-50 transition-all cursor-pointer"
                >
                  인증번호 재전송
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setPhoneNumber('');
                  setVerificationCode('');
                }}
                className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 cursor-pointer"
              >
                전화번호 변경
              </button>
            </form>
          )}

          {/* Step 3: 회원정보 입력 */}
          {step === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3">
                <p className="text-sm text-primary-800">
                  <span className="font-semibold">✓ 인증 완료</span> - {signupData.phone_number}
                </p>
              </div>

              {/* 이름 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  placeholder="홍길동"
                  maxLength={20}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="6자 이상"
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              {/* 나이 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    나이
                  </label>
                  <input
                    type="number"
                    value={signupData.age || ''}
                    onChange={(e) => setSignupData({ ...signupData, age: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="나이"
                    min={18}
                    max={99}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* 성별 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    성별 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={signupData.gender}
                    onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
              </div>

              {/* 지역 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  지역
                </label>
                <input
                  type="text"
                  value={signupData.location}
                  onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                  placeholder="서울, 강남구"
                  maxLength={50}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* 학교 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  학교
                </label>
                <input
                  type="text"
                  value={signupData.school}
                  onChange={(e) => setSignupData({ ...signupData, school: e.target.value })}
                  placeholder="대학교"
                  maxLength={50}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* 직업 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  직업
                </label>
                <input
                  type="text"
                  value={signupData.job}
                  onChange={(e) => setSignupData({ ...signupData, job: e.target.value })}
                  placeholder="직업"
                  maxLength={50}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* 자기소개 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  자기소개
                </label>
                <textarea
                  value={signupData.bio}
                  onChange={(e) => setSignupData({ ...signupData, bio: e.target.value })}
                  placeholder="자기소개를 입력하세요"
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {signupData.bio.length}/200
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? '가입 중...' : '가입 완료'}
              </button>
            </form>
          )}
        </div>

        {/* 하단 텍스트 */}
        <p className="text-center text-xs text-gray-600 mt-6">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={() => navigate('/login/signin')}
            className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
