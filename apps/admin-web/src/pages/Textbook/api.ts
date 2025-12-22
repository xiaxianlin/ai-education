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
    return apiClient.get<Textbook[]>('/textbook/search', params);
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
   * 解析教材
   * POST /textbook/{id}/parse
   */
  async parseTextbook(id: number) {
    return apiClient.post(`/textbook/${id}/parse`);
  },

  /**
   * 上传教材文件
   * POST /textbook/{id}/upload
   */
  async uploadTextbook(id: number, data: FormData) {
    return apiClient.form(`/textbook/${id}/upload`, data);
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
   * POST /unit
   */
  async createUnit(data: CreateUnitRequest) {
    return apiClient.post<number>('/unit', data);
  },

  /**
   * 更新单元
   * PATCH /unit/{id}
   */
  async updateUnit(id: number, data: UpdateUnitRequest) {
    return apiClient.patch(`/unit/${id}`, data);
  },

  /**
   * 删除单元
   * DELETE /unit/{id}
   */
  async deleteUnit(id: number) {
    return apiClient.delete(`/unit/${id}`);
  },

  /**
   * 获取单元的知识点列表
   * GET /unit/{id}/knowledges
   */
  async getUnitKnowledges(id: number) {
    return apiClient.get<Knowledge[]>(`/unit/${id}/knowledges`);
  },

  // ========== 知识点管理 ==========

  /**
   * 创建知识点
   * POST /knowledge
   */
  async createKnowledge(data: CreateKnowledgeRequest) {
    return apiClient.post<number>('/knowledge', data);
  },

  /**
   * 更新知识点
   * PATCH /knowledge/{id}
   */
  async updateKnowledge(id: number, data: UpdateKnowledgeRequest) {
    return apiClient.patch(`/knowledge/${id}`, data);
  },

  /**
   * 删除知识点
   * DELETE /knowledge/{id}
   */
  async deleteKnowledge(id: number) {
    return apiClient.delete(`/knowledge/${id}`);
  },
};
