/**
 * 今日练习 API 服务
 * 负责今日练习相关的所有 API 调用
 */
import { api } from '@/lib/api';
import type {
  DailyPracticeSession,
  CreateDailyPracticeParams,
  DailyPracticeSessionDetail,
  DailyPracticeReport,
  DailyPracticeHistoryItem,
  SubmitAnswerParams,
  AnswerResult,
} from './types';

export const dailyPracticeApi = {
  /**
   * 创建今日练习会话
   */
  create: async (params: CreateDailyPracticeParams = {}): Promise<DailyPracticeSession> => {
    return api.post<DailyPracticeSession>('/practice/daily', {
      count: params.count || 10,
      practice_type: params.practice_type || 'daily',
    });
  },

  /**
   * 获取今日练习会话详情
   */
  getSession: async (sessionId: number): Promise<DailyPracticeSessionDetail> => {
    return api.get<DailyPracticeSessionDetail>(`/practice/daily/${sessionId}`);
  },

  /**
   * 提交今日练习答案
   */
  submitAnswer: async (params: SubmitAnswerParams): Promise<AnswerResult> => {
    return api.post<AnswerResult>('/practice/daily/answer', params);
  },

  /**
   * 完成今日练习
   */
  complete: async (sessionId: number): Promise<DailyPracticeReport> => {
    return api.post<DailyPracticeReport>('/practice/daily/complete', { session_id: sessionId });
  },

  /**
   * 获取今日练习历史
   */
  getHistory: async (limit?: number): Promise<DailyPracticeHistoryItem[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<DailyPracticeHistoryItem[]>(`/practice/daily/history${params}`);
  },

  /**
   * 检查或创建今日练习（30道题）
   */
  checkToday: async (): Promise<{
    session: DailyPracticeSession | null;
    task_id: number | null;
    status: string;
    progress: number;
  }> => {
    return api.get('/practice/daily/check');
  },

  /**
   * 获取今日练习生成进度
   */
  getProgress: async (taskId: number): Promise<{
    status: string;
    progress: number;
    session?: DailyPracticeSession;
    error_message?: string;
  }> => {
    return api.get(`/practice/daily/progress/${taskId}`);
  },
};

