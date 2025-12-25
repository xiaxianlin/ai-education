import { apiClient } from '@/lib/api';

export const PromptApi = {
  /**
   * 获取 Prompt 列表
   * GET /api/admin/prompt/list
   */
  async listPrompts(params?: SearchPromptRequest) {
    return apiClient.get<SearchResponse<Prompt>>('/prompt/list', params);
  },

  /**
   * 创建 Prompt
   * POST /api/admin/prompt/
   */
  async createPrompt(data: SavePromptRequest) {
    return apiClient.post<number>('/prompt/', data);
  },

  /**
   * 更新 Prompt
   * PUT /api/admin/prompt/{id}
   */
  async updatePrompt(id: number, data: SavePromptRequest) {
    return apiClient.put(`/prompt/${id}`, data);
  },

  /**
   * 获取 Prompt 详情
   * GET /api/admin/prompt/{id}
   */
  async getPromptDetail(id: number): Promise<PromptDetail> {
    return apiClient.get<PromptDetail>(`/prompt/${id}`);
  },

  /**
   * 删除 Prompt
   * DELETE /api/admin/prompt/{id}
   */
  async deletePrompt(id: number) {
    return apiClient.delete(`/prompt/${id}`);
  },

  /**
   * 测试 Prompt
   * POST /api/admin/prompt/{id}/test
   */
  async testPrompt(id: number, data: TestPromptRequest) {
    return apiClient.post<any>(`/prompt/${id}/test`, {
      input_payload: data.variables || {},
      model_provider: data.model_provider,
      model_name: data.model_name,
      model_params: data.model_params || {},
      generation_type: data.generation_type || 'text',
    });
  },
};
