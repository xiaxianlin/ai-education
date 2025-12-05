import { request } from '@umijs/max';

export interface ConfigsParams {
  subject?: string;
  grade?: number;
}

export const CommonApi = {
  configs: async (params?: ConfigsParams) => {
    const res = await request<ApiData<Configs>>('/configs', { params });
    return res.data;
  },
};
