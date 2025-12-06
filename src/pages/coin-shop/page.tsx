import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { kakaoPayReady, redirectToKakaoPay } from '../../services/kakaoPayService';

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

  // 코인 패키지 및 사용자 코인 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 코인 패키지 가져오기
        const { data: packages, error: packagesError } = await supabase
          .from('coin_packages')
          .select('*')
          .order('display_order', { ascending: true });

        if (packagesError) {
          console.error('코인 패키지 로드 실패:', packagesError);
          // 기본 패키지 사용
          setCoinPackages([
            { id: 'basic', coins: 50, price: 5000 },
            { id: 'standard', coins: 100, price: 9000, bonus: 10 },
            { id: 'premium', coins: 300, price: 25000, bonus: 50, popular: true },
            { id: 'vip', coins: 500, price: 40000, bonus: 100 },
            { id: 'mega', coins: 1000, price: 75000, bonus: 250 },
            { id: 'ultra', coins: 2000, price: 140000, bonus: 600 },
          ]);
        } else if (packages && packages.length > 0) {
          // 데이터베이스에서 가져온 패키지 변환
          const formattedPackages = packages.map((pkg: any) => ({
            id: pkg.id.toString(),
            name: pkg.name,
            coins: pkg.coins,
            price: pkg.price,
            bonus_coins: pkg.bonus_coins,
            bonus: pkg.bonus_coins,
            is_popular: pkg.is_popular,
            popular: pkg.is_popular,
          }));
          setCoinPackages(formattedPackages);
        }

        // 사용자 코인 가져오기
        if (user?.id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('coins')
            .eq('id', user.id)
            .single();

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
    setShowPaymentModal(true);
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

    setIsProcessing(true);

    try {
      // 총 코인 계산 (기본 + 보너스)
      const bonusCoins = selectedPackage.bonus_coins || selectedPackage.bonus || 0;
      const totalCoins = selectedPackage.coins + bonusCoins;
      const orderName = `자석 ${selectedPackage.coins}개${bonusCoins > 0 ? ` (+${bonusCoins} 보너스)` : ''}`;

      // localStorage에 패키지 정보 저장 (결제 완료 후 사용)
      localStorage.setItem('selectedPackageId', selectedPackage.id);
      localStorage.setItem('selectedCoins', totalCoins.toString());
      localStorage.setItem('selectedBonusCoins', bonusCoins.toString());
      localStorage.setItem('selectedPackageName', selectedPackage.name || orderName);

      // 카카오페이 결제
      if (paymentMethod === 'KAKAOPAY') {
        const result = await kakaoPayReady(user.id, {
          id: selectedPackage.id,
          name: orderName,
          coins: selectedPackage.coins,
          price: selectedPackage.price,
          bonus: bonusCoins,
        });

        if (result.success && result.data) {
          redirectToKakaoPay(result.data);
        } else {
          alert(result.error || '카카오페이 결제 요청에 실패했습니다.');
        }
        return;
      }

      // 토스페이먼츠 결제 (카드, 토스페이)
      if (!tossPayments) {
        alert('결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      await tossPayments.requestPayment(paymentMethod, {
        amount: selectedPackage.price,
        orderId: orderId,
        orderName: orderName,
        successUrl: `${window.location.origin}/payment/success?orderId=${orderId}`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: user.name || '사용자',
      });
    } catch (error: any) {
      console.error('결제 요청 실패:', error);
      alert(error.message || '결제 요청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
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
          <div className="w-10"></div>
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
      </div>

      {/* 결제 모달 */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden animate-slide-up">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">결제하기</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-9 h-9 flex items-center justify-center cursor-pointer"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            <div className="p-6">
              {/* 선택한 패키지 */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
                      <img
                        src="/images/magnet.png"
                        alt="자석"
                        className="w-8 h-8"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">자석</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedPackage.coins.toLocaleString()}
                        {(selectedPackage.bonus || selectedPackage.bonus_coins) && (
                          <span className="text-base text-pink-500 ml-1">
                            +{selectedPackage.bonus_coins || selectedPackage.bonus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-gray-600">결제금액</span>
                  <div className="text-3xl font-bold text-gray-900">
                    {selectedPackage.price.toLocaleString()}
                    <span className="text-lg text-gray-600 ml-1">원</span>
                  </div>
                </div>
              </div>

              {/* 결제 수단 */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">결제 수단</h4>
                <div className="space-y-2">
                  {/* 카카오페이 */}
                  <button
                    onClick={() => setPaymentMethod('KAKAOPAY')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'KAKAOPAY'
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <span className="text-black font-bold text-xs">kakao</span>
                      </div>
                      <span className="font-medium text-gray-900">카카오페이</span>
                    </div>
                    {paymentMethod === 'KAKAOPAY' && (
                      <i className="ri-check-line text-xl text-yellow-500"></i>
                    )}
                  </button>

                  {/* 토스페이 */}
                  <button
                    onClick={() => setPaymentMethod('토스페이')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === '토스페이'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">toss</span>
                      </div>
                      <span className="font-medium text-gray-900">토스페이</span>
                    </div>
                    {paymentMethod === '토스페이' && (
                      <i className="ri-check-line text-xl text-blue-500"></i>
                    )}
                  </button>

                  {/* 신용/체크카드 */}
                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <i className="ri-bank-card-2-line text-white text-lg"></i>
                      </div>
                      <span className="font-medium text-gray-900">신용/체크카드</span>
                    </div>
                    {paymentMethod === 'CARD' && (
                      <i className="ri-check-line text-xl text-purple-500"></i>
                    )}
                  </button>
                </div>
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all cursor-pointer whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>결제 진행 중...</span>
                  </>
                ) : (
                  <span>{selectedPackage.price.toLocaleString()}원 결제하기</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
