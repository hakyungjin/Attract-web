import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Suspense, useEffect } from "react";
import { cleanupExpiredMatchingRequests } from "./services/matchingService";
import { initPushNotifications } from "./services/pushNotification";
import { ToastProvider, useToast, setGlobalToast } from "./components/base/Toast";
import ScrollToTop from "./components/ScrollToTop";
import { App as CapacitorApp } from "@capacitor/app";

function AppContent() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  // 전역 토스트 함수 설정
  useEffect(() => {
    setGlobalToast(showToast);
  }, [showToast]);

  // Clean up expired matching requests on start and repeat hourly
  useEffect(() => {
    cleanupExpiredMatchingRequests();
    const interval = setInterval(() => {
      cleanupExpiredMatchingRequests();
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize push notifications when user logs in
  useEffect(() => {
    if (user?.id) {
      initPushNotifications(user.id);
    }
  }, [user?.id]);

  const loadingScreen = (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-[400px] bg-slate-50 min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="ri-heart-fill text-primary-500 animate-pulse-soft"></i>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500 animate-pulse">로딩 중...</div>
      </div>
    </div>
  );

  if (loading) {
    return loadingScreen;
  }

  return (
    <Suspense fallback={loadingScreen}>
      {/* 고정 너비 모바일 앱 스타일 */}
      <div className="min-h-screen bg-slate-100 flex justify-center">
        <div className="w-full max-w-[400px] bg-slate-50 min-h-screen relative overflow-hidden">
          <AppRoutes />
        </div>
      </div>
    </Suspense>
  );
}

// 뒤로가기 두 번 누르면 앱 종료를 위한 타임스탬프
let lastBackPress = 0;
let exitToast: HTMLDivElement | null = null;

// 종료 안내 토스트 표시
const showExitToast = () => {
  // 기존 토스트 제거
  if (exitToast) {
    exitToast.remove();
  }
  
  exitToast = document.createElement('div');
  exitToast.innerHTML = '한 번 더 누르면 앱이 종료됩니다';
  exitToast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 14px;
    z-index: 9999;
    animation: fadeIn 0.2s ease;
  `;
  document.body.appendChild(exitToast);
  
  // 2초 후 자동 제거
  setTimeout(() => {
    if (exitToast) {
      exitToast.remove();
      exitToast = null;
    }
  }, 2000);
};

function App() {
  // 네이티브 앱 뒤로가기 버튼 핸들러
  useEffect(() => {
    const backButtonHandler = CapacitorApp.addListener('backButton', () => {
      // 홈 화면인지 확인 (/, /home, 또는 히스토리가 1 이하)
      const isHomePage = window.location.pathname === '/' || 
                         window.location.pathname === '/home' ||
                         window.location.pathname === '/login';
      
      if (isHomePage || window.history.length <= 1) {
        // 2초 내에 두 번 누르면 앱 종료
        const now = Date.now();
        if (now - lastBackPress < 2000) {
          CapacitorApp.exitApp();
        } else {
          lastBackPress = now;
          showExitToast();
        }
      } else {
        // 이전 화면으로 이동
        window.history.back();
      }
    });

    return () => {
      backButtonHandler.then(handler => handler.remove());
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
