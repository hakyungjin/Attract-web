import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Suspense, useEffect } from "react";
import { cleanupExpiredMatchingRequests } from "./services/matchingService";
import { initPushNotifications } from "./services/pushNotification";

function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // 앱 시작 시 만료된 매칭 요청 정리
    cleanupExpiredMatchingRequests();
    
    // 1시간마다 자동 정리
    const interval = setInterval(() => {
      cleanupExpiredMatchingRequests();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 로그인 시 푸시 알림 초기화
  useEffect(() => {
    if (user?.id) {
      initPushNotifications(user.id);
    }
  }, [user?.id]);

  const loadingScreen = (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="ri-heart-fill text-primary-500 animate-pulse-soft"></i>
        </div>
      </div>
      <div className="text-sm font-medium text-slate-500 animate-pulse">로딩 중...</div>
    </div>
  );

  if (loading) {
    return loadingScreen;
  }

  return (
    <Suspense fallback={loadingScreen}>
      <AppRoutes />
    </Suspense>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
