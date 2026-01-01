import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebase } from '../../lib/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import type { PaymentRequest } from '../../lib/firebaseService';

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      if (!user?.id) return;
      
      try {
        const { payments: data, error } = await firebase.payments.getUserPayments(user.id);
        if (error) throw error;
        setPayments(data);
      } catch (error) {
        console.error('결제 내역 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md">
            입금 확인 중
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
            지급 완료
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">
            취소됨
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-50 rounded-full transition-colors"
          >
            <i className="ri-arrow-left-line text-2xl text-slate-600"></i>
          </button>
          <h1 className="text-lg font-bold text-slate-800 ml-2">결제 내역</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-sm">내역을 불러오는 중...</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      {payment.created_at?.toDate 
                        ? new Date(payment.created_at.toDate()).toLocaleString('ko-KR')
                        : '방금 전'}
                    </p>
                    <h3 className="font-bold text-slate-800 text-lg">
                      자석 {payment.coins.toLocaleString()}개
                    </h3>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <span className="text-sm text-slate-500">결제 금액</span>
                  <span className="font-bold text-slate-900">{payment.price.toLocaleString()}원</span>
                </div>

                {payment.status === 'pending' && (
                  <div className="mt-4 bg-blue-50 rounded-xl p-3">
                    <p className="text-[11px] text-blue-600 leading-relaxed">
                      <i className="ri-information-line mr-1"></i>
                      입금 확인 후 자석이 지급됩니다. (약 5분 소요)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i className="ri-history-line text-4xl text-slate-200"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">결제 내역이 없습니다</h3>
            <p className="text-slate-400 text-sm">자석을 충전하고 서비스를 이용해보세요!</p>
            <button
              onClick={() => navigate('/coin-shop')}
              className="mt-6 px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-colors"
            >
              자석 충전하러 가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
