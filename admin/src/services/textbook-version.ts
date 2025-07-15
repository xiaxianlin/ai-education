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
    return res.status === 0;
  },

  update: async (id: string, data: CreateTextbookVersion) => {
    const res = await request<ApiData<TextbookVersion>>(`/textbook_version/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.status === 0;
  },

  delete: async (id: string) => {
    const res = await request<ApiData<void>>(`/textbook_version/${id}`, {
      method: 'DELETE',
    });
    return res.status === 0;
  },

  toggleStatus: async (id: string, status: number) => {
    const res = await request<ApiData<TextbookVersion>>(`/textbook_version/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
    return res.status === 0;
  },
};
