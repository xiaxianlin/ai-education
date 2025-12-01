/**
 * 练习服务 API
 * 对应后端 server/student/routes/practice.py
 */
import { api } from "@/lib/api";

export const practiceService = {
  // ===== 获取练习信息 =====

  /**
   * 获取每日练习
   * GET /practice/daily
   */
  getDailyPractice: async () => {
    return api.get<PracticeSession[]>("/practice/daily");
  },

  /**
   * 获取单元练习
   * GET /practice/unit
   */
  getUnitPractice: async () => {
    return api.get<PracticeSession[]>("/practice/unit");
  },

  /**
   * 获取能力评测
   * GET /practice/assessment
   */
  getAssessment: async () => {
    return api.get<PracticeSession[]>("/practice/assessment");
  },

  // ===== 创建练习 =====

  /**
   * 创建练习
   * POST /practice/create
   */
  createPractice: async (
    type: "daily_practice" | "unit_practice" | "assessment",
    textbook_id: number,
    unit_id?: number
  ) => {
    return api.post<number>(`/practice/create`, { type, textbook_id, unit_id });
  },

  // ===== 练习操作 =====

  /**
   * 开始练习
   * POST /practice/{session_id}/begin
   */
  beginPractice: async (sessionId: number) => {
    return api.post(`/practice/${sessionId}/begin`);
  },

  /**
   * 提交答案
   * POST /practice/answer
   */
  submitAnswer: async (params: SubmitAnswerParams) => {
    return api.post<SubmitAnswerResponse>("/practice/answer", params);
  },

  /**
   * 完成练习
   * POST /practice/{session_id}/complete
   */
  completePractice: async (sessionId: number) => {
    return api.post<CompletePracticeResponse>(
      `/practice/${sessionId}/complete`
    );
  },

  // ===== 获取详情 =====

  /**
   * 获取练习会话详情
   * GET /practice/session/{session_id}
   */
  getSessionDetail: async (sessionId: number) => {
    return api.get<PracticeSessionDetail>(`/practice/session/${sessionId}`);
  },

  /**
   * 获取练习历史记录
   * GET /practice/history/{type}
   */
  getHistory: async (
    type: "daily_practice" | "unit_practice" | "assessment",
    limit?: number
  ) => {
    const params = limit ? `?limit=${limit}` : "";
    return api.get<PracticeSession[]>(`/practice/history/${type}${params}`);
  },
};
