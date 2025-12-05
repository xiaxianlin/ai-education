import { request } from '@umijs/max';

export interface LoginResponse {
  token: string;
  manager: {
    id: string;
    username: string;
    type: number;
  };
}

export const AuthApi = {
  check: async () => {
    const res = await request<ApiData<Manager>>('/check');
    return res.data;
  },

  login: async (data: LoginModel) => {
    const res = await request<ApiData<LoginResponse>>('/login', { method: 'POST', data });
    return res.data;
  },

  modifyPassword: async (data: ModifyPasswordModel) => {
    await request<ApiData<void>>('/modify_password', { method: 'POST', data });
  },
};
