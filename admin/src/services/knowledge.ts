import { request } from '@umijs/max';

export const KnowledgeApi = {
  create: async (data: CoureSimpleForm) => {
    const res = await request<ApiData<Knowledge>>('/knowledge', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: number, data: CoureSimpleForm) => {
    const res = await request<ApiData<Knowledge>>(`/knowledge/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: number) => {
    await request<ApiData<void>>(`/knowledge/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStatus: async (id: number, status: number) => {
    const res = await request<ApiData<Knowledge>>(`/knowledge/${id}`, {
      method: 'PATCH',
      data: { status },
    });
    return res.data;
  },
};
