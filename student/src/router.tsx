import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { WrongQuestions } from './pages/WrongQuestions';
import { PracticeHistory } from './pages/PracticeHistory';
import { Profile } from './pages/Profile';
import { DailyPractice } from './pages/DailyPractice';
import { DailyPracticeResult } from './pages/DailyPracticeResult';
import { UnitPractice } from './pages/UnitPractice';
import { UnitPracticeSession } from './pages/UnitPracticeSession';
import { Assessment } from './pages/Assessment';
import { Settings } from './pages/Settings';
import { useAuthStore } from './stores/useAuthStore';

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    throw redirect({ to: '/home' });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: '/home' });
    }
  },
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: Home,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const wrongRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wrong',
  component: WrongQuestions,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: PracticeHistory,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const dailyPracticeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-practice',
  component: DailyPractice,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const dailyPracticeResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-practice/result',
  component: DailyPracticeResult,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const unitPracticeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unit-practice',
  component: UnitPractice,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const unitPracticeSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unit-practice/$sessionId',
  component: UnitPracticeSession,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const assessmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assessment',
  component: Assessment,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  homeRoute,
  wrongRoute,
  historyRoute,
  profileRoute,
  dailyPracticeRoute,
  dailyPracticeResultRoute,
  unitPracticeRoute,
  unitPracticeSessionRoute,
  assessmentRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

