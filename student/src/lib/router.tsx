import { lazy } from "react";
import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { RootLayout } from "@/layouts/RootLayout";
import { MainLayout } from "@/layouts/MainLayout";

/**
 * 路由守卫：要求用户已登录
 * 如果未登录，重定向到登录页
 */
function requireAuth() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({
      to: "/login",
      search: { redirect: window.location.pathname },
    });
  }
}

/**
 * 路由守卫：要求用户未登录
 * 如果已登录，重定向到首页
 */
function requireGuest() {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    throw redirect({ to: "/home" });
  }
}

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

const rootRoute = createRootRoute({
  component: RootLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
  beforeLoad: requireGuest,
});

const minRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MainLayout,
  beforeLoad: () => {
    requireAuth();
    redirect({ to: "/home" });
  },
});

const homeRoute = createRoute({
  getParentRoute: () => minRoute,
  path: "/home",
  component: Home,
});

const wrongRoute = createRoute({
  getParentRoute: () => minRoute,
  path: "/wrong",
  component: WrongQuestions,
});

const historyRoute = createRoute({
  getParentRoute: () => minRoute,
  path: "/history",
  component: PracticeHistory,
});

const practiceHistoryRoute = createRoute({
  getParentRoute: () => minRoute,
  path: "/practice-history",
  component: PracticeHistory,
  beforeLoad: requireAuth,
});

const profileRoute = createRoute({
  getParentRoute: () => minRoute,
  path: "/profile",
  component: Profile,
});

const practiceResultRoute = createRoute({
  getParentRoute: () => minRoute,
  path: "/practice-result/$sessionId",
  component: PracticeResult,
});

const unitPracticeRoute = createRoute({
  getParentRoute: () => minRoute,
  path: "/unit-practice",
  component: UnitPractice,
});

// 通用练习会话路由
const practiceSessionRoute = createRoute({
  getParentRoute: () => minRoute,
  path: "/practice/$sessionId",
  component: PracticeSession,
});

const settingsRoute = createRoute({
  getParentRoute: () => minRoute,
  path: "/settings",
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  minRoute,
  homeRoute,
  wrongRoute,
  historyRoute,
  practiceHistoryRoute,
  profileRoute,
  practiceResultRoute,
  unitPracticeRoute,
  practiceSessionRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
