import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { GuestRouteGuard } from "@/components/guards/GuestRouteGuard";
import { ProtectedRouteGuard } from "@/components/guards/ProtectedRouteGuard";

// 懒加载页面组件
const Login = lazy(() => import("@/pages/Login"));
const Home = lazy(() => import("@/pages/Home"));
const Profile = lazy(() => import("@/pages/Profile"));
const DailyPractice = lazy(() => import("@/pages/Practice/Daily"));
const UnitPractice = lazy(() => import("@/pages/Practice/Unit"));
const AssessmentPractice = lazy(() => import("@/pages/Practice/Assessment"));
const PracticeSession = lazy(() => import("@/pages/Practice/Session"));
const PracticeHistory = lazy(() => import("@/pages/Practice/History"));
const PracticeReport = lazy(() => import("@/pages/Practice/Report"));
const Settings = lazy(() => import("@/pages/Settings"));
const WrongRecords = lazy(() => import("@/pages/WrongRecords"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "login",
        element: (
          <GuestRouteGuard>
            <Login />
          </GuestRouteGuard>
        ),
      },
      {
        path: "/",
        element: (
          <ProtectedRouteGuard>
            <MainLayout />
          </ProtectedRouteGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/home" replace /> },
          { path: "home", element: <Home /> },
          { path: "profile", element: <Profile /> },
          { path: "practice/daily", element: <DailyPractice /> },
          { path: "practice/unit", element: <UnitPractice /> },
          { path: "practice/assessment", element: <AssessmentPractice /> },
          { path: "practice/history", element: <PracticeHistory /> },
          { path: "practice/session/:sessionId", element: <PracticeSession /> },
          { path: "practice/report/:sessionId", element: <PracticeReport /> },
          { path: "wrong-records", element: <WrongRecords /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
