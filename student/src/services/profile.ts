import { api } from '@/lib/api';
import type { Textbook, CheckAuthResponse, PracticeSession, Unit, Knowledge } from '@/lib/types/schema';

export const profileApi = {
  /**
   * 检查登录状态（根据 API.md: GET /api/student/check）
   * 返回学生信息和当前教材信息
   */
  check: async (): Promise<CheckAuthResponse> => {
    return api.get<CheckAuthResponse>('/check');
  },

  /**
   * 获取错题列表（GET /api/student/wrong-records）
   */
  getWrongQuestions: async (mastered?: number) => {
    const params = mastered !== undefined ? `?mastered=${mastered}` : '';
    return api.get<WrongQuestion[]>(`/wrong-records${params}`);
  },

  /**
   * 标记题目为已掌握（POST /api/student/wrong-records/{question_id}/master）
   */
  markQuestionAsMastered: async (questionId: number) => {
    return api.post(`/wrong-records/${questionId}/master`);
  },

  /**
   * 取消标记题目为已掌握（POST /api/student/wrong-records/{question_id}/unmaster）
   */
  unmarkQuestionAsMastered: async (questionId: number) => {
    return api.post(`/wrong-records/${questionId}/unmaster`);
  },

  // ===== 教材相关接口（根据 API.md） =====
  
  /**
   * 获取学生教材列表（根据 API.md: GET /api/student/textbook/all）
   */
  getTextbooks: async (): Promise<Textbook[]> => {
    return api.get<Textbook[]>('/textbook/all');
  },

  /**
   * 获取教材单元列表（根据 API.md: GET /api/student/textbook/units?textbook_id=1）
   * 如果不指定 textbook_id，则获取当前激活教材的单元
   */
  getUnits: async (textbookId?: number): Promise<Unit[]> => {
    const params = textbookId ? `?textbook_id=${textbookId}` : '';
    return api.get<Unit[]>(`/textbook/units${params}`);
  },

  /**
   * 获取单元知识点列表（GET /api/student/unit/{unit_id}/knowledges）
   */
  getUnitKnowledges: async (unitId: number): Promise<Knowledge[]> => {
    return api.get<Knowledge[]>(`/unit/${unitId}/knowledges`);
  },

  /**
   * 获取进行中的单元练习（GET /api/student/unit/practice/in-progress）
   */
  getInProgressUnitPractice: async (): Promise<PracticeSession | null> => {
    return api.get<PracticeSession | null>('/unit/practice/in-progress');
  },

  /**
   * 激活教材（根据 API.md: POST /api/student/textbook/acitve/{textbook_id}）
   * 注意：API.md 中拼写是 "acitve"，可能是 "active" 的拼写错误
   */
  activateTextbook: async (textbookId: number): Promise<void> => {
    return api.post(`/textbook/acitve/${textbookId}`);
  },
};

/**
 * 错题记录
 */
export interface WrongQuestion {
  id: number;
  student_id: string;
  question_id: number;
  wrong_count: number;
  last_wrong_time: number;
  is_mastered: number;
  mastered_time: number;
  create_time: number;
  update_time?: number;
  question_content?: string;
  knowledge?: string;
}

// 导出类型
export type { Textbook, Unit, Knowledge } from '@/lib/types/schema';
