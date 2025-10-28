import { request } from '@umijs/max';

export const CommonApi = {
  configs: async () => {
    const res = await request<ApiData<Configs>>('/configs');
    return res.data;
  },
};
