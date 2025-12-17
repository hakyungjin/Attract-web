import { supabase } from '../lib/supabase';

export interface Payment {
  id?: string;
  user_id: string;
  order_id: string;
  tid?: string;
  payment_key?: string;
  amount: number;
  coins: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  approved_at?: string;
  created_at?: string;
}

/**
 * 결제 정보 생성 (pending 상태)
 */
export const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, payment: data };
  } catch (error: any) {
    console.error('결제 정보 생성 실패:', error);
    return { success: false, error: error.message, payment: null };
  }
};

/**
 * 결제 상태 업데이트
 */
export const updatePaymentStatus = async (
  orderId: string,
  status: Payment['status'],
  additionalData?: { payment_key?: string; approved_at?: string }
) => {
  try {
    const updateData: any = { status };
    if (additionalData?.payment_key) {
      updateData.payment_key = additionalData.payment_key;
    }
    if (additionalData?.approved_at) {
      updateData.approved_at = additionalData.approved_at;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, payment: data };
  } catch (error: any) {
    console.error('결제 상태 업데이트 실패:', error);
    return { success: false, error: error.message, payment: null };
  }
};

/**
 * 사용자 코인 충전 (RPC 호출)
 */
export const addCoins = async (userId: string, amount: number) => {
  try {
    const { data, error } = await supabase.rpc('add_coins', {
      user_id: userId,
      amount: amount,
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('코인 충전 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 주문 ID로 결제 정보 조회
 */
export const getPaymentByOrderId = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;

    return { success: true, payment: data };
  } catch (error: any) {
    console.error('결제 정보 조회 실패:', error);
    return { success: false, error: error.message, payment: null };
  }
};

/**
 * 사용자의 결제 내역 조회
 */
export const getPaymentsByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, payments: data || [] };
  } catch (error: any) {
    console.error('결제 내역 조회 실패:', error);
    return { success: false, error: error.message, payments: [] };
  }
};
