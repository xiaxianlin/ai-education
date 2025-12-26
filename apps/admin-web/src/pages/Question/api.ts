import { apiClient } from '@/lib/api';

export const QuestionApi = {
  /**
   * 获取题目
   * GET /question/{id}
   */
  async getQuestion(id: string): Promise<Question> {
    return apiClient.get<Question>(`/question/${id}`);
  },

  /**
   * 搜索题目
   * GET /question/search
   */
  async searchQuestions(params?: SearchQuestionRequest) {
    return apiClient.get<SearchResponse<Question>>('/question/search', params);
  },

  /**
   * 创建题目
   * POST /question
   */
  async createQuestion(data: UpdateQuestionRequest) {
    return apiClient.post<Question>('/question', data);
  },

  /**
   * 更新题目
   * PATCH /question/{id}
   */
  async updateQuestion(id: string, data: UpdateQuestionRequest) {
    return apiClient.patch(`/question/${id}`, data);
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

  /**
   * 搜索题型
   * GET /question/type/search
   */
  async searchQuestionTypes(params?: SearchQuestionTypeRequest) {
    return apiClient.get<QuestionType[]>('/question/type/search', params);
  },

  /**
   * 创建题型
   * POST /question/type
   */
  async createQuestionType(data: CreateQuestionTypeRequest) {
    return apiClient.post<QuestionType>('/question/type', data);
  },

  /**
   * 更新题型
   * PATCH /question/type/{id}
   */
  async updateQuestionType(id: number, data: UpdateQuestionTypeRequest) {
    return apiClient.patch<QuestionType>(`/question/type/${id}`, data);
  },

  /**
   * 删除题型
   * DELETE /question/type/{id}
   */
  async deleteQuestionType(id: number) {
    return apiClient.delete(`/question/type/${id}`);
  },

  /**
   * 批量删除题型
   * DELETE /question/type/batch
   */
  async batchDeleteQuestionTypes(ids: number[]) {
    return apiClient.delete('/question/type/batch', { ids });
  },

  /**
   * 获取题型详情
   * GET /question/type/{id}
   */
  async getQuestionType(id: number) {
    return apiClient.get<QuestionType>(`/question/type/${id}`);
  },
};
