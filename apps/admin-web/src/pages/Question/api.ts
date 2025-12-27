import { apiClient } from '@/lib/api';

export const QuestionApi = {
  // ======================== 题型 API ======================== //

  /**
   * 搜索题型
   * GET /question/type/search
   */
  async searchQuestionTypes(params?: {
    subject?: string;
    stages?: string[];
    grades?: number[];
    interactionType?: string;
    isActive?: boolean;
  }) {
    const res = await apiClient.get<{ items: QuestionType[]; total: number }>('/question/type/search', params);
    return res.items;
  },

  /**
   * 获取所有题型
   * GET /question/type/all
   */
  async listAllQuestionTypes() {
    const res = await apiClient.get<{ items: QuestionType[]; total: number }>('/question/type/all');
    return res.items;
  },

  /**
   * 获取题型详情
   * GET /question/type/{id}
   */
  async getQuestionType(id: number) {
    return apiClient.get<QuestionType>(`/question/type/${id}`);
  },

  /**
   * 创建题型
   * POST /question/type
   */
  async createQuestionType(data: QuestionTypeCreateRequest) {
    return apiClient.post<QuestionType>('/question/type', data);
  },

  /**
   * 更新题型
   * PATCH /question/type/{id}
   */
  async updateQuestionType(id: number, data: QuestionTypeUpdateRequest) {
    return apiClient.patch<QuestionType>(`/question/type/${id}`, data);
  },

  /**
   * 删除题型
   * DELETE /question/type/{id}
   */
  async deleteQuestionType(id: number) {
    return apiClient.delete(`/question/type/${id}`);
  },

  // ======================== 题目模板 API ======================== //

  /**
   * 获取题目模板列表
   * GET /question/template
   */
  async listQuestionTemplates(params?: { questionTypeId?: number; isActive?: boolean }) {
    return apiClient.get<QuestionTemplate[]>('/question/template', params);
  },

  /**
   * 获取题目模板详情
   * GET /question/template/{id}
   */
  async getQuestionTemplate(id: number) {
    return apiClient.get<QuestionTemplate>(`/question/template/${id}`);
  },

  /**
   * 创建题目模板
   * POST /question/template
   */
  async createQuestionTemplate(data: QuestionTemplateCreateRequest) {
    return apiClient.post<QuestionTemplate>('/question/template', data);
  },

  /**
   * 更新题目模板
   * PATCH /question/template/{id}
   */
  async updateQuestionTemplate(id: number, data: QuestionTemplateUpdateRequest) {
    return apiClient.patch<QuestionTemplate>(`/question/template/${id}`, data);
  },

  /**
   * 删除题目模板
   * DELETE /question/template/{id}
   */
  async deleteQuestionTemplate(id: number) {
    return apiClient.delete(`/question/template/${id}`);
  },

  /**
   * 验证题目模板
   * POST /question/template/{id}/validate
   */
  async validateQuestionTemplate(id: number) {
    return apiClient.post<{ valid: boolean; issues: string[] }>(`/question/template/${id}/validate`);
  },

  // ======================== 题目 API ======================== //

  /**
   * 搜索题目
   * GET /question/search
   */
  async searchQuestions(params?: SearchQuestionRequest) {
    return apiClient.get<{
      items: Question[];
      total: number;
      page: number;
      pageSize: number;
    }>('/question/search', params);
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
   * 生成题目图片
   * POST /question/{id}/generate_image
   */
  async generateQuestionImage(id: string) {
    return apiClient.post(`/question/${id}/image_generate`);
  },

  /**
   * 生成题目音频
   * POST /question/{id}/generate_audio
   */
  async generateQuestionAudio(id: string) {
    return apiClient.post(`/question/${id}/audio_generate`);
  },
};
