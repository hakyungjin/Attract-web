import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Suspense, useEffect } from "react";
import { cleanupExpiredMatchingRequests } from "./services/matchingService";
import { initPushNotifications } from "./services/pushNotification";
import { ToastProvider, useToast, setGlobalToast } from "./components/base/Toast";

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

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
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
