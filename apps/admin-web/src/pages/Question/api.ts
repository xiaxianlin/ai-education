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
   * 创建题目
   * POST /question
   */
  async createQuestion(data: QuestionCreateRequest) {
    return apiClient.post<Question>('/question/', data);
  },

  /**
   * 更新题目
   * PATCH /question/{id}
   */
  async updateQuestion(id: string, data: QuestionUpdateRequest) {
    return apiClient.patch<Question>(`/question/${id}`, data);
  },

  /**
   * 删除题目
   * DELETE /question/{id}
   */
  async deleteQuestion(id: string) {
    return apiClient.delete(`/question/${id}`);
  },

  /**
   * 批量删除题目
   * POST /question/batch_delete
   */
  async batchDeleteQuestions(ids: string[]) {
    return apiClient.post<{ message: string; deleted_count: number }>('/question/batch_delete', { ids });
  },

  /**
   * 生成题目资源
   * POST /question/{id}/generate_resources
   */
  async generateQuestionResources(id: string) {
    return apiClient.post<Question>(`/question/${id}/generate_resources`);
  },

  /**
   * 根据题型编码生成题目
   * POST /question/type/{code}/generate
   */
  async generateQuestions(code: string, count: number) {
    return apiClient.post<Question[]>(`/question/type/${code}/generate`, { count });
  },

  /**
   * 更新题型提示词
   * PATCH /question/type/{code}/prompt
   */
  async updateQuestionTypePrompt(code: string, prompt: string) {
    return apiClient.patch<QuestionType>(`/question/type/${code}/prompt`, { prompt });
  },

  /**
   * 批量更新题目（已废弃）
   * PATCH /question/batch_update
   * TODO: 此功能已废弃，后端返回 501 错误
   */
  async batchUpdateQuestions(_params: { ids: string[]; is_active: boolean }) {
    throw new Error('批量更新题目功能已废弃，原 is_active 字段已删除');
  },

  /**
   * 优化题型生成提示词
   * POST /prompt/optimize/question_type
   */
  async optimizePrompt(code: string, suggestion?: string) {
    return apiClient.post<{ optimized_prompt: string }>('/prompt/optimize/question_type', {
      code,
      suggestion,
    });
  },

  /**
   * 生成题型提示词
   * POST /prompt/generate/question_type
   */
  async generatePrompt(code: string, templateType: 'auto' | 'template' = 'auto') {
    return apiClient.post<{ generated_prompt: string }>('/prompt/generate/question_type', {
      code,
      template_type: templateType,
    });
  },
};
