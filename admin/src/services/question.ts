import { request } from '@umijs/max';

export const QuestionApi = {
  search: async (params: QuestionSearchParams) => {
    const res = await request<ListApiData<Question>>('/question/search', { params });
    return res.data;
  },
};
