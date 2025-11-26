/**
 * 认证服务 API
 * 对应后端 server/student/routes/auth.py
 */
import { api } from "@/lib/api";

export const authService = {
  /**
   * 用户登录
   * POST /login
   */
  login: async (params: LoginParams) => {
    return api.post<string>("/login", params);
  },

  /**
   * 检查登录状态
   * GET /check
   */
  check: async () => {
    return api.get<CheckAuthResponse>("/check");
  },
};
