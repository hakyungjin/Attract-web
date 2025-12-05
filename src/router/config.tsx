import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazy load all pages for better performance
const NotFound = lazy(() => import("../pages/NotFound"));
const Home = lazy(() => import("../pages/home/page"));
const LoginPage = lazy(() => import("../pages/login/page"));
const SignupProfilePage = lazy(() => import("../pages/signup-profile/page"));
const QuickSignupPage = lazy(() => import("../pages/signup/QuickSignupPage"));
const ProfileEditPage = lazy(() => import("../pages/profile-edit/page"));
const NotificationsPage = lazy(() => import("../pages/notifications/page"));
const ProfileDetailPage = lazy(() => import("../pages/profile-detail/page"));
const MyProfilePage = lazy(() => import("../pages/my-profile/page"));
const AdminPage = lazy(() => import("../pages/admin/page"));
const CoinShopPage = lazy(() => import("../pages/coin-shop/page"));
const MatchingRequestsPage = lazy(() => import("../pages/matching-requests/page"));
const PaymentSuccessPage = lazy(() => import("../pages/payment/success"));
const PaymentFailPage = lazy(() => import("../pages/payment/fail"));
const CreatePostPage = lazy(() => import("../pages/post/create"));
const SettingsPage = lazy(() => import("../pages/settings/page"));
const FAQPage = lazy(() => import("../pages/faq/page"));
const SupportPage = lazy(() => import("../pages/support/page"));
const PolicyDetailPage = lazy(() => import("../pages/policy/page"));

const routes: RouteObject[] = [
  // 🔒 로그인 필요한 페이지들
  {
    path: "/",
    element: <ProtectedRoute><Home /></ProtectedRoute>,
  },
  {
    path: "/profile-edit",
    element: <ProtectedRoute><ProfileEditPage /></ProtectedRoute>,
  },
  {
    path: "/notifications",
    element: <ProtectedRoute><NotificationsPage /></ProtectedRoute>,
  },
  {
    path: "/profile-detail",
    element: <ProtectedRoute><ProfileDetailPage /></ProtectedRoute>,
  },
  {
    path: "/my-profile",
    element: <ProtectedRoute><MyProfilePage /></ProtectedRoute>,
  },
  {
    path: "/admin",
    element: <ProtectedRoute><AdminPage /></ProtectedRoute>,
  },
  {
    path: "/coin-shop",
    element: <ProtectedRoute><CoinShopPage /></ProtectedRoute>,
  },
  {
    path: "/matching-requests",
    element: <ProtectedRoute><MatchingRequestsPage /></ProtectedRoute>,
  },
  {
    path: "/payment/success",
    element: <ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>,
  },
  {
    path: "/payment/fail",
    element: <ProtectedRoute><PaymentFailPage /></ProtectedRoute>,
  },
  {
    path: "/post/create",
    element: <ProtectedRoute><CreatePostPage /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
  },
  
  // 🔓 로그인 없이 접근 가능한 페이지들
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup-profile",
    element: <SignupProfilePage />,
  },
  {
    path: "/signup/quick",
    element: <QuickSignupPage />,
  },
  {
    path: "/faq",
    element: <FAQPage />,
  },
  {
    path: "/support",
    element: <SupportPage />,
  },
  {
    path: "/policy/:type",
    element: <PolicyDetailPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
