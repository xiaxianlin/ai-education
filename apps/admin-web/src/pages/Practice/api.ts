import { apiClient } from '@/lib/api';

export const PracticeApi = {
  /**
   * 获取练习列表
   * GET /api/admin/practice/list
   */
  async listPractices(params?: SearchPracticeRequest) {
    return apiClient.get<SearchResponse<Practice>>('/practice/list', params);
  },

  /**
   * 获取练习详情
   * GET /api/admin/practice/{id}
   */
  async getPractice(id: number): Promise<Practice> {
    return apiClient.get<Practice>(`/practice/${id}`);
  },

  /**
   * 创建练习
   * POST /api/admin/practice
   */
  async createPractice(data: Practice) {
    return apiClient.post<number>('/practice', data);
  },

  /**
   * 更新练习
   * PUT /api/admin/practice/{id}
   */
  async updatePractice(id: number, data: Practice) {
    return apiClient.put(`/practice/${id}`, data);
  },

  /**
   * 删除练习
   * DELETE /api/admin/practice/{id}
   */
  async deletePractice(id: number) {
    return apiClient.delete(`/practice/${id}`);
  },

  // ========== 练习参数配置 ==========

  /**
   * 获取练习参数配置
   * GET /api/admin/practice/parameters/{id}
   */
  async getPracticeParameters(id: number): Promise<Record<string, any>> {
    return apiClient.get<Record<string, any>>(`/practice/parameters/${id}`);
  },

  /**
   * 保存练习参数配置
   * POST /api/admin/practice/parameters/{id}/
   */
  async savePracticeParameters(id: number, parameterConfig: Record<string, any>) {
    return apiClient.post(`/practice/parameters/${id}/`, parameterConfig);
  },

  // ========== 练习会话 ==========

  /**
   * 获取练习会话详情
   * GET /api/admin/practice/session/{session_id}
   */
  async getPracticeSession(sessionId: number) {
    return apiClient.get<{ session: PracticeSession; answers: PracticeSessionAnswer[] }>(`/practice/session/${sessionId}`);
  },

  /**
   * 删除练习会话
   * DELETE /api/admin/practice/session/{session_id}
   */
  async removePracticeSession(sessionId: number) {
    return apiClient.delete(`/practice/session/${sessionId}`);
  },
};
