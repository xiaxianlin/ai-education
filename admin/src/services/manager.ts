import { request } from '@umijs/max';

export interface ResetPasswordResponse {
  password: string;
}

export const ManagerApi = {
  add: async (data: CreateManagerModel) => {
    const res = await request<ApiData<Manager>>('/manager', { method: 'POST', data });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/manager/${id}`, { method: 'DELETE' });
  },

  updateStatus: async (id: string, status: number) => {
    await request<ApiData<void>>(`/manager/${id}/status/${status}`, {
      method: 'PATCH',
    });
  },

  updateType: async (id: string, type: number) => {
    await request<ApiData<void>>(`/manager/${id}/type/${type}`, {
      method: 'PATCH',
    });
  },

  all: async () => {
    const res = await request<ApiData<Manager[]>>(`/manager/all`);
    return res.data;
  },

  resetPassword: async (id: string) => {
    const res = await request<ApiData<ResetPasswordResponse>>(`/manager/${id}/reset`, { method: 'POST' });
    return res.data;
  },
};
