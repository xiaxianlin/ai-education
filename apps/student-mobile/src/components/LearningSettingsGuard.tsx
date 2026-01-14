import { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { useProfileStore } from "../stores/useProfileStore";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * 学习设置路由守卫组件
 * 检查用户是否已设置学习信息，如果未设置则强制跳转到个人中心页面
 */
export function LearningSettingsGuard({ children }: { children: React.ReactElement | null }) {
  const router = useRouter();
  const segments = useSegments();
  const { hasSettings, fetchProfile, loading: profileLoading } = useProfileStore();
  const { token, _hasHydrated: authHydrated } = useAuthStore();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // 等待认证和配置都准备好
  useEffect(() => {
    if (!authHydrated) return;
    if (!token) return;
    if (profileLoading) return;

    setInitialLoadComplete(true);
  }, [authHydrated, token, profileLoading]);

  // 预加载学习设置（仅在认证完成后）
  useEffect(() => {
    if (authHydrated && token) {
      fetchProfile();
    }
  }, [authHydrated, token, fetchProfile]);

  useEffect(() => {
    // 等待所有资源加载完成
    if (!initialLoadComplete) return;

    // 获取当前页面类型
    const currentRoute = segments[segments.length - 1] || "";
    const isProfilePage = currentRoute === "profile";
    const isLoginPage = segments[0] === "login";

    // 如果未登录，不做学习设置检查
    if (isLoginPage) return;

    // 如果在学习设置中，不做检查
    if (isProfilePage) return;

    // 检查学习设置状态
    if (!hasSettings) {
      // 未设置学习信息，强制跳转到个人中心页面
      router.replace("/(tabs)/profile");
    }
  }, [initialLoadComplete, hasSettings, segments, router]);

  return children;
}
