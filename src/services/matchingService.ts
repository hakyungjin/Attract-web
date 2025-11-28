import { supabase } from '../lib/supabase';

/**
 * 24시간 이상 pending 상태인 매칭 요청을 자동 삭제
 * 앱 시작 시 또는 주기적으로 호출
 */
export const cleanupExpiredMatchingRequests = async () => {
  try {
    const { error } = await supabase.rpc('auto_delete_expired_matching_requests');
    
    if (error) {
      console.error('만료된 매칭 요청 삭제 실패:', error);
      return false;
    }
    
    console.log('✅ 만료된 매칭 요청 삭제 완료');
    return true;
  } catch (error) {
    console.error('매칭 요청 정리 중 오류:', error);
    return false;
  }
};

/**
 * 특정 사용자의 pending 매칭 요청 조회
 */
export const getPendingMatchingRequests = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('matching_requests')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('매칭 요청 조회 실패:', error);
    return [];
  }
};

/**
 * 매칭 요청 수락
 */
export const acceptMatchingRequest = async (requestId: number) => {
  try {
    const { error } = await supabase
      .from('matching_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('매칭 수락 실패:', error);
    return false;
  }
};

/**
 * 매칭 요청 거절
 */
export const rejectMatchingRequest = async (requestId: number) => {
  try {
    const { error } = await supabase
      .from('matching_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('매칭 거절 실패:', error);
    return false;
  }
};
