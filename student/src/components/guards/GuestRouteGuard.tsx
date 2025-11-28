import { useAuthStore } from "@/stores/auth-store";
import { Navigate } from "react-router-dom";

/**
 * 路由守卫组件：要求用户未登录
 */
export function GuestRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}
