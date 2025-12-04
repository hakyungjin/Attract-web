import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

/**
 * 24시간 이상 pending 상태인 매칭 요청을 자동 삭제
 *
 * @returns {Promise<boolean>} 성공 여부
 *
 * @example
 * const success = await cleanupExpiredMatchingRequests();
 * if (success) console.log('정리 완료');
 */
export const cleanupExpiredMatchingRequests = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('auto_delete_expired_matching_requests');

    if (error) {
      logger.error('만료된 매칭 요청 삭제 실패', error);
      return false;
    }

    logger.info('만료된 매칭 요청 삭제 완료');
    return true;
  } catch (error) {
    logger.error('매칭 요청 정리 중 오류', error);
    return false;
  }
};

/**
 * 특정 사용자의 pending 매칭 요청 조회
 *
 * @param {string} userId - 조회할 사용자 ID
 * @returns {Promise<any[]>} 매칭 요청 배열
 *
 * @example
 * const requests = await getPendingMatchingRequests('user-id-123');
 */
export const getPendingMatchingRequests = async (userId: string): Promise<any[]> => {
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
    logger.error('매칭 요청 조회 실패', error);
    return [];
  }
};

/**
 * 매칭 요청 수락
 *
 * @param {number} requestId - 매칭 요청 ID
 * @returns {Promise<boolean>} 성공 여부
 *
 * @example
 * const success = await acceptMatchingRequest(123);
 */
export const acceptMatchingRequest = async (requestId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('matching_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('매칭 수락 실패', error);
    return false;
  }
};

/**
 * 매칭 요청 거절
 *
 * @param {number} requestId - 매칭 요청 ID
 * @returns {Promise<boolean>} 성공 여부
 *
 * @example
 * const success = await rejectMatchingRequest(123);
 */
export const rejectMatchingRequest = async (requestId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('matching_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('매칭 거절 실패', error);
    return false;
  }
};
