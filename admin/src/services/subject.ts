import { request } from '@@/plugin-request';

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
    return res.data;
  },

  update: async (id: string, data: CreateSubject) => {
    const res = await request<ApiData<Subject>>(`/subject/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/subject/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStatus: async (id: string, status: number) => {
    const res = await request<ApiData<Subject>>(`/subject/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
    return res.data;
  },
};
