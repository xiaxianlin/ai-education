import { request } from '@@/plugin-request';

export const TextbookApi = {
  list: async () => {
    const res = await request<ApiData<Textbook[]>>('/textbook/all');
    return res.data;
  },

  create: async (data: CreateTextbook) => {
    const res = await request<ApiData<Textbook>>('/textbook', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: string, data: CreateTextbook) => {
    const res = await request<ApiData<Textbook>>(`/textbook/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/textbook/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStatus: async (id: string, status: number) => {
    const res = await request<ApiData<Textbook>>(`/textbook/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
    return res.data;
  },

  getSubjects: async () => {
    const res = await request<ApiData<Subject[]>>('/subject/all');
    return res.data;
  },

  getVersions: async () => {
    const res = await request<ApiData<TextbookVersion[]>>('/textbook_version/all');
    return res.data;
  },
};
