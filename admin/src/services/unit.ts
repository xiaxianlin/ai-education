import { request } from '@umijs/max';

export const CourseUnitApi = {
  create: async (data: CoureSimpleForm) => {
    await request<ApiData<Unit>>('/course_unit', {
      method: 'POST',
      data,
    });
  },

  update: async (id: number, data: CoureSimpleForm) => {
    await request<ApiData<Unit>>(`/course_unit/${id}`, {
      method: 'PUT',
      data,
    });
  },

  delete: async (id: number) => {
    await request<ApiData<void>>(`/course_unit/${id}`, { method: 'DELETE' });
  },

  toggleStatus: async (id: number, status: number) => {
    await request<ApiData<Unit>>(`/course_unit/${id}/status/${status}`, {
      method: 'PATCH',
    });
  },
};
