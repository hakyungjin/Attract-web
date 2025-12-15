import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentFailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorMessage = searchParams.get('message') || '결제가 취소되었습니다.';
  const errorCode = searchParams.get('code');

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-100 sticky top-0 z-30 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="w-10"></div>
          <h1 className="text-xl font-bold text-gray-900">결제 실패</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 실패 아이콘 */}
      <div className="flex flex-col items-center justify-center px-5 py-12">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <i className="ri-close-line text-5xl text-red-500"></i>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제에 실패했습니다</h2>
        <p className="text-gray-500 mb-2 text-center">{errorMessage}</p>
        {errorCode && (
          <p className="text-gray-400 text-sm mb-8">오류 코드: {errorCode}</p>
        )}

        {/* 실패 사유 안내 */}
        <div className="w-full max-w-md bg-gray-50 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">결제 실패 원인</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <i className="ri-checkbox-blank-circle-fill text-xs text-gray-400 mt-1"></i>
              <span>카드 한도 초과 또는 잔액 부족</span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-checkbox-blank-circle-fill text-xs text-gray-400 mt-1"></i>
              <span>사용자가 결제를 취소</span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-checkbox-blank-circle-fill text-xs text-gray-400 mt-1"></i>
              <span>카드사 승인 거부</span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-checkbox-blank-circle-fill text-xs text-gray-400 mt-1"></i>
              <span>네트워크 오류</span>
            </li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="w-full max-w-md space-y-3">
          <button
            onClick={() => navigate('/coin-shop')}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all cursor-pointer"
          >
            다시 시도하기
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
