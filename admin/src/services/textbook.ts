import { request } from '@@/plugin-request';

export const TextbookApi = {
  search: async () => {
    const res = await request<ListApiData<Textbook>>('/textbook/search');
    return res.data;
  },

  create: async (data: TextbookFormModel) => {
    const res = await request<ApiData<Textbook>>('/textbook', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: number, data: TextbookFormModel) => {
    const res = await request<ApiData<Textbook>>(`/textbook/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: number) => {
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

  uploadPdf: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await request<ApiData<{ pdf: string }>>(`/textbook/${id}/pdf`, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
