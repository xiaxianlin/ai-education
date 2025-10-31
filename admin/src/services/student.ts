import { request } from '@umijs/max';

export const StudentApi = {
  search: async (params: StudentSearchParams) => {
    const res = await request<ListApiData<Student>>('/student/search', { params });
    return res.data;
  },

  create: async (data: StudentForm) => {
    const res = await request<ApiData<string>>('/student', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: string, data: StudentUpdateForm) => {
    const res = await request<ApiData<Student>>(`/student/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/student/${id}`, {
      method: 'DELETE',
    });
  },

  getTextbooks: async (id: string) => {
    const res = await request<ApiData<Textbook[]>>(`/student/${id}/subjects`);
    return res.data;
  },

  saveTextbooks: async (id: string, textbookIds: number[]) => {
    await request<ApiData<void>>(`/student/${id}/subjects`, {
      method: 'POST',
      data: { ids: textbookIds },
    });
  },
};

