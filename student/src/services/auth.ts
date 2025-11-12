import { api } from '@/lib/api';
import type { StudentInfo, LoginParams } from '@/lib/types/api';

export const authApi = {
  login: async (params: LoginParams): Promise<string> => {
    return api.post<string>('/login', params);
  },
  check: async (): Promise<StudentInfo> => {
    return api.get<StudentInfo>('/check');
  },
};

