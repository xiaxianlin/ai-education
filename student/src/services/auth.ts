import { api } from '@/lib/api';

export interface LoginParams {
  phone: string;
  password: string;
}

export interface StudentInfo {
  id: string;
  name: string;
  phone: string;
  [key: string]: any;
}

export const authApi = {
  login: async (params: LoginParams): Promise<string> => {
    return api.post<string>('/login', params);
  },
  check: async (): Promise<StudentInfo> => {
    return api.get<StudentInfo>('/check');
  },
};

