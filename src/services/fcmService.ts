import { supabase } from '../lib/supabase';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Supabase Edge Function을 통해 푸시 알림 전송
 */
export const sendPushToUser = async (userId: string, payload: PushPayload) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-push', {
      body: {
        userId,
        title: payload.title,
        body: payload.body,
        data: payload.data || {}
      }
    });

    if (error) {
      console.error('푸시 전송 실패:', error);
      return { success: false, error };
    }

    console.log('📤 푸시 전송 결과:', data);
    return { success: true, result: data };
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
