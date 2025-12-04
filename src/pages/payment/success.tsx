import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Supabase Edge Function URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/confirm-payment`;

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    /**
     * 결제 승인 처리 함수
     * Supabase Edge Function을 호출하여 결제를 승인하고 코인을 충전합니다.
     */
    const confirmPayment = async () => {
      const orderId = searchParams.get('orderId');
      const paymentKey = searchParams.get('paymentKey');
      const amount = searchParams.get('amount');

      if (!orderId || !paymentKey || !amount) {
        alert('결제 정보가 올바르지 않습니다.');
        navigate('/coin-shop');
        return;
      }

      if (!user?.id) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      try {
        // localStorage에서 패키지 정보 가져오기
        const coins = parseInt(localStorage.getItem('selectedCoins') || '0');
        const bonusCoins = parseInt(localStorage.getItem('selectedBonusCoins') || '0');
        const packageId = localStorage.getItem('selectedPackageId') || '';
        const packageName = localStorage.getItem('selectedPackageName') || '';

        // Supabase Edge Function 호출하여 결제 승인
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            orderId,
            paymentKey,
            amount: parseInt(amount),
            userId: user.id,
            coins,
            bonusCoins,
            packageId,
            packageName,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || '결제 승인에 실패했습니다.');
        }

        // 결제 성공 정보 설정
        setPaymentInfo({
          orderId: data.data.orderId,
          amount: data.data.amount,
          coins: data.data.coins,
          currentCoins: data.data.currentCoins,
          approvedAt: data.data.approvedAt,
        });

        // localStorage 정리
        localStorage.removeItem('selectedPackageId');
        localStorage.removeItem('selectedCoins');
        localStorage.removeItem('selectedBonusCoins');
        localStorage.removeItem('selectedPackageName');

        setIsProcessing(false);
      } catch (error: any) {
        console.error('결제 승인 실패:', error);
        const errorMessage = error.message || '결제 승인에 실패했습니다.';
        alert(errorMessage);
        navigate(`/payment/fail?message=${encodeURIComponent(errorMessage)}`);
      }
    };

    confirmPayment();
  }, [searchParams, navigate, user]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">결제를 처리하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-100 sticky top-0 z-30 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="w-10"></div>
          <h1 className="text-xl font-bold text-gray-900">결제 완료</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 성공 아이콘 */}
      <div className="flex flex-col items-center justify-center px-5 py-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <i className="ri-check-line text-5xl text-green-500"></i>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제가 완료되었습니다</h2>
        <p className="text-gray-500 mb-8">자석이 충전되었습니다</p>

        {/* 결제 정보 */}
        {paymentInfo && (
          <div className="w-full max-w-md bg-gray-50 rounded-2xl p-6 mb-6">
            {/* 충전된 자석 표시 */}
            <div className="flex items-center justify-center mb-6 pb-6 border-b border-gray-200">
              <img
                src="/image/magnet.png"
                alt="자석"
                className="w-12 h-12 mr-3"
              />
              <div>
                <p className="text-sm text-gray-600">충전된 자석</p>
                <p className="text-3xl font-bold text-pink-500">
                  +{paymentInfo.coins.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">주문번호</span>
                <span className="text-gray-900 font-medium text-sm">{paymentInfo.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">결제금액</span>
                <span className="text-gray-900 font-bold text-xl">
                  {paymentInfo.amount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">현재 보유 자석</span>
                <div className="flex items-center space-x-2">
                  <img src="/image/magnet.png" alt="자석" className="w-5 h-5" />
                  <span className="text-gray-900 font-bold text-lg">
                    {paymentInfo.currentCoins?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">결제일시</span>
                <span className="text-gray-900 font-medium">
                  {new Date(paymentInfo.approvedAt).toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="w-full max-w-md space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all cursor-pointer"
          >
            홈으로 돌아가기
          </button>
          <button
            onClick={() => navigate('/coin-shop')}
            className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
          >
            더 충전하기
          </button>
        </div>
      </div>
    </div>
  );
}
