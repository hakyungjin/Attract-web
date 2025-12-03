import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

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
  {
    path: "/",
    element: <Home />,
  },
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
    path: "/profile-edit",
    element: <ProfileEditPage />,
  },
  {
    path: "/notifications",
    element: <NotificationsPage />,
  },
  {
    path: "/profile-detail",
    element: <ProfileDetailPage />,
  },
  {
    path: "/my-profile",
    element: <MyProfilePage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/coin-shop",
    element: <CoinShopPage />,
  },
  {
    path: "/matching-requests",
    element: <MatchingRequestsPage />,
  },
  {
    path: "/payment/success",
    element: <PaymentSuccessPage />,
  },
  {
    path: "/payment/fail",
    element: <PaymentFailPage />,
  },
  {
    path: "/post/create",
    element: <CreatePostPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
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
