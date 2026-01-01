import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 로딩 중일 때는 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // localStorage에서도 확인 (새로고침 시 useAuth가 아직 로드되지 않았을 수 있음)
  // AuthContext는 'auth_user' 키를 사용합니다
  const localUser = localStorage.getItem('auth_user');
  const parsedLocalUser = localUser ? JSON.parse(localUser) : null;
  
  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!user && !localUser) {
    // 현재 경로를 저장해서 로그인 후 돌아올 수 있게 함
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 프로필 완료 여부 확인
  const profileCompleted = (user as any)?.profile_completed || parsedLocalUser?.profile_completed;
  
  // 프로필이 완료되지 않았으면 프로필 작성 페이지로 리다이렉트
  if (!profileCompleted && location.pathname !== '/signup-profile') {
    return <Navigate to="/signup-profile" replace />;
  }

  return <>{children}</>;
}
