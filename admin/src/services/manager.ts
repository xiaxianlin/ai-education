import { request } from '@umijs/max';

export const ManagerApi = {
  add: async (data: CreateManagerModel) => {
    const res = await request<ApiData<string>>('/manager', { method: 'POST', data });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<string>>(`/manager/${id}`, { method: 'DELETE' });
  },

  updateStatus: async (id: string, status: number) => {
    await request<ApiData<string>>(`/manager/${id}/status/${status}`, {
      method: 'PATCH',
    });
  },

  all: async () => {
    const res = await request<ApiData<Manager[]>>(`/manager/all`);
    return res.data;
  },

  resetPassword: async (id: string) => {
    const res = await request<ApiData<string>>(`/manager/${id}/reset`, { method: 'POST' });
    return res.data;
  },
};
