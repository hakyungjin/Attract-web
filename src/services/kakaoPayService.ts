/**
 * 카카오페이 결제 서비스
 * 
 * 사용 전 .env 파일에 아래 값 추가:
 * VITE_KAKAO_PAY_CID=TC0ONETIME (테스트) 또는 발급받은 CID
 * VITE_KAKAO_PAY_SECRET_KEY=DEV7A8E8A80A2F556D63362773C58F0EF60B81DD (개발)
 * VITE_KAKAO_PAY_SECRET_KEY_PROD=PRD06E3CE056EE301DAE0D4E482CB3B4F5017DE3 (운영)
 */

import { supabase } from '../lib/supabase';

// 카카오페이 API 기본 설정
const KAKAO_PAY_API_URL = 'https://open-api.kakaopay.com/online/v1/payment';

// 환경변수에서 키 가져오기
const getSecretKey = () => {
  const isProd = import.meta.env.PROD;
  return isProd 
    ? import.meta.env.VITE_KAKAO_PAY_SECRET_KEY_PROD 
    : import.meta.env.VITE_KAKAO_PAY_SECRET_KEY;
};

const getCID = () => {
  // 테스트용 CID: TC0ONETIME (단건결제)
  return import.meta.env.VITE_KAKAO_PAY_CID || 'TC0ONETIME';
};

interface KakaoPayReadyResponse {
  tid: string;
  next_redirect_app_url: string;
  next_redirect_mobile_url: string;
  next_redirect_pc_url: string;
  android_app_scheme: string;
  ios_app_scheme: string;
  created_at: string;
}

interface KakaoPayApproveResponse {
  aid: string;
  tid: string;
  cid: string;
  partner_order_id: string;
  partner_user_id: string;
  payment_method_type: string;
  item_name: string;
  quantity: number;
  amount: {
    total: number;
    tax_free: number;
    vat: number;
    discount: number;
  };
  created_at: string;
  approved_at: string;
}

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus?: number;
}

/**
 * 카카오페이 결제 준비 요청
 */
export const kakaoPayReady = async (
  userId: string,
  coinPackage: CoinPackage
): Promise<{ success: boolean; data?: KakaoPayReadyResponse; error?: string }> => {
  const secretKey = getSecretKey();
  const cid = getCID();

  if (!secretKey) {
    return { success: false, error: '카카오페이 설정이 완료되지 않았습니다.' };
  }

  const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 현재 페이지 URL 기준으로 리다이렉트 URL 생성
  const baseUrl = window.location.origin;
  
  const params = {
    cid: cid,
    partner_order_id: orderId,
    partner_user_id: userId,
    item_name: `${coinPackage.name} (${coinPackage.coins}코인)`,
    quantity: 1,
    total_amount: coinPackage.price,
    tax_free_amount: 0,
    approval_url: `${baseUrl}/payment/success?orderId=${orderId}&packageId=${coinPackage.id}`,
    cancel_url: `${baseUrl}/payment/fail?reason=cancel`,
    fail_url: `${baseUrl}/payment/fail?reason=fail`,
  };

  try {
    const response = await fetch(`${KAKAO_PAY_API_URL}/ready`, {
      method: 'POST',
      headers: {
        'Authorization': `SECRET_KEY ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('카카오페이 Ready 실패:', data);
      return { success: false, error: data.msg || '결제 준비에 실패했습니다.' };
    }

    // 결제 정보 DB에 저장 (pending 상태)
    await supabase.from('payments').insert({
      user_id: userId,
      order_id: orderId,
      tid: data.tid,
      amount: coinPackage.price,
      coins: coinPackage.coins + (coinPackage.bonus || 0),
      payment_method: 'KAKAOPAY',
      status: 'pending',
    });

    // TID를 세션 스토리지에 저장 (승인 요청 시 필요)
    sessionStorage.setItem('kakao_pay_tid', data.tid);
    sessionStorage.setItem('kakao_pay_order_id', orderId);
    sessionStorage.setItem('kakao_pay_user_id', userId);

    return { success: true, data };
  } catch (error: any) {
    console.error('카카오페이 API 오류:', error);
    return { success: false, error: error.message || '결제 요청 중 오류가 발생했습니다.' };
  }
};

/**
 * 카카오페이 결제 승인 요청
 */
export const kakaoPayApprove = async (
  pgToken: string
): Promise<{ success: boolean; data?: KakaoPayApproveResponse; error?: string }> => {
  const secretKey = getSecretKey();
  const cid = getCID();
  
  const tid = sessionStorage.getItem('kakao_pay_tid');
  const orderId = sessionStorage.getItem('kakao_pay_order_id');
  const userId = sessionStorage.getItem('kakao_pay_user_id');

  if (!tid || !orderId || !userId) {
    return { success: false, error: '결제 정보를 찾을 수 없습니다.' };
  }

  const params = {
    cid: cid,
    tid: tid,
    partner_order_id: orderId,
    partner_user_id: userId,
    pg_token: pgToken,
  };

  try {
    const response = await fetch(`${KAKAO_PAY_API_URL}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `SECRET_KEY ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('카카오페이 Approve 실패:', data);
      
      // 결제 실패 상태 업데이트
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('order_id', orderId);
      
      return { success: false, error: data.msg || '결제 승인에 실패했습니다.' };
    }

    // 결제 성공 - DB 업데이트
    const { data: paymentData } = await supabase
      .from('payments')
      .update({ 
        status: 'completed',
        payment_key: data.aid,
        approved_at: data.approved_at,
      })
      .eq('order_id', orderId)
      .select()
      .single();

    // 사용자 코인 충전
    if (paymentData) {
      await supabase.rpc('add_coins', {
        user_id: userId,
        amount: paymentData.coins,
      });
    }

    // 세션 스토리지 정리
    sessionStorage.removeItem('kakao_pay_tid');
    sessionStorage.removeItem('kakao_pay_order_id');
    sessionStorage.removeItem('kakao_pay_user_id');

    return { success: true, data };
  } catch (error: any) {
    console.error('카카오페이 승인 오류:', error);
    return { success: false, error: error.message || '결제 승인 중 오류가 발생했습니다.' };
  }
};

/**
 * 결제 페이지로 리다이렉트
 */
export const redirectToKakaoPay = (readyResponse: KakaoPayReadyResponse) => {
  // 모바일 환경 체크
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    window.location.href = readyResponse.next_redirect_mobile_url;
  } else {
    window.location.href = readyResponse.next_redirect_pc_url;
  }
};

