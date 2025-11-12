import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * 路由守卫：要求用户已登录
 * 如果未登录，重定向到登录页
 */
export function requireAuth() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({
      to: '/login',
      search: { redirect: typeof window !== 'undefined' ? window.location.pathname : undefined },
    });
  }
}

/**
 * 路由守卫：要求用户未登录
 * 如果已登录，重定向到首页
 */
export function requireGuest() {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    throw redirect({ to: '/home' });
  }
}

