import { apiClient } from '@/lib/api';

export const QuestionApi = {
  // ======================== 题型 API ======================== //

  /**
   * 搜索题型
   * GET /question/type/search
   */
  async searchQuestionTypes(params?: QuestionTypeSearchRequest) {
    const res = await apiClient.get<{ data: QuestionType[]; total: number }>('/question/type/search', params);
    return res;
  },

  /**
   * 导出题型数据（全量数据）
   * POST /question/type/export
   */
  async exportQuestionTypes(): Promise<Blob> {
    const url = `/api/admin/question/type/export`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-access-token': apiClient.getToken() || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`导出失败: ${response.statusText} - ${errorText}`);
    }

    return await response.blob();
  },

  /**
   * 导入题型数据（全量数据）
   * POST /question/type/import
   */
  async importQuestionTypes(file: File): Promise<{ deleted_count: number; created_count: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/api/admin/question/type/import`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-access-token': apiClient.getToken() || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `导入失败: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * 获取题型详情
   * GET /question/type/{id}
   */
  async getQuestionType(id: number) {
    return apiClient.get<QuestionType>(`/question/type/${id}`);
  },

  /**
   * 根据编码获取题型
   * GET /question/type/code/{code}
   */
  async getQuestionTypeByCode(code: string) {
    return apiClient.get<QuestionType>(`/question/type/code/${code}`);
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
