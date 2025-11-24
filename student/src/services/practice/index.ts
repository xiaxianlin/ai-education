/**
 * 练习服务统一导出
 * 根据 API.md 规范提供统一的接口
 */
export * from './types';
export { dailyPracticeApi } from './dailyPractice';
export { unitPracticeApi } from './unitPractice';
export { assessmentApi } from './assessment';

import { api } from '@/lib/api';
import { dailyPracticeApi } from './dailyPractice';
import { unitPracticeApi } from './unitPractice';
import { assessmentApi } from './assessment';
import type {
  CreateDailyPracticeParams,
  SubmitAnswerParams,
  CreatePracticeParams,
  CreateAssessmentParams,
  PracticeSession,
  PracticeSessionDetail,
} from './types';

/**
 * 统一的练习 API
 * 根据 API.md 规范实现
 */
export const practiceApi = {
  // ===== 统一的练习接口（根据 API.md） =====
  
  /**
   * 提交答案（根据 API.md: POST /api/student/practice/answer）
   * 统一的答案提交接口，适用于所有类型的练习
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
    return api.post('/practice/answer', params);
  },

  /**
   * 开始练习（根据 API.md: POST /api/student/practice/{session_id}/begin）
   * 标记练习会话为进行中状态，记录开始时间
   */
  beginPractice: async (sessionId: number): Promise<void> => {
    return api.post(`/practice/${sessionId}/begin`);
  },

  /**
   * 完成练习（根据 API.md: POST /api/student/practice/{session_id}/complete）
   * 完成练习，生成练习报告
   */
  completePractice: async (sessionId: number): Promise<{ report_id: number }> => {
    return api.post(`/practice/${sessionId}/complete`);
  },

  /**
   * 获取练习会话详情（统一接口）
   * 通过会话ID获取详情，适用于所有类型的练习
   * 根据 API.md: GET /api/student/practice/session/{session_id}
   */
  getSessionDetail: async (sessionId: number): Promise<PracticeSessionDetail> => {
    return api.get<PracticeSessionDetail>(`/practice/session/${sessionId}`);
  },

  // ===== 每日练习 API =====
  createDailyPractice: (params: CreateDailyPracticeParams = {}) =>
    dailyPracticeApi.create(),
  getDailyPractice: () =>
    dailyPracticeApi.getDaily(),
  getDailyPracticeSession: (sessionId: number) =>
    dailyPracticeApi.getSession(sessionId),
  submitDailyAnswer: (params: SubmitAnswerParams) =>
    dailyPracticeApi.submitAnswer(params as any),
  completeDailyPractice: (sessionId: number) =>
    dailyPracticeApi.complete(sessionId),
  getDailyPracticeHistory: (limit?: number) =>
    dailyPracticeApi.getHistory(limit),
  checkTodayPractice: () =>
    dailyPracticeApi.checkToday(),
  getDailyPracticeProgress: (taskId: number) =>
    dailyPracticeApi.getProgress(taskId),
  getDailyPracticeStats: () =>
    dailyPracticeApi.getStats(),
  uploadAudio: (audioBlob: Blob) =>
    dailyPracticeApi.uploadAudio(audioBlob),

  // ===== 单元练习 API =====
  getUnitsStatus: (textbookId: number) =>
    unitPracticeApi.getUnitsStatus(textbookId),
  getUnitPractice: (unitId: number) =>
    unitPracticeApi.getUnitPractice(unitId),
  createUnitPractice: (unitId: number) =>
    unitPracticeApi.create(unitId),
  getPracticeSession: (sessionId: number) =>
    unitPracticeApi.getSession(sessionId),
  submitUnitAnswer: (params: SubmitAnswerParams) =>
    unitPracticeApi.submitAnswer(params as any),
  completeUnitPractice: (sessionId: number) =>
    unitPracticeApi.complete(sessionId),
  getUnitProgress: (unitId: number) =>
    unitPracticeApi.getUnitProgress(unitId),
  getPracticeHistory: (limit?: number) =>
    unitPracticeApi.getHistory(limit),
  getIncompleteUnitSessions: (textbookId?: number) =>
    unitPracticeApi.getIncompleteSessions(textbookId),

  // ===== 能力评测 API =====
  getAssessment: () =>
    assessmentApi.getAssessment(),
  createAssessment: () =>
    assessmentApi.create(),
  getNextAssessmentQuestion: (assessmentId: number) =>
    assessmentApi.getNextQuestion(assessmentId),
  submitAssessmentAnswer: (params: SubmitAnswerParams & { assessment_id: number }) =>
    assessmentApi.submitAnswer(params as any),
  completeAssessment: (assessmentId: number) =>
    assessmentApi.complete(assessmentId),
  getAssessmentHistory: (limit?: number) =>
    assessmentApi.getHistory(limit),
};

