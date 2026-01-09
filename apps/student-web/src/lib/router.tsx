import { MainLayout } from "@/common/layouts/MainLayout";
import { RootLayout } from "@/common/layouts/RootLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import AbilityPractice from "@/pages/PracticeAbility";
import UnitPractice from "@/pages/PracticeUnit";
import PracticeHistory from "@/pages/PracticeRecord";
import PracticeSessionData from "@/pages/PracticeResult";
import PracticeSession from "@/pages/PracticeSession";
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
            { path: "practice/ability", element: <AbilityPractice /> },
            { path: "practice/unit", element: <UnitPractice /> },
            { path: "practice/record", element: <PracticeHistory /> },
            { path: "practice/:sessionId", element: <PracticeSession /> },
            { path: "practice/result/:sessionId", element: <PracticeSessionData /> },
          ],
        },
      ],
    },
  ]);
}
