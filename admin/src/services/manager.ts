import { ManagerStatus } from '@/constants/manager';
import { request } from '@@/plugin-request';

export const ManagerApi = {
  craete: async (data: CreateManagerModel) => {
    const res = await request<ApiData<string>>('/manager', { method: 'POST', data });
    return res.data;
  },

  remove: async (id: string) => {
    await request<ApiData<string>>(`/manager/${id}`, { method: 'DELETE' });
  },

  modifyStatus: async (id: string, status: ManagerStatus) => {
    await request<ApiData<string>>(`/manager/status/${id}`, { method: 'PATCH', data: { status } });
  },

  search: async (params: ManagerSearchParams) => {
    const res = await request<ApiData<ListData<Manager>>>(`/manager/search`, { params });
    return res.data;
  },
};
