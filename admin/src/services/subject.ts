import { request } from '@umijs/max';

export const SubjectApi = {
  list: async () => {
    const res = await request<ApiData<Subject[]>>('/subject/all');
    return res.data;
  },

  actives: async () => {
    const res = await request<ApiData<Subject[]>>('/subject/actives');
    return res.data;
  },

  create: async (data: { name: string }) => {
    const res = await request<ApiData<Subject>>('/subject', {
      method: 'POST',
      data,
    });
    return res.status === 0;
  },

  update: async (id: number, data: { name: string }) => {
    const res = await request<ApiData<Subject>>(`/subject/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.status === 0;
  },

  delete: async (id: number) => {
    const res = await request<ApiData<void>>(`/subject/${id}`, {
      method: 'DELETE',
    });
    return res.status === 0;
  },

  toggleStatus: async (id: number, status: number) => {
    const res = await request<ApiData<Subject>>(`/subject/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
    return res.status === 0;
  },
};
