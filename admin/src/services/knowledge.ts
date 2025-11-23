import { request } from '@umijs/max';

export const KnowledgeApi = {
  create: async (data: KnowledgeForm) => {
    const res = await request<ApiData<Knowledge>>('/knowledge', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: number, data: KnowledgeUpdateForm) => {
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

  search: async (params: KnowledgeSearchParams) => {
    const res = await request<ListApiData<Knowledge>>('/knowledge/search', { params });
    return res.data;
  },

  getQuestions: async (id: number, params?: { page?: number; size?: number }) => {
    const res = await request<ListApiData<Question>>(`/knowledge/${id}/questions`, { params });
    return res.data;
  },
};
