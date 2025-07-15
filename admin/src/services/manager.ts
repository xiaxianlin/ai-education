import { ManagerStatus } from '@/constants/manager';
import { request } from '@@/plugin-request';

export const ManagerApi = {
  create: async (data: CreateManagerModel) => {
    const res = await request<ApiData<string>>('/manager', { method: 'POST', data });
    return res.status === 0;
  },

  update: async (id: string, data: CreateManagerModel) => {
    const res = await request<ApiData<string>>(`/manager/${id}`, { method: 'PATCH', data });
    return res.status === 0;
  },

  delete: async (id: string) => {
    const res = await request<ApiData<string>>(`/manager/${id}`, { method: 'DELETE' });
    return res.status === 0;
  },

  updateStatus: async (id: string, status: ManagerStatus) => {
    const res = await request<ApiData<string>>(`/manager/${id}/status`, { method: 'PUT', data: { status } });
    return res.status === 0;
  },

  search: async (params: ManagerSearchParams) => {
    const res = await request<ApiData<ListData<Manager>>>(`/manager/search`, { params });
    return res.data;
  },
};
