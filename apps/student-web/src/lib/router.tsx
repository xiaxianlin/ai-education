import { MainLayout } from "@/common/layouts/MainLayout";
import { RootLayout } from "@/common/layouts/RootLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Assessment from "@/pages/Practice/Assessment";
import DailyPractice from "@/pages/Practice/Daily";
import UnitPractice from "@/pages/Practice/Unit";
import PracticeHistory from "@/pages/PracticeRecord";
import PracticeSessionData from "@/pages/PracticeResult";
import PracticeSession from "@/pages/PracticeSession";
import Profile from "@/pages/Profile";
import { Navigate, useRoutes } from "react-router-dom";

export function Router() {
  return useRoutes([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "/",
          element: <MainLayout />,
          children: [
            { index: true, element: <Navigate to="/home" replace /> },
            { path: "home", element: <Home /> },
            { path: "profile", element: <Profile /> },
            { path: "practice/daily", element: <DailyPractice /> },
            { path: "practice/unit", element: <UnitPractice /> },
            { path: "practice/assessment", element: <Assessment /> },
            { path: "practice/record", element: <PracticeHistory /> },
            { path: "practice/session/:sessionId", element: <PracticeSession /> },
            { path: "practice/result/:sessionId", element: <PracticeSessionData /> },
          ],
        },
      ],
    },
  ]);
}
