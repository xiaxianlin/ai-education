import { api } from "@/lib/api";
import type { LoginParams, CheckAuthResponse } from "@/lib/types/schema";

export const authApi = {
  login: async (params: LoginParams): Promise<string> => {
    const token = await api.post<string>("/login", params);
    return token;
  },
  check: async (): Promise<CheckAuthResponse> => {
    return api.get<CheckAuthResponse>("/check");
  },
};
