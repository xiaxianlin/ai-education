/**
 * 能力评测 API 服务
 * 负责能力评测相关的所有 API 调用
 */
import { api } from '@/lib/api';
import type {
  AssessmentTest,
  CreateAssessmentParams,
  AssessmentNextQuestion,
  SubmitAnswerParams,
  AssessmentAnswerResult,
  AssessmentReport,
  AssessmentHistoryItem,
} from './types';

export const assessmentApi = {
  /**
   * 创建能力评测
   */
  create: async (params: CreateAssessmentParams = {}): Promise<AssessmentTest> => {
    return api.post<AssessmentTest>('/practice/assessment', {
      assessment_type: params.assessment_type || 'comprehensive',
      target_id: params.target_id,
      max_questions: params.max_questions || 20,
      min_questions: params.min_questions || 10,
    });
  },

  /**
   * 获取下一道评测题目（自适应）
   */
  getNextQuestion: async (assessmentId: number): Promise<AssessmentNextQuestion | null> => {
    return api.get<AssessmentNextQuestion | null>(`/practice/assessment/${assessmentId}/next`);
  },

  /**
   * 提交评测答案
   */
  submitAnswer: async (params: SubmitAnswerParams & { assessment_id: number }): Promise<AssessmentAnswerResult> => {
    return api.post<AssessmentAnswerResult>('/practice/assessment/answer', params);
  },

  /**
   * 完成能力评测
   */
  complete: async (assessmentId: number): Promise<AssessmentReport> => {
    return api.post<AssessmentReport>('/practice/assessment/complete', { assessment_id: assessmentId });
  },

  /**
   * 获取能力评测历史
   */
  getHistory: async (limit?: number): Promise<AssessmentHistoryItem[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<AssessmentHistoryItem[]>(`/practice/assessment/history${params}`);
  },
};

