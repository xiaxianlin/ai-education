import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { RootLayout } from "@/layouts/RootLayout";
import { MainLayout } from "@/layouts/MainLayout";

// 懒加载页面组件
const Login = lazy(() =>
  import("../pages/Login").then((m) => ({ default: m.Login }))
);
const Home = lazy(() =>
  import("../pages/Home").then((m) => ({ default: m.Home }))
);
const WrongQuestions = lazy(() =>
  import("../pages/WrongQuestions/WrongQuestions").then((m) => ({
    default: m.WrongQuestions,
  }))
);
const PracticeHistory = lazy(() =>
  import("../pages/PracticeHistory").then((m) => ({
    default: m.PracticeHistory,
  }))
);
const Profile = lazy(() =>
  import("../pages/Profile").then((m) => ({ default: m.Profile }))
);
const UnitPractice = lazy(() =>
  import("../pages/UnitPractice").then((m) => ({
    default: m.UnitPractice,
  }))
);
const PracticeSession = lazy(() =>
  import("../pages/PracticeSession").then((m) => ({
    default: m.PracticeSession,
  }))
);
const PracticeResult = lazy(() =>
  import("../pages/PracticeResult").then((m) => ({
    default: m.PracticeResult,
  }))
);
const Settings = lazy(() =>
  import("../pages/Settings").then((m) => ({ default: m.Settings }))
);

/**
 * 路由守卫组件：要求用户已登录
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/**
 * 路由守卫组件：要求用户未登录
 */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "login",
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/home" replace /> },
          { path: "home", element: <Home /> },
          { path: "wrong", element: <WrongQuestions /> },
          { path: "history", element: <PracticeHistory /> },
          { path: "practice-history", element: <PracticeHistory /> },
          { path: "profile", element: <Profile /> },
          { path: "unit-practice", element: <UnitPractice /> },
          { path: "practice/:sessionId", element: <PracticeSession /> },
          { path: "practice-result/:sessionId", element: <PracticeResult /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
