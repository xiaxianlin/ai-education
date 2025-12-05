import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Navigate } from "react-router-dom";

/**
 * 路由守卫组件：要求用户已登录
 */
export function ProtectedRouteGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, check } = useAuthStore();

  useEffect(() => {
    check();
  }, [check]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
