import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import LoginPage from "../pages/login/page";
import SignupProfilePage from "../pages/signup-profile/page";
import ProfileEditPage from "../pages/profile-edit/page";
import NotificationsPage from "../pages/notifications/page";
import ProfileDetailPage from "../pages/profile-detail/page";
import AdminPage from "../pages/admin/page";
import CoinShopPage from "../pages/coin-shop/page";
import MatchingRequestsPage from "../pages/matching-requests/page";
import PaymentSuccessPage from "../pages/payment/success";
import PaymentFailPage from "../pages/payment/fail";
import CreatePostPage from "../pages/post/create";
import SettingsPage from "../pages/settings/page";
import FAQPage from "../pages/faq/page";
import SupportPage from "../pages/support/page";

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
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
