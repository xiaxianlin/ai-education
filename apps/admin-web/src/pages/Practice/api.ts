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

  /**
   * 删除练习
   * DELETE /practice/{id}
   */
  async deletePractice(id: string) {
    return apiClient.delete(`/practice/${id}`);
  },

  /**
   * 重置练习
   * POST /practice/{id}/reset
   */
  async resetPractice(id: string) {
    return apiClient.post(`/practice/${id}/reset`);
  },

  /**
   * 重置题目答案
   * POST /practice/{id}/answer/{questionId}/reset
   */
  async resetPracticeAnswer(id: string, questionId: string) {
    return apiClient.post(`/practice/${id}/answer/${questionId}/reset`);
  },
};
