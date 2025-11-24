import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import LoginPage from "../pages/login/page";
import ProfileEditPage from "../pages/profile-edit/page";
import NotificationsPage from "../pages/notifications/page";
import ProfileDetailPage from "../pages/profile-detail/page";
import AdminPage from "../pages/admin/page";
import CoinShopPage from "../pages/coin-shop/page";
import MatchingRequestsPage from "../pages/matching-requests/page";

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
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
