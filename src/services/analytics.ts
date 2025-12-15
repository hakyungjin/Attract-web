import { analytics } from '../lib/firebase';
import { logEvent } from 'firebase/analytics';

/**
 * Firebase Analytics 이벤트 로깅 유틸리티
 */

/**
 * 로그인 이벤트
 */
export const logLogin = (method: 'phone' | 'email' = 'phone') => {
  if (!analytics) return;
  
  logEvent(analytics, 'login', {
    method
  });
};

/**
 * 회원가입 이벤트
 */
export const logSignUp = (method: 'phone' = 'phone') => {
  if (!analytics) return;
  
  logEvent(analytics, 'sign_up', {
    method
  });
};

/**
 * 프로필 완성 이벤트
 */
export const logProfileComplete = () => {
  if (!analytics) return;
  
  logEvent(analytics, 'profile_complete');
};

/**
 * 프로필 수정 이벤트
 */
export const logProfileUpdate = () => {
  if (!analytics) return;
  
  logEvent(analytics, 'profile_update');
};

/**
 * 매칭 요청 이벤트
 */
export const logMatchRequest = () => {
  if (!analytics) return;
  
  logEvent(analytics, 'match_request');
};

/**
 * 매칭 성사 이벤트
 */
export const logMatchSuccess = () => {
  if (!analytics) return;
  
  logEvent(analytics, 'match_success');
};

/**
 * 이미지 업로드 이벤트
 */
export const logImageUpload = (type: 'avatar' | 'gallery' | 'post') => {
  if (!analytics) return;
  
  logEvent(analytics, 'image_upload', {
    image_type: type
  });
};

/**
 * 페이지 뷰 이벤트
 */
export const logPageView = (pageName: string) => {
  if (!analytics) return;
  
  logEvent(analytics, 'page_view', {
    page_name: pageName
  });
};

/**
 * 커스텀 이벤트
 */
export const logCustomEvent = (eventName: string, params?: Record<string, any>) => {
  if (!analytics) return;
  
  logEvent(analytics, eventName, params);
};

