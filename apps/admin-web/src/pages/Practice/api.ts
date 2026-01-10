import { apiClient } from '@/lib/api';

export const PracticeApi = {
  /**
   * 搜索练习列表
   * GET /practice/search
   */
  async searchPractices(params?: SearchPracticeRequest) {
    return apiClient.get<{ data: Practice[]; total: number }>('/practice/search', params);
  },

  /**
   * 获取练习详情
   * GET /practice/{id}
   */
  async getPracticeDetail(id: string) {
    return apiClient.get<PracticeData>(`/practice/${id}`);
  },
};
