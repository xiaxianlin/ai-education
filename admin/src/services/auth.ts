import { request } from '@umijs/max';

export const AuthApi = {
  check: async () => {
    const res = await request<ApiData<Manager>>('/check');
    return res.data;
  },

  login: async (data: LoginModel) => {
    const res = await request<ApiData<string>>('/login', { method: 'POST', data });
    return res.data;
  },

  modifyPassword: async (data: ModifyPasswordModel) => {
    await request<ApiData<string>>('/modify_password', { method: 'POST', data });
  },
};
