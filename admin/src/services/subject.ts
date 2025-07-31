import { request } from '@umijs/max';

export const SubjectApi = {
  list: async () => {
    const res = await request<ApiData<Subject[]>>('/subject/all');
    return res.data;
  },

  create: async (data: CreateSubject) => {
    const res = await request<ApiData<Subject>>('/subject', {
      method: 'POST',
      data,
    });
    return res.status === 0;
  },

  update: async (id: string, data: CreateSubject) => {
    const res = await request<ApiData<Subject>>(`/subject/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.status === 0;
  },

  delete: async (id: string) => {
    const res = await request<ApiData<void>>(`/subject/${id}`, {
      method: 'DELETE',
    });
    return res.status === 0;
  },

  toggleStatus: async (id: string, status: number) => {
    const res = await request<ApiData<Subject>>(`/subject/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
    return res.status === 0;
  },
};
