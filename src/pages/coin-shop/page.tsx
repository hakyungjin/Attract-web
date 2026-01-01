import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { firebase } from '../../lib/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
// 카카오페이는 더 이상 지원되지 않습니다. 토스페이먼츠만 사용합니다.
// import { kakaoPayReady, redirectToKakaoPay } from '../../services/kakaoPayService';

interface CoinPackage {
  id: string;
  name?: string;
  coins: number;
  price: number;
  bonus_coins?: number;
  bonus?: number;
  is_popular?: boolean;
  popular?: boolean;
}

// 토스페이먼츠 클라이언트 키 (환경 변수에서 가져오기)
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

export default function CoinShopPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | '토스페이' | 'KAKAOPAY'>('KAKAOPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tossPayments, setTossPayments] = useState<any>(null);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // 코인 패키지 및 사용자 코인 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 당분간 만원 단일 패키지만 사용
        setCoinPackages([
          { id: 'special_10000', coins: 120, price: 10000, bonus: 20, popular: true, name: '특별 자석 패키지' },
        ]);

        // 사용자 코인 가져오기 - Firebase 사용
        if (user?.id) {
          const { user: userData, error: userError } = await firebase.users.getUserById(user.id);

          if (!userError && userData) {
            setUserCoins(userData.coins || 0);
          }
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // 토스페이먼츠 SDK 초기화
  useEffect(() => {
    const initTossPayments = async () => {
      try {
        const toss = await loadTossPayments(TOSS_CLIENT_KEY);
        setTossPayments(toss);
      } catch (error) {
        console.error('토스페이먼츠 초기화 실패:', error);
      }
    };
    initTossPayments();
  }, []);

  const handlePurchase = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setShowAccountModal(true);
  };

  /**
   * 결제 처리 함수
   */
  const handlePayment = async () => {
    if (!selectedPackage) return;
    
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 무통장 입금 안내 모달 표시
    setShowPaymentModal(false);
    setShowAccountModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPackage || !user?.id) return;

    setIsProcessing(true);
    try {
      const { error } = await firebase.payments.createPaymentRequest({
        user_id: user.id,
        user_name: user.name || '사용자',
        phone_number: user.phone_number || '',
        package_id: selectedPackage.id,
        coins: selectedPackage.coins + (selectedPackage.bonus || selectedPackage.bonus_coins || 0),
        price: selectedPackage.price,
      });

      if (error) throw error;

      alert('결제 요청이 완료되었습니다. 입금 확인 후 자석이 지급됩니다.');
      setShowAccountModal(false);
      navigate('/payment/history');
    } catch (error: any) {
      console.error('결제 요청 실패:', error);
      alert('결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('계좌번호가 복사되었습니다.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-100 sticky top-0 z-30 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <i className="ri-arrow-left-line text-2xl text-gray-800"></i>
          </button>
          <h1 className="text-xl font-bold text-gray-900">자석 충전</h1>
          <button 
            onClick={() => navigate('/payment/history')}
            className="w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <i className="ri-history-line text-2xl text-gray-800"></i>
          </button>
        </div>
      </div>

      {/* 현재 보유 자석 */}
      <div className="px-5 py-8 text-center border-b border-gray-100">
        <p className="text-sm text-gray-500 mb-2">보유 자석</p>
        <div className="flex items-center justify-center space-x-2">
          <img
            src="/image/magnet.png"
            alt="자석"
            className="w-8 h-8"
          />
          <span className="text-4xl font-bold text-gray-900">
            {loading ? '...' : userCoins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 자석 패키지 리스트 */}
      <div className="px-5 py-6">
        <div className="space-y-3">
          {coinPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handlePurchase(pkg)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                pkg.popular
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  pkg.popular ? 'bg-pink-50' : 'bg-gray-100'
                }`}>
                  <img
                    src="/image/magnet.png"
                    alt="자석"
                    className="w-8 h-8"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {pkg.coins.toLocaleString()}
                    </span>
                    {(pkg.bonus || pkg.bonus_coins) && (
                      <span className="text-sm font-medium text-pink-500">
                        +{pkg.bonus_coins || pkg.bonus}
                      </span>
                    )}
                  </div>
                  {(pkg.popular || pkg.is_popular) && (
                    <span className="text-xs font-medium text-pink-500">인기</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {pkg.price.toLocaleString()}원
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 서비스 제공일 및 환불 규정 */}
        <div className="mt-8 bg-gray-50 rounded-2xl p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
            <i className="ri-information-line text-cyan-500 mr-2"></i>
            서비스 이용 안내
          </h3>

          <div className="space-y-4">
            {/* 서비스 제공일 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">📅 서비스 제공일</h4>
              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>입금 확인 후 5분 이내에 자석이 충전됩니다</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>충전된 자석은 유효기간 없이 사용 가능합니다</span>
                </li>
              </ul>
            </div>

            {/* 교환 규정 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">🔄 교환 규정</h4>
              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>디지털 콘텐츠 특성상 교환이 불가능합니다</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>다른 패키지로 변경을 원하시는 경우 환불 후 재구매 가능합니다</span>
                </li>
              </ul>
            </div>

            {/* 환불 규정 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">💰 환불 규정</h4>
              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span className="font-semibold text-pink-600">결제 후 7일 이내, 미사용 시 100% 환불 가능</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>부분 사용한 경우 사용한 만큼 차감 후 환불</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>보너스 자석은 환불 금액에서 제외됩니다</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>환불 요청은 [설정] → [고객센터] → [환불 신청]에서 가능합니다</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>환불은 영업일 기준 3~5일 소요됩니다</span>
                </li>
              </ul>
            </div>

            {/* 주의사항 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <h4 className="text-xs font-semibold text-yellow-800 mb-2 flex items-center">
                <i className="ri-alert-line mr-1"></i>
                주의사항
              </h4>
              <ul className="text-xs text-yellow-700 space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>자석 구매 시 [전자상거래법]에 따라 청약철회가 가능합니다</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>결제 오류 발생 시 고객센터로 문의해주세요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 모달 - 간결한 버전 */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in shadow-2xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">결제하기</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100"
              >
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>

            <div className="p-5">
              {/* 선택한 패키지 - 간결하게 */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-center space-x-3">
                  <img src="/image/magnet.png" alt="자석" className="w-10 h-10" />
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {selectedPackage.coins.toLocaleString()}
                      {(selectedPackage.bonus || selectedPackage.bonus_coins) && (
                        <span className="text-sm text-pink-500 ml-1">
                          +{selectedPackage.bonus_coins || selectedPackage.bonus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {selectedPackage.price.toLocaleString()}원
                </div>
              </div>

              {/* 결제 수단 선택 */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">결제 수단 선택</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-bank-card-line text-xl mb-1 block"></i>
                    <span className="text-xs font-medium">카드</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('토스페이')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === '토스페이'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-wallet-3-line text-xl mb-1 block"></i>
                    <span className="text-xs font-medium">토스페이</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('KAKAOPAY')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'KAKAOPAY'
                        ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-kakao-talk-fill text-xl mb-1 block"></i>
                    <span className="text-xs font-medium">카카오페이</span>
                  </button>
                </div>
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || !tossPayments}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                  paymentMethod === 'KAKAOPAY'
                    ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>결제 진행 중...</span>
                  </>
                ) : (
                  <>
                    {paymentMethod === 'KAKAOPAY' ? (
                      <span className="font-bold">카카오페이로 결제</span>
                    ) : (
                      <span className="font-bold">
                        {paymentMethod === 'CARD' ? '카드로 결제' : '토스페이로 결제'}
                      </span>
                    )}
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-3">
                {paymentMethod === 'KAKAOPAY' 
                  ? '결제 시 카카오페이 앱으로 이동합니다'
                  : '안전한 결제를 위해 토스페이먼츠를 사용합니다'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 무통장 입금 안내 모달 */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-bank-line text-3xl text-blue-500"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">무통장 입금 안내</h3>
              <p className="text-sm text-gray-500 mb-6">
                아래 계좌로 입금해 주시면<br />
                확인 후 자석이 지급됩니다.
              </p>

              <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-400">입금 은행</span>
                  <span className="text-sm font-bold text-gray-800">신한은행</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-400">계좌 번호</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-800">110-123-456789</span>
                    <button 
                      onClick={() => copyToClipboard('110-123-456789')}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <i className="ri-file-copy-line text-blue-500"></i>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-400">예금주</span>
                  <span className="text-sm font-bold text-gray-800">어트랙트</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-400">입금 금액</span>
                  <span className="text-lg font-bold text-blue-600">10,000원</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-400">지급 자석</span>
                  <span className="text-sm font-bold text-gray-800">120개 (+20 보너스)</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <i className="ri-time-line mr-1"></i>
                  입금 확인은 약 <strong>5분 정도</strong> 소요됩니다.<br />
                  확인 즉시 자석이 자동으로 지급됩니다.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    '결제 완료'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
