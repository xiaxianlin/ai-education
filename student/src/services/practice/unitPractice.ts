/**
 * 单元练习 API 服务
 * 根据 API.md 规范实现
 */
import { api } from '@/lib/api';
import type {
  PracticeSession,
  UnitPracticeStatus,
  PracticeHistoryItem,
} from './types';

export const unitPracticeApi = {
  /**
   * 获取教材单元练习状态（根据 API.md: GET /api/student/practice/units/{textbook_id}）
   * 返回教材下所有单元的未完成练习记录
   */
  getUnitsStatus: async (textbookId: number): Promise<UnitPracticeStatus> => {
    return api.get<UnitPracticeStatus>(`/practice/units/${textbookId}`);
  },

  /**
   * 获取单元练习（根据 API.md: GET /api/student/practice/unit/{unit_id}）
   * 获取指定单元的未完成练习
   */
  getUnitPractice: async (unitId: number): Promise<PracticeSession | null> => {
    return api.get<PracticeSession | null>(`/practice/unit/${unitId}`);
  },

  /**
   * 创建单元练习（根据 API.md: POST /api/student/practice/unit/{unit_id}）
   * 为学生生成指定单元的练习
   */
  create: async (unitId: number): Promise<PracticeSession> => {
    return api.post<PracticeSession>(`/practice/unit/${unitId}`);
  },

  /**
   * 获取单元练习历史（根据 API.md: GET /api/student/practice/history/unit_practice）
   */
  getHistory: async (limit?: number): Promise<PracticeHistoryItem[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<PracticeHistoryItem[]>(`/practice/history/unit_practice${params}`);
  },

  // ===== 兼容旧接口的方法 =====

  /**
   * 获取单元练习会话详情（兼容旧接口）
   * 使用统一的会话详情接口
   */
  getSession: async (sessionId: number): Promise<{ session: PracticeSession; questions: any[]; unit?: any }> => {
    const { practiceApi } = await import('./index');
    return practiceApi.getSessionDetail(sessionId);
  },

  /**
   * 提交答案（兼容旧接口）
   * 使用统一的答案提交接口
   */
  submitAnswer: async (params: {
    session_id: number;
    question_id: number;
    answer: string;
    time_spent?: number;
    is_audio_answer?: boolean;
    audio_data?: string;
  }): Promise<{
    is_correct: boolean;
    correct_answer: string;
    analysis?: string;
    session_progress: {
      answer_count: number;
      correct_count: number;
      question_count: number;
    };
  }> => {
    const { practiceApi } = await import('./index');
    return practiceApi.submitAnswer(params);
  },

  /**
   * 完成练习（兼容旧接口）
   * 使用统一的完成接口
   */
  complete: async (sessionId: number): Promise<{ report_id: number }> => {
    const { practiceApi } = await import('./index');
    return practiceApi.completePractice(sessionId);
  },

  /**
   * 获取所有未完成的单元练习会话（兼容旧接口）
   * 从教材状态中提取
   */
  getIncompleteSessions: async (textbookId?: number): Promise<Record<number, number>> => {
    if (!textbookId) {
      // 如果没有提供 textbookId，尝试从当前激活的教材获取
      const { profileApi } = await import('@/services/profile');
      const profile = await profileApi.getProfile();
      if (profile?.textbook?.id) {
        textbookId = profile.textbook.id;
      } else {
        return {};
      }
    }
    
    const status = await unitPracticeApi.getUnitsStatus(textbookId);
    const result: Record<number, number> = {};
    Object.entries(status).forEach(([unitId, session]) => {
      if (session && session.session_id) {
        result[parseInt(unitId)] = session.session_id;
      }
    });
    return result;
  },

  /**
   * 获取单元学习进度（兼容旧接口，可能需要后端支持）
   */
  getUnitProgress: async (unitId: number): Promise<{
    unit_id: number;
    total_sessions: number;
    average_score: number;
    best_score: number;
    total_questions: number;
    correct_questions: number;
    knowledge_progress: Record<string, { total: number; correct: number; rate: number }>;
    recent_sessions: Array<{
      id: number;
      practice_date: number;
      score: number;
      total_questions: number;
      correct_questions: number;
      difficulty: string;
    }>;
  }> => {
    // 从历史记录中计算进度
    const history = await unitPracticeApi.getHistory(100);
    const unitHistory = history.filter(item => item.unit_id === unitId);
    
    const totalSessions = unitHistory.length;
    const totalQuestions = unitHistory.reduce((sum, item) => sum + item.question_count, 0);
    const correctQuestions = unitHistory.reduce((sum, item) => sum + item.correct_count, 0);
    const scores = unitHistory.map(item => {
      const score = item.question_count > 0 ? (item.correct_count / item.question_count) * 100 : 0;
      return score;
    });
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    
    return {
      unit_id: unitId,
      total_sessions: totalSessions,
      average_score: averageScore,
      best_score: bestScore,
      total_questions: totalQuestions,
      correct_questions: correctQuestions,
      knowledge_progress: {},
      recent_sessions: unitHistory.slice(0, 10).map(item => ({
        id: item.session_id,
        practice_date: item.create_time || item.start_time || 0,
        score: item.question_count > 0 ? (item.correct_count / item.question_count) * 100 : 0,
        total_questions: item.question_count,
        correct_questions: item.correct_count,
        difficulty: 'adaptive',
      })),
    };
  },
};

