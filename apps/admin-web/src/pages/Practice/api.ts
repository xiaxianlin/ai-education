import { apiClient } from '@/lib/api';

export const PracticeApi = {
  /**
   * 获取练习提示词关联列表
   * GET /api/admin/practice/prompt/list
   */
  async listPracticePrompts(params?: SearchPracticePromptRequest) {
    return apiClient.get<SearchResponse<PracticePrompt>>('/practice/prompt/list', params);
  },

  /**
   * 获取练习提示词关联详情
   * GET /api/admin/practice/prompt/{id}
   */
  async getPracticePromptDetail(id: number): Promise<PracticePrompt> {
    return apiClient.get<PracticePrompt>(`/practice/prompt/${id}`);
  },

  /**
   * 创建练习提示词关联
   * POST /api/admin/practice/prompt
   */
  async createPracticePrompt(data: SavePracticePromptRequest) {
    return apiClient.post<number>('/practice/prompt', data);
  },

  /**
   * 更新练习提示词关联
   * PUT /api/admin/practice/prompt/{id}
   */
  async updatePracticePrompt(id: number, data: SavePracticePromptRequest) {
    return apiClient.put(`/practice/prompt/${id}`, data);
  },

  /**
   * 删除练习提示词关联
   * DELETE /api/admin/practice/prompt/{id}
   */
  async deletePracticePrompt(id: number) {
    return apiClient.delete(`/practice/prompt/${id}`);
  },
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
   * 获取练习参数列表
   * GET /api/admin/practice/parameters/{id}
   */
  async getPracticeParameters(id: number): Promise<PracticeParameter[]> {
    return apiClient.get<PracticeParameter[]>(`/practice/parameters/${id}`);
  },

  /**
   * 保存练习参数
   * POST /api/admin/practice/parameters/{id}/
   */
  async savePracticeParameters(id: number, parameters: PracticeParameter[]) {
    return apiClient.post(`/practice/parameters/${id}/`, parameters);
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
