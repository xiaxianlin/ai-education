import { lazy } from 'react';
import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { requireAuth, requireGuest } from './lib/router-utils';
import { LoadingPage } from './components/biz/LoadingSpinner';

// 懒加载页面组件
const Login = lazy(() => import('./pages/Login/Login').then(m => ({ default: m.Login })));
const Home = lazy(() => import('./pages/Home/Home').then(m => ({ default: m.Home })));
const WrongQuestions = lazy(() => import('./pages/WrongQuestions/WrongQuestions').then(m => ({ default: m.WrongQuestions })));
const PracticeHistory = lazy(() => import('./pages/PracticeHistory/PracticeHistory').then(m => ({ default: m.PracticeHistory })));
const Profile = lazy(() => import('./pages/Profile/Profile').then(m => ({ default: m.Profile })));
const DailyPracticeResult = lazy(() => import('./pages/DailyPracticeResult/DailyPracticeResult').then(m => ({ default: m.DailyPracticeResult })));
const UnitPractice = lazy(() => import('./pages/UnitPractice/UnitPractice').then(m => ({ default: m.UnitPractice })));
const Assessment = lazy(() => import('./pages/Assessment/Assessment').then(m => ({ default: m.Assessment })));
const PracticeSession = lazy(() => import('./pages/PracticeSession/PracticeSession').then(m => ({ default: m.PracticeSession })));
const Settings = lazy(() => import('./pages/Settings/Settings').then(m => ({ default: m.Settings })));

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    requireAuth();
    throw redirect({ to: '/home' });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
  beforeLoad: requireGuest,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: Home,
  beforeLoad: requireAuth,
});

const wrongRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wrong',
  component: WrongQuestions,
  beforeLoad: requireAuth,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: PracticeHistory,
  beforeLoad: requireAuth,
});

const practiceHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/practice-history',
  component: PracticeHistory,
  beforeLoad: requireAuth,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
  beforeLoad: requireAuth,
});

const dailyPracticeResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-practice/result',
  component: DailyPracticeResult,
  beforeLoad: requireAuth,
});

const unitPracticeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unit-practice',
  component: UnitPractice,
  beforeLoad: requireAuth,
});

const assessmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assessment',
  component: Assessment,
  beforeLoad: requireAuth,
});

// 通用练习会话路由
const practiceSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/practice/$sessionId',
  component: PracticeSession,
  beforeLoad: requireAuth,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
  beforeLoad: requireAuth,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  homeRoute,
  wrongRoute,
  historyRoute,
  practiceHistoryRoute,
  profileRoute,
  dailyPracticeResultRoute,
  unitPracticeRoute,
  assessmentRoute,
  practiceSessionRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

