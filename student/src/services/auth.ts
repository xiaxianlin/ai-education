import { api } from '@/lib/api';
import type { LoginParams, LoginResponse, CheckAuthResponse } from '@/lib/types/schema';

export const authApi = {
  login: async (params: LoginParams): Promise<string> => {
    const response = await api.post<LoginResponse>('/login', params);
    return response.token;
  },
  check: async (): Promise<CheckAuthResponse> => {
    return api.get<CheckAuthResponse>('/check');
  },
};

