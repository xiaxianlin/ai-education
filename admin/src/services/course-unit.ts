import { request } from '@umijs/max';

export const CourseUnitApi = {
  list: async () => {
    const res = await request<ApiData<CourseUnit[]>>('/course_unit/all');
    return res.data;
  },

  create: async (data: CreateCourseUnit) => {
    const res = await request<ApiData<CourseUnit>>('/course_unit', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: string, data: UpdateCourseUnit) => {
    const res = await request<ApiData<CourseUnit>>(`/course_unit/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/course_unit/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStatus: async (id: string, status: number) => {
    const res = await request<ApiData<CourseUnit>>(`/course_unit/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
    return res.data;
  },

  getTextbooks: async () => {
    const res = await request<ApiData<Textbook[]>>('/textbook/all');
    return res.data;
  },
};
