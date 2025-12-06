/**
 * 결제 승인 Edge Function
 * Toss Payments 결제를 승인하고 사용자 코인을 충전합니다.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 환경 변수
const TOSS_SECRET_KEY = Deno.env.get('TOSS_SECRET_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface PaymentConfirmRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
  userId: string;
  coins: number;
  bonusCoins?: number;
  packageId?: string;
  packageName?: string;
}

serve(async (req) => {
  // CORS 헤더 설정
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // 요청 본문 파싱
    const body: PaymentConfirmRequest = await req.json();
    const { 
      orderId, 
      paymentKey, 
      amount, 
      userId, 
      coins, 
      bonusCoins = 0, 
      packageId, 
      packageName 
    } = body;

    // 필수 필드 검증
    if (!orderId || !paymentKey || !amount || !userId || !coins) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    // Supabase 클라이언트 생성 (서비스 역할 키 사용)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Toss Payments API로 결제 승인 요청
    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(TOSS_SECRET_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      throw new Error(errorData.message || '결제 승인에 실패했습니다.');
    }

    const tossData = await tossResponse.json();

    // 총 코인 계산
    const totalCoins = coins + bonusCoins;

    // 데이터베이스 트랜잭션 시작
    // 1. 중복 결제 확인
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (existingPayment) {
      throw new Error('이미 처리된 결제입니다.');
    }

    // 2. 결제 기록 생성
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        order_id: orderId,
        payment_key: paymentKey,
        amount: amount,
        status: 'completed',
        coins: coins,
        bonus_coins: bonusCoins,
        total_coins: totalCoins,
        package_id: packageId,
        package_name: packageName,
        toss_order_id: tossData.orderId,
        toss_payment_key: tossData.paymentKey,
        toss_method: tossData.method,
        toss_approved_at: tossData.approvedAt,
        metadata: {
          toss_response: tossData,
        },
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error(`결제 기록 생성 실패: ${paymentError.message}`);
    }

    // 3. 사용자 코인 업데이트
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const newCoins = (user.coins || 0) + totalCoins;

    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: newCoins })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`코인 업데이트 실패: ${updateError.message}`);
    }

    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          orderId: payment.order_id,
          amount: payment.amount,
          coins: payment.total_coins,
          currentCoins: newCoins,
          approvedAt: payment.toss_approved_at,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('결제 승인 오류:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || '결제 승인에 실패했습니다.',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 400,
      }
    );
  }
});

