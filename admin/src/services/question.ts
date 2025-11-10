import { request } from '@umijs/max';

export const QuestionApi = {
  get: async (id: string) => {
    const res = await request<ApiData<Question>>(`/question/${id}`);
    return res.data;
  },

  search: async (params: QuestionSearchParams) => {
    const res = await request<ListApiData<Question>>('/question/search', { params });
    return res.data;
  },

  searchResource: async (params: QuestionSearchParams) => {
    const res = await request<ListApiData<Question>>('/question/resource/search', { params });
    return res.data;
  },

  update: async (id: string, data: QuestionUpdateForm) => {
    const res = await request<ApiData<Question>>(`/question/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/question/${id}`, {
      method: 'DELETE',
    });
  },

  generateImage: async (id: string) => {
    const res = await request<ApiData<Question>>(`/question/${id}/generate_image`, {
      method: 'POST',
    });
    return res.data;
  },

  generateAudio: async (id: string) => {
    const res = await request<ApiData<Question>>(`/question/${id}/generate_audio`, {
      method: 'POST',
    });
    return res.data;
  },
};
