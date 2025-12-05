import { request } from '@umijs/max';

export const CourseUnitApi = {
  create: async (data: UnitForm) => {
    const res = await request<ApiData<Unit>>('/unit', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: number, data: UnitUpdateForm) => {
    const res = await request<ApiData<Unit>>(`/unit/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: number) => {
    await request<ApiData<void>>(`/unit/${id}`, { method: 'DELETE' });
  },

  search: async (params: UnitSearchParams) => {
    const res = await request<ListApiData<Unit>>('/unit/search', { params });
    return res.data;
  },

  getKnowledges: async (id: number) => {
    const res = await request<ApiData<Knowledge[]>>(`/unit/${id}/knowledges`);
    return res.data;
  },

  getQuestions: async (id: number, params?: { page?: number; size?: number }) => {
    const res = await request<ListApiData<Question>>(`/unit/${id}/questions`, { params });
    return res.data;
  },

  generateQuestions: async (id: number, count: number = 30) => {
    const res = await request<ApiData<void>>(`/unit/${id}/generate`, {
      method: 'POST',
      params: { count },
    });
    return res.data;
  },
};
