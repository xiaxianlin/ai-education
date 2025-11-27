import { request } from '@umijs/max';

export const TextbookApi = {
  get: async (id: number) => {
    const res = await request<ApiData<Textbook>>(`/textbook/${id}`, {});
    return res.data;
  },

  search: async (params: TextbookSearchParams) => {
    const res = await request<ListApiData<Textbook>>('/textbook/search', { params });
    return res.data;
  },

  create: async (data: TextbookForm) => {
    const res = await request<ApiData<Textbook>>('/textbook', { method: 'POST', data });
    return res.data;
  },

  update: async (id: number, data: TextbookForm) => {
    const res = await request<ApiData<Textbook>>(`/textbook/${id}`, {
      method: 'PUT',
      data,
    });
    return res.data;
  },

  delete: async (id: number) => {
    await request<ApiData<void>>(`/textbook/${id}`, {
      method: 'DELETE',
    });
  },

  parse: async (id: number) => {
    const res = await request<ApiData<Textbook>>(`/textbook/${id}/parse`, {
      method: 'POST',
    });
    return res.data;
  },

  toggleStatus: async (id: number, status: number) => {
    const res = await request<ApiData<Textbook>>(`/textbook/${id}/status/${status}`, {
      method: 'PATCH',
    });
    return res.data;
  },

  getUnits: async (id: number) => {
    const res = await request<ApiData<Unit[]>>(`/textbook/${id}/units`);
    return res.data || [];
  },

  getKnowledges: async (id: number) => {
    const res = await request<ApiData<Knowledge[]>>(`/textbook/${id}/knowledges`);
    return res.data;
  },

  getQuestions: async (id: number, params?: { page?: number; size?: number }) => {
    const res = await request<ListApiData<Question>>(`/textbook/${id}/questions`, { params });
    return res.data;
  },

  generateQuestions: async (id: number) => {
    const res = await request<ApiData<void>>(`/textbook/${id}/generate`, {
      method: 'POST',
    });
    return res.data;
  },

  upload: async (id: number, data: FormData) => {
    const res = await request<ApiData<any>>(`/textbook/${id}/upload`, {
      method: 'POST',
      data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
