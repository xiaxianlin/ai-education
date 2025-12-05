import { request } from '@umijs/max';

export const TeacherBookApi = {
  get: async (id: number) => {
    const res = await request<ApiData<TeacherBook>>(`/teacher_book/${id}`, {});
    return res.data;
  },

  search: async (params: TeacherBookSearchParams) => {
    const res = await request<ListApiData<TeacherBook>>('/teacher_book/search', { params });
    return res.data;
  },

  create: async (data: TeacherBookForm) => {
    const res = await request<ApiData<TeacherBook>>('/teacher_book', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: number, data: TeacherBookForm) => {
    const res = await request<ApiData<TeacherBook>>(`/teacher_book/${id}`, {
      method: 'PUT',
      data,
    });
    return res.data;
  },

  delete: async (id: number) => {
    await request<ApiData<void>>(`/teacher_book/${id}`, {
      method: 'DELETE',
    });
  },

  upload: async (id: number, data: FormData) => {
    const res = await request<ApiData<any>>(`/teacher_book/${id}/upload`, {
      method: 'POST',
      data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
