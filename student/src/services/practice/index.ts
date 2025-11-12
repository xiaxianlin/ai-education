/**
 * 练习服务统一导出
 * 提供向后兼容的 API 接口
 */
export * from './types';
export { dailyPracticeApi } from './dailyPractice';
export { unitPracticeApi } from './unitPractice';
export { assessmentApi } from './assessment';

// 向后兼容：保持原有的 practiceApi 对象结构
import { dailyPracticeApi } from './dailyPractice';
import { unitPracticeApi } from './unitPractice';
import { assessmentApi } from './assessment';
import type {
  CreateDailyPracticeParams,
  SubmitAnswerParams,
  CreatePracticeParams,
  CreateAssessmentParams,
} from './types';

export const practiceApi = {
  // ===== 今日练习 API =====
  createDailyPractice: (params: CreateDailyPracticeParams = {}) =>
    dailyPracticeApi.create(params),
  getDailyPracticeSession: (sessionId: number) =>
    dailyPracticeApi.getSession(sessionId),
  submitDailyAnswer: (params: SubmitAnswerParams) =>
    dailyPracticeApi.submitAnswer(params),
  completeDailyPractice: (sessionId: number) =>
    dailyPracticeApi.complete(sessionId),
  getDailyPracticeHistory: (limit?: number) =>
    dailyPracticeApi.getHistory(limit),
  checkTodayPractice: () =>
    dailyPracticeApi.checkToday(),
  getDailyPracticeProgress: (taskId: number) =>
    dailyPracticeApi.getProgress(taskId),

  // ===== 单元练习 API =====
  createUnitPractice: (params: CreatePracticeParams) =>
    unitPracticeApi.create(params),
  getPracticeSession: (sessionId: number) =>
    unitPracticeApi.getSession(sessionId),
  submitAnswer: (params: SubmitAnswerParams) =>
    unitPracticeApi.submitAnswer(params),
  completePractice: (sessionId: number) =>
    unitPracticeApi.complete(sessionId),
  getUnitProgress: (unitId: number) =>
    unitPracticeApi.getUnitProgress(unitId),
  getPracticeHistory: (limit?: number) =>
    unitPracticeApi.getHistory(limit),

  // ===== 能力评测 API =====
  createAssessment: (params: CreateAssessmentParams = {}) =>
    assessmentApi.create(params),
  getNextAssessmentQuestion: (assessmentId: number) =>
    assessmentApi.getNextQuestion(assessmentId),
  submitAssessmentAnswer: (params: SubmitAnswerParams & { assessment_id: number }) =>
    assessmentApi.submitAnswer(params),
  completeAssessment: (assessmentId: number) =>
    assessmentApi.complete(assessmentId),
  getAssessmentHistory: (limit?: number) =>
    assessmentApi.getHistory(limit),
};

