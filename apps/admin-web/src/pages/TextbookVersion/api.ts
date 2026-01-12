import { apiClient } from '@/lib/api';

export const TextbookVersionApi = {
  /**
   * 获取教材版本
   * GET /textbook_version/{id}
   */
  async getTextbookVersion(id: number) {
    return apiClient.get<TextbookVersion>(`/textbook_version/${id}`);
  },

  /**
   * 搜索教材版本
   * GET /textbook_version/search
   */
  async searchTextbookVersions(params?: SearchTextbookVersionRequest) {
    return apiClient.get<TextbookVersion[]>('/textbook_version/search', params);
  },

  /**
   * 创建教材版本
   * POST /textbook_version
   */
  async createTextbookVersion(data: SaveTextbookVersionRequest) {
    return apiClient.post<number>('/textbook_version', data);
  },

  /**
   * 更新教材版本
   * PATCH /textbook_version/{id}
   */
  async updateTextbookVersion(id: number, data: SaveTextbookVersionRequest) {
    return apiClient.patch(`/textbook_version/${id}`, data);
  },

  /**
   * 删除教材版本
   * DELETE /textbook_version/{id}
   */
  async deleteTextbookVersion(id: number) {
    return apiClient.delete(`/textbook_version/${id}`);
  },

  /**
   * 停用教材版本
   * PATCH /textbook_version/{id}/disable
   */
  async disableTextbookVersion(id: number) {
    return apiClient.patch(`/textbook_version/${id}/disable`);
  },

  /**
   * 启用教材版本
   * PATCH /textbook_version/{id}/enable
   */
  async enableTextbookVersion(id: number) {
    return apiClient.patch(`/textbook_version/${id}/enable`);
  },
};
