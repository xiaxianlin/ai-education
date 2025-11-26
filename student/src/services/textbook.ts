/**
 * 教材服务 API
 * 对应后端 server/student/routes/textbook.py
 */
import { api } from "@/lib/api";

export const textbookService = {
  /**
   * 获取当前激活的教材
   * GET /textbook/active
   */
  getActiveTextbook: async () => {
    return api.get<Textbook>("/textbook/active");
  },

  /**
   * 获取教材列表
   * GET /textbook/list
   */
  getTextbookList: async () => {
    return api.get<Textbook[]>("/textbook/list");
  },

  /**
   * 切换激活的教材
   * POST /textbook/active/{textbook_id}
   */
  setActiveTextbook: async (textbookId: number) => {
    return api.post(`/textbook/active/${textbookId}`);
  },
};
