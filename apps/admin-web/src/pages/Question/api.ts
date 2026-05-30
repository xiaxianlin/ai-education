import { apiClient } from '@/lib/api';

export const QuestionApi = {
  // ======================== 题型 API ======================== //

  /**
   * 搜索单元练习题型
   * GET /question/type/units
   * 后端返回列表，无分页
   */
  async searchUnitPracticeTypes() {
    const res = await apiClient.get<QuestionType[]>('/question/type/units');
    return res;
  },

  /**
   * 搜索能力练习题型
   * GET /question/type/abilities
   * 后端返回列表，无分页
   * subject 和 grade 是必需参数
   */
  async searchAbilityPracticeTypes(params: { subject: string; grade: number }) {
    const res = await apiClient.get<QuestionType[]>('/question/type/abilities', params);
    return res;
  },

  /**
   * 题型保存
   * POST /question/type
   */
  async saveQuestionType(data: QuestionTypeSaveRequest) {
    return apiClient.post<QuestionType>('/question/type', data);
  },

  /**
   * 删除题型
   * DELETE /question/type/{id}
   */
  async deleteQuestionType(id: number) {
    return apiClient.delete(`/question/type/${id}`);
  },

  // ======================== 题目 API ======================== //

  /**
   * 搜索题目
   * GET /question/search
   */
  async searchQuestions(params?: SearchQuestionRequest) {
    const res = await apiClient.get<{ data: Question[]; total: number }>('/question/search', params);
    return res;
  },

  /**
   * 获取题目详情
   * GET /question/{id}
   */
  async getQuestion(id: string) {
    return apiClient.get<Question>(`/question/${id}`);
  },

  /**
   * 删除题目
   * DELETE /question/{id}
   */
  async deleteQuestion(id: string) {
    return apiClient.delete(`/question/${id}`);
  },

  /**
   * 更新题目
   * PATCH /question/{id}
   */
  async updateQuestion(id: string, data: QuestionUpdateRequest) {
    return apiClient.patch<Question>(`/question/${id}`, data);
  },

  /**
   * 根据 code 获取题型详情
   * GET /question/type/{code}
   */
  async getQuestionTypeByCode(code: string) {
    return apiClient.get<QuestionType>(`/question/type/${code}`);
  },

  /**
   * 获取题型 prompt
   * GET /question/type/{code}/prompt
   */
  async getQuestionTypePrompt(code: string) {
    const res = await apiClient.get<{ prompt: string }>(`/question/type/${code}/prompt`);
    return res.prompt;
  },

  /**
   * 更新题型 prompt
   * PATCH /question/type/{code}/prompt
   */
  async updateQuestionTypePrompt(code: string, prompt: string) {
    return apiClient.patch(`/question/type/${code}/prompt`, { prompt });
  },

  /**
   * 更新题型 configs
   * PATCH /question/type/{code}/configs
   */
  async updateQuestionTypeConfigs(code: string, configs: Record<string, any>) {
    return apiClient.patch<QuestionType>(`/question/type/${code}/configs`, { configs });
  },

  /**
   * 生成题目
   * POST /question/generate/{code}
   */
  async generateQuestion(code: string, params: Record<string, any>) {
    return apiClient.post<Record<string, any>>(`/question/generate/${code}`, { params });
  },

  /**
   * 生成题目素材
   * POST /question/{id}/resources/generate
   */
  async generateQuestionResources(id: string) {
    return apiClient.post(`/question/${id}/resources/generate`);
  },
};
