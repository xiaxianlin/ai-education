/**
 * 教材服务 API
 * 对应后端 server/student/routes/textbook.py
 */
import { api } from "@/lib/api";

export const textbookService = {
  /**
   * 获取单元列表
   * GET /unit/list
   */
  getTextbookUnits: async (textbookId?: number) => {
    return api.get<Unit[]>(`/textbook/${textbookId}/units`);
  },

  /**
   * 获取单元的知识点列表
   * GET /unit/{unit_id}/knowledge
   */
  getUnitKnowledge: async (unitId: number) => {
    return api.get<Knowledge[]>(`/textbook/${unitId}/knowledges`);
  },
};
