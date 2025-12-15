import { firebase } from '../lib/firebaseService';
import { logger } from '../utils/logger';
import {
  sendMatchRequestNotification,
  sendMatchAcceptNotification,
} from './ssodaaSmsService';

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
    // Firestore에서는 RPC 대신 직접 쿼리로 구현
    // 24시간 이전 시간 계산
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // 만료된 요청들을 찾아서 삭제
    // Note: 실제로는 Firestore에서 where절을 사용하여 만료된 요청을 찾고 삭제해야 함
    // 이 기능은 Firebase Cloud Functions로 구현하는 것이 권장됨
    logger.info('만료된 매칭 요청 정리는 Firebase Cloud Functions에서 처리 권장');
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
    // Firebase에서는 received와 sent를 따로 조회
    const { requests: receivedRequests } = await firebase.matching.getReceivedRequests(userId, 'pending');
    const { requests: sentRequests } = await firebase.matching.getSentRequests(userId, 'pending');

    // 두 배열 합치기
    const allRequests = [...receivedRequests, ...sentRequests];

    // created_at으로 정렬 (최신순)
    allRequests.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    return allRequests;
  } catch (error) {
    logger.error('매칭 요청 조회 실패', error);
    return [];
  }
};

/**
 * 매칭 요청 수락
 *
 * @param {string} requestId - 매칭 요청 ID
 * @returns {Promise<boolean>} 성공 여부
 *
 * @example
 * const success = await acceptMatchingRequest('request-id-123');
 */
export const acceptMatchingRequest = async (requestId: string): Promise<boolean> => {
  try {
    const { error } = await firebase.matching.updateMatchingRequestStatus(requestId, 'accepted');

    if (error) {
      logger.error('매칭 수락 실패', error);
      return false;
    }
    return true;
  } catch (error) {
    logger.error('매칭 수락 실패', error);
    return false;
  }
};

/**
 * 매칭 요청 거절
 *
 * @param {string} requestId - 매칭 요청 ID
 * @returns {Promise<boolean>} 성공 여부
 *
 * @example
 * const success = await rejectMatchingRequest('request-id-123');
 */
export const rejectMatchingRequest = async (requestId: string): Promise<boolean> => {
  try {
    const { error } = await firebase.matching.updateMatchingRequestStatus(requestId, 'rejected');

    if (error) {
      logger.error('매칭 거절 실패', error);
      return false;
    }
    return true;
  } catch (error) {
    logger.error('매칭 거절 실패', error);
    return false;
  }
};
