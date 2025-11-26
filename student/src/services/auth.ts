import { api } from "@/lib/api";

export const AuthApi = {
  login: async (params: LoginParams) => {
    return api.post<string>("/login", params);
  },

  check: async () => {
    return api.get<CheckAuthResponse>("/check");
  },
};
