/**
 * 单元练习 API 服务
 * 负责单元练习相关的所有 API 调用
 */
import { api } from '@/lib/api';
import type {
  UnitPracticeSession,
  PracticeSessionDetail,
  CreatePracticeParams,
  SubmitAnswerParams,
  AnswerResult,
  PracticeReport,
  UnitProgress,
  PracticeHistoryItem,
} from './types';

export const unitPracticeApi = {
  /**
   * 创建单元练习会话
   */
  create: async (params: CreatePracticeParams): Promise<UnitPracticeSession> => {
    return api.post<UnitPracticeSession>('/practice/unit', {
      unit_id: params.unit_id,
      difficulty: params.difficulty || 'adaptive',
      count: params.count || 10,
    });
  },

  /**
   * 获取单元练习会话详情
   */
  getSession: async (sessionId: number): Promise<PracticeSessionDetail> => {
    return api.get<PracticeSessionDetail>(`/practice/unit/${sessionId}`);
  },

  /**
   * 提交答案
   */
  submitAnswer: async (params: SubmitAnswerParams): Promise<AnswerResult> => {
    return api.post<AnswerResult>('/practice/unit/answer', params);
  },

  /**
   * 完成练习
   */
  complete: async (sessionId: number): Promise<PracticeReport> => {
    return api.post<PracticeReport>('/practice/unit/complete', { session_id: sessionId });
  },

  /**
   * 获取单元学习进度
   */
  getUnitProgress: async (unitId: number): Promise<UnitProgress> => {
    return api.get<UnitProgress>(`/practice/unit/${unitId}/progress`);
  },

  /**
   * 获取练习历史
   */
  getHistory: async (limit?: number): Promise<PracticeHistoryItem[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<PracticeHistoryItem[]>(`/practice/history${params}`);
  },

  /**
   * 获取所有未完成的单元练习会话
   */
  getIncompleteSessions: async (): Promise<Record<number, number>> => {
    return api.get<Record<number, number>>('/practice/unit/incomplete-sessions');
  },
};

