import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { updateFcmToken } from './userService';

export const initPushNotifications = async (userId: string) => {
  // 웹에서는 푸시 알림 미지원
  if (!Capacitor.isNativePlatform()) {
    console.log('푸시 알림은 네이티브 앱에서만 지원됩니다.');
    return;
  }

  try {
    // 권한 요청
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('푸시 알림 권한이 거부되었습니다.');
      return;
    }

    // 푸시 알림 등록
    await PushNotifications.register();

    // 토큰 수신 리스너
    PushNotifications.addListener('registration', async (token) => {
      console.log('📱 푸시 토큰:', token.value);

      // FCM 토큰 저장
      const result = await updateFcmToken(userId, token.value);

      if (!result.success) {
        console.error('FCM 토큰 저장 실패:', result.error);
      } else {
        console.log('✅ FCM 토큰 저장 완료');
      }
    });

    // 등록 에러 리스너
    PushNotifications.addListener('registrationError', (error) => {
      console.error('푸시 알림 등록 실패:', error);
    });

    // 푸시 알림 수신 리스너 (앱이 포그라운드일 때)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📬 푸시 알림 수신:', notification);
      
      // 인앱 알림 표시 (선택사항)
      if (notification.title) {
        // 커스텀 토스트나 모달로 표시 가능
        alert(`${notification.title}\n${notification.body || ''}`);
      }
    });

    // 푸시 알림 탭 리스너 (알림 클릭 시)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('🔔 알림 클릭:', notification);
      
      // 알림 데이터에 따라 페이지 이동
      const data = notification.notification.data;
      if (data?.type === 'match_request') {
        window.location.href = '/matching-requests';
      } else if (data?.type === 'match_success') {
        window.location.href = '/';
      } else if (data?.type === 'message') {
        window.location.href = '/';
      }
    });

    console.log('✅ 푸시 알림 초기화 완료');
  } catch (error) {
    console.error('푸시 알림 초기화 실패:', error);
  }
};

// 푸시 알림 해제
export const unregisterPushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await PushNotifications.removeAllListeners();
    console.log('푸시 알림 해제 완료');
  } catch (error) {
    console.error('푸시 알림 해제 실패:', error);
  }
};
