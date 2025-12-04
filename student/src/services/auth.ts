/**
 * 认证服务 API
 * 对应后端 server/student/routes/auth.py
 */
import { api } from "@/lib/api";
import type { StudentLoginRequest, LoginResponse } from "@/types";

export const authService = {
  /**
   * 学生登录
   * POST /login
   */
  login: async (params: StudentLoginRequest) => {
    return api.post<LoginResponse>("/login", params);
  },

  /**
   * 检查登录状态
   * GET /check
   */
  check: async () => {
    return api.get<void>("/check");
  },
};
