import { Navigate, useRoutes } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { MainLayout } from "@/layouts/MainLayout";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import DailyPractice from "@/pages/Practice/Daily";
import UnitPractice from "@/pages/Practice/Unit";
import AssessmentPractice from "@/pages/Practice/Assessment";
import PracticeSession from "@/pages/Practice/Session";
import PracticeHistory from "@/pages/Practice/History";
import PracticeData from "@/pages/Practice/Detail";
import PracticeReport from "@/pages/Practice/Report";
import WrongRecords from "@/pages/WrongRecords";

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
            { path: "practice/assessment", element: <AssessmentPractice /> },
            { path: "practice/history", element: <PracticeHistory /> },
            { path: "practice/session/:sessionId", element: <PracticeSession /> },
            { path: "practice/detail/:sessionId", element: <PracticeData /> },
            { path: "practice/report/:sessionId", element: <PracticeReport /> },
            { path: "wrong-records", element: <WrongRecords /> },
          ],
        },
      ],
    },
  ]);
}
