import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import LoginPage from "../pages/login/page";
import PhoneLoginPage from "../pages/login/PhoneLogin";
import AuthPageSignup from "../pages/auth/index";
import AuthPageLogin from "../pages/auth/login";
import SignupPage from "../pages/signup/SignupPage";
import QuickSignupPage from "../pages/signup/QuickSignupPage";
import ProfileEditPage from "../pages/profile-edit/page";
import NotificationsPage from "../pages/notifications/page";
import ProfileDetailPage from "../pages/profile-detail/page";
import AdminPage from "../pages/admin/page";
import CoinShopPage from "../pages/coin-shop/page";
import MatchingRequestsPage from "../pages/matching-requests/page";
import PaymentSuccessPage from "../pages/payment/success";
import PaymentFailPage from "../pages/payment/fail";
import CreatePostPage from "../pages/post/create";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <AuthPageSignup />,
  },
  {
    path: "/login/signin",
    element: <AuthPageLogin />,
  },
  {
    path: "/login/email",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/signup/phone",
    element: <PhoneLoginPage />,
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
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
