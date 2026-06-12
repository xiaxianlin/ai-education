import { apiClient } from '@/lib/api';

export const TextbookApi = {
  /**
   * 获取教材
   * GET /textbook/{id}
   */
  async getTextbook(id: number) {
    return apiClient.get<Textbook>(`/textbook/${id}`);
  },

  /**
   * 搜索教材
   * GET /textbook/search
   */
  async searchTextbooks(params?: SearchTextbookRequest) {
    return apiClient.get<SearchResponse<Textbook>>('/textbook/search', params);
  },

  /**
   * 创建教材
   * POST /textbook
   */
  async createTextbook(data: SaveTextbookRequest) {
    return apiClient.post<number>('/textbook', data);
  },

  /**
   * 更新教材
   * PUT /textbook/{id}
   */
  async updateTextbook(id: number, data: SaveTextbookRequest) {
    return apiClient.patch(`/textbook/${id}`, data);
  },

  /**
   * 删除教材
   * DELETE /textbook/{id}
   */
  async deleteTextbook(id: number) {
    return apiClient.delete(`/textbook/${id}`);
  },

  /**
   * 获取教材的单元列表
   * GET /textbook/{id}/units
   */
  async getTextbookUnits(id: number) {
    return apiClient.get<Unit[]>(`/textbook/${id}/units`);
  },

  /**
   * 创建单元
   * POST /textbook/unit
   */
  async createUnit(data: CreateUnitRequest) {
    return apiClient.post<number>('/textbook/unit', data);
  },

  /**
   * 更新单元
   * PATCH /textbook/unit/{id}
   */
  async updateUnit(id: number, data: UpdateUnitRequest) {
    return apiClient.patch(`/textbook/unit/${id}`, data);
  },

  /**
   * 删除单元
   * DELETE /textbook/unit/{id}
   */
  async deleteUnit(id: number) {
    return apiClient.delete(`/textbook/unit/${id}`);
  },
};
