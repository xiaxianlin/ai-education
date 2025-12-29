import { apiClient } from '@/lib/api';

export const QuestionApi = {
  // ======================== 题型 API ======================== //

  /**
   * 搜索题型
   * GET /question/type/search
   */
  async searchQuestionTypes(params?: {
    subject?: string;
    grade?: number;
    interaction_type?: string;
    page?: number;
    size?: number;
  }) {
    const res = await apiClient.get<{ data: QuestionType[]; total: number }>('/question/type/search', params);
    return res;
  },

  /**
   * 获取所有题型（通过搜索接口获取所有数据）
   * GET /question/type/search
   */
  async listAllQuestionTypes() {
    const res = await apiClient.get<{ data: QuestionType[]; total: number }>('/question/type/search', {
      size: 1000, // 获取足够多的数据
    });
    return res.data || [];
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
