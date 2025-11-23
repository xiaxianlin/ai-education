import { request } from '@umijs/max';

export const StudentApi = {
  search: async (params: StudentSearchParams) => {
    const res = await request<ListApiData<Student>>('/student/search', { params });
    return res.data;
  },

  getDetail: async (id: string) => {
    const res = await request<ApiData<Student>>(`/student/${id}`);
    return res.data;
  },

  create: async (data: StudentForm) => {
    const res = await request<ApiData<Student>>('/student', {
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
    const res = await request<ApiData<Textbook[]>>(`/student/${id}/textbooks`);
    return res.data;
  },

  saveTextbooks: async (id: string, textbookIds: number[]) => {
    await request<ApiData<void>>(`/student/${id}/textbooks`, {
      method: 'POST',
      data: { ids: textbookIds },
    });
  },

  resetPassword: async (id: string) => {
    const res = await request<ApiData<ResetPasswordResponse>>(`/student/${id}/reset_password`, {
      method: 'POST',
    });
    return res.data;
  },
};

