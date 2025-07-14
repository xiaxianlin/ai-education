import { request } from '@@/plugin-request';

export const TextbookVersionApi = {
  list: async () => {
    const res = await request<ApiData<TextbookVersion[]>>('/textbook_version/all');
    return res.data;
  },

  create: async (data: CreateTextbookVersion) => {
    const res = await request<ApiData<TextbookVersion>>('/textbook_version', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: string, data: CreateTextbookVersion) => {
    const res = await request<ApiData<TextbookVersion>>(`/textbook_version/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/textbook_version/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStatus: async (id: string, status: number) => {
    const res = await request<ApiData<TextbookVersion>>(`/textbook_version/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
    return res.data;
  },
};
