import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * 개인정보 삭제 요청 페이지 (로그인 없이 접근 가능)
 * 사용자가 로그인하지 않아도 개인정보 삭제를 요청할 수 있는 페이지입니다.
 */
export default function DataDeletionPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'info' | 'confirm' | 'processing'>('info');

  // 뒤로가기
  const handleBack = () => {
    navigate(-1);
  };

  // 다음 단계로 이동 (확인 단계)
  const handleNext = () => {
    if (step === 'info') {
      setStep('confirm');
    }
  };

  // 전화번호 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  // 개인정보 삭제 실행
  const handleDelete = async () => {
    if (!phoneNumber || !password) {
      setError('전화번호와 비밀번호를 입력해주세요.');
      return;
    }

    // 확인 텍스트 검증
    if (confirmText !== '삭제합니다') {
      setError('확인 텍스트를 정확히 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    setError(null);
    setStep('processing');

    try {
      // 전화번호에서 '-' 제거
      const cleanPhoneNumber = phoneNumber.replace(/-/g, '');

      // Firebase Functions를 통한 개인정보 삭제
      const functions = getFunctions();
      const deleteUserData = httpsCallable(functions, 'deleteUserData');

      const result = await deleteUserData({
        phoneNumber: cleanPhoneNumber,
        password: password,
      });

      if (result.data && (result.data as any).success) {
        // 완료 페이지로 이동
        navigate('/data-deletion/complete', { replace: true });
      } else {
        throw new Error((result.data as any)?.error || '개인정보 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('개인정보 삭제 오류:', err);
      setError(err.message || '개인정보 삭제 중 오류가 발생했습니다.');
      setStep('confirm');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            disabled={isDeleting}
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="text-lg font-bold">개인정보 삭제 요청</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 내용 */}
      <div className="px-4 py-6">
        {step === 'info' && (
          <div className="space-y-6">
            {/* 안내 섹션 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <i className="ri-delete-bin-line text-2xl text-red-600"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">개인정보 삭제 안내</h2>
                  <p className="text-sm text-gray-500">계정과 모든 개인정보를 영구적으로 삭제합니다</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start space-x-3">
                  <i className="ri-information-line text-blue-500 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-900">삭제되는 정보</p>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1 list-disc list-inside">
                      <li>프로필 정보 (이름, 나이, 사진 등)</li>
                      <li>매칭 요청 및 수락 내역</li>
                      <li>커뮤니티 게시글 및 댓글</li>
                      <li>채팅 내역</li>
                      <li>알림 내역</li>
                      <li>계정 정보</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <i className="ri-alert-line text-orange-500 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-900">주의사항</p>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1 list-disc list-inside">
                      <li>삭제된 정보는 복구할 수 없습니다</li>
                      <li>보유 중인 코인은 환불되지 않습니다</li>
                      <li>법적 보관 의무가 있는 결제 내역은 보관됩니다</li>
                      <li>본인 확인을 위해 전화번호와 비밀번호가 필요합니다</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <i className="ri-time-line text-gray-500 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-900">처리 기간</p>
                    <p className="text-xs text-gray-600 mt-1">
                      요청 즉시 처리되며, 모든 데이터는 영구적으로 삭제됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 법적 안내 */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>개인정보보호법 제36조(개인정보의 정정·삭제 요구권)</strong>에 따라 
                개인정보의 삭제를 요구할 권리가 있습니다. 삭제 요청 시 관련 법령에 따라 
                보관이 필요한 정보를 제외하고 모두 삭제됩니다.
              </p>
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={handleNext}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-semibold hover:bg-red-700 transition-colors"
            >
              계속하기
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            {/* 최종 확인 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-alert-line text-3xl text-red-600"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">정말 삭제하시겠습니까?</h2>
                <p className="text-sm text-gray-600">
                  이 작업은 되돌릴 수 없습니다. 모든 개인정보가 영구적으로 삭제됩니다.
                </p>
              </div>

              {/* 전화번호 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  전화번호
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isDeleting}
                />
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isDeleting}
                />
              </div>

              {/* 확인 텍스트 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  확인을 위해 <strong className="text-red-600">"삭제합니다"</strong>를 입력하세요
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="삭제합니다"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isDeleting}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* 버튼 */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || !phoneNumber || !password || confirmText !== '삭제합니다'}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isDeleting ? '삭제 중...' : '개인정보 삭제하기'}
                </button>
                <button
                  onClick={() => setStep('info')}
                  disabled={isDeleting}
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <i className="ri-loader-4-line text-3xl text-red-600 animate-spin"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">개인정보 삭제 중...</h2>
            <p className="text-sm text-gray-600">
              잠시만 기다려주세요. 모든 데이터를 안전하게 삭제하고 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
