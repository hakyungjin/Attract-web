/**
 * FCM 푸시 알림 서비스
 *
 * TODO: Firebase Cloud Functions 구현 필요
 * - Firebase Cloud Functions에서 FCM API를 호출하는 함수 작성
 * - 또는 서버에서 FCM Admin SDK 사용
 *
 * 참고: https://firebase.google.com/docs/cloud-messaging
 */

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * 푸시 알림 전송
 *
 * TODO: Firebase Cloud Functions 또는 백엔드 API로 구현 필요
 * 현재는 로그만 출력하는 플레이스홀더
 */
export const sendPushToUser = async (userId: string, payload: PushPayload) => {
  try {
    console.log('📤 푸시 알림 전송 요청:', { userId, payload });

    // TODO: Firebase Cloud Functions 호출
    // const response = await fetch('YOUR_CLOUD_FUNCTION_URL/send-push', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, ...payload })
    // });

    // 임시로 성공 반환
    return { success: true, result: { message: 'Push notification queued' } };
  } catch (error) {
    console.error('푸시 전송 에러:', error);
    return { success: false, error };
  }
};

/**
 * 매칭 요청 알림 전송
 */
export const sendMatchRequestPush = async (
  toUserId: string,
  fromUserName: string,
  fromUserId: string
) => {
  return sendPushToUser(toUserId, {
    title: '💕 새로운 매칭 요청',
    body: `${fromUserName}님이 매칭을 요청했습니다`,
    data: {
      type: 'match_request',
      from_user_id: fromUserId
    }
  });
};

/**
 * 매칭 성사 알림 전송
 */
export const sendMatchSuccessPush = async (
  toUserId: string,
  matchedUserName: string,
  chatRoomId?: string
) => {
  return sendPushToUser(toUserId, {
    title: '🎉 매칭 성사!',
    body: `${matchedUserName}님과 매칭되었습니다! 대화를 시작해보세요.`,
    data: {
      type: 'match_success',
      chat_room_id: chatRoomId || ''
    }
  });
};

/**
 * 새 메시지 알림 전송
 */
export const sendMessagePush = async (
  toUserId: string,
  fromUserName: string,
  messagePreview: string,
  chatRoomId: string
) => {
  return sendPushToUser(toUserId, {
    title: `💬 ${fromUserName}`,
    body: messagePreview.length > 50 ? messagePreview.slice(0, 50) + '...' : messagePreview,
    data: {
      type: 'message',
      chat_room_id: chatRoomId
    }
  });
};
