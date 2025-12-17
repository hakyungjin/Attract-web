import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name?: string;
  phone_number?: string;
  age?: number;
  gender?: string;
  location?: string;
  school?: string;
  mbti?: string;
  profile_image?: string;
  coins?: number;
  fcm_token?: string;
  created_at?: string;
  last_login?: string;
}

/**
 * FCM 토큰 업데이트
 */
export const updateFcmToken = async (userId: string, fcmToken: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ fcm_token: fcmToken })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('FCM 토큰 저장 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자 코인 조회
 */
export const getUserCoins = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, coins: data?.coins || 0 };
  } catch (error: any) {
    console.error('사용자 코인 조회 실패:', error);
    return { success: false, error: error.message, coins: 0 };
  }
};

/**
 * 사용자 코인 업데이트
 */
export const updateUserCoins = async (userId: string, coins: number) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ coins })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('사용자 코인 업데이트 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 전체 사용자 조회
 */
export const getAllUsers = async (orderBy: { column: string; ascending: boolean } = { column: 'created_at', ascending: false }) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order(orderBy.column, { ascending: orderBy.ascending });

    if (error) throw error;

    return { success: true, users: data || [] };
  } catch (error: any) {
    console.error('사용자 목록 조회 실패:', error);
    return { success: false, error: error.message, users: [] };
  }
};

/**
 * ID로 여러 사용자 조회
 */
export const getUsersByIds = async (userIds: string[]) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, profile_image')
      .in('id', userIds);

    if (error) throw error;

    return { success: true, users: data || [] };
  } catch (error: any) {
    console.error('사용자 정보 조회 실패:', error);
    return { success: false, error: error.message, users: [] };
  }
};

/**
 * 사용자 정보 조회
 */
export const getUserById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, user: data };
  } catch (error: any) {
    console.error('사용자 정보 조회 실패:', error);
    return { success: false, error: error.message, user: null };
  }
};
