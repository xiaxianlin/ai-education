/**
 * 单元服务 API
 * 对应后端 server/student/routes/unit.py
 */
import { api } from "@/lib/api";

export const unitService = {
  /**
   * 获取单元列表
   * GET /unit/list
   */
  getUnitList: async (textbookId?: number) => {
    const params = textbookId ? `?textbook_id=${textbookId}` : "";
    return api.get<Unit[]>(`/unit/list${params}`);
  },

  /**
   * 获取单元详情
   * GET /unit/{unit_id}
   */
  getUnitDetail: async (unitId: number) => {
    return api.get<Unit>(`/unit/${unitId}`);
  },

  /**
   * 获取单元的知识点列表
   * GET /unit/{unit_id}/knowledge
   */
  getUnitKnowledge: async (unitId: number) => {
    return api.get<Knowledge[]>(`/unit/${unitId}/knowledge`);
  },
};
