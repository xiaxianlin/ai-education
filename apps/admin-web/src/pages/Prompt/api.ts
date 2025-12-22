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
   * PUT /api/admin/prompt/{version_id}
   */
  async updatePrompt(versionId: number, data: SavePromptRequest) {
    return apiClient.put(`/prompt/${versionId}`, data);
  },

  /**
   * 发布 Prompt 版本
   * POST /api/admin/prompt/{version_id}/publish
   */
  async publishPromptVersion(versionId: number, changelog: string) {
    return apiClient.post(`/prompt/${versionId}/publish`, { changelog });
  },

  /**
   * 获取 Prompt 版本列表
   * GET /api/admin/prompt/versions
   */
  async listPromptVersions(params?: SearchPromptVersionRequest) {
    return apiClient.get<SearchResponse<PromptVersion>>('/prompt/versions', params);
  },

  /**
   * 获取 Prompt 详情
   * GET /api/admin/prompt/{version_id}
   */
  async getPromptDetail(versionId: number): Promise<PromptDetail> {
    return apiClient.get<PromptDetail>(`/prompt/${versionId}`);
  },

  /**
   * 删除 Prompt
   * DELETE /api/admin/prompt/{id}
   */
  async deletePrompt(id: number) {
    return apiClient.delete(`/prompt/${id}`);
  },

  /**
   * 测试 Prompt 版本
   * POST /api/admin/prompt/{version_id}/test
   */
  async testPrompt(versionId: number, data: TestPromptRequest) {
    return apiClient.post<any>(`/prompt/${versionId}/test`, {
      input_payload: data.variables || {},
      model_provider: data.model_provider,
      model_name: data.model_name,
      model_params: data.model_params || {},
      generation_type: data.generation_type || 'text',
    });
  },
};
