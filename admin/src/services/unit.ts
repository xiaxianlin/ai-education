import { request } from '@umijs/max';

export const CourseUnitApi = {
  create: async (data: TextbookContentForm) => {
    await request<ApiData<Unit>>('/unit', {
      method: 'POST',
      data,
    });
  },

  update: async (id: number, data: TextbookContentForm) => {
    await request<ApiData<Unit>>(`/unit/${id}`, {
      method: 'PATCH',
      data,
    });
  },

  delete: async (id: number) => {
    await request<ApiData<void>>(`/unit/${id}`, { method: 'DELETE' });
  },
};
