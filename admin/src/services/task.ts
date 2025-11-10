import { request } from '@umijs/max';

export const TaskApi = {
  get: async (id: number) => {
    const res = await request<ApiData<Task>>(`/task/${id}`);
    return res.data;
  },

  list: async (params: TaskSearchParams) => {
    const res = await request<ListApiData<Task>>('/task', { params });
    return res.data;
  },
};

