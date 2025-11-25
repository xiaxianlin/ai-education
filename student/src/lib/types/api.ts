/**
 * API 相关类型定义
 * 统一管理所有 API 接口的类型
 * 
 * 注意：基础数据类型定义在 schema.ts 中，这里主要定义 API 响应和请求类型
 */

// 导出统一的数据类型
export type {
  Student,
  Textbook,
  Unit,
  Knowledge,
  Question,
  PracticeSession,
  PracticeHistory,
  PracticeAnswer,
  PracticeWrongRecord,
  PracticeReport,
  LoginParams,
  CheckAuthResponse,
  SubmitAnswerParams,
  SubmitAnswerResponse,
  BeginPracticeResponse,
  CompletePracticeResponse,
  UnitPracticeStatus,
} from './schema';

// ===== 通用类型 =====
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== 用户相关（兼容旧接口） =====
/**
 * @deprecated 使用 Student 类型替代
 */
export interface StudentInfo {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  grade?: number;
  textbookVersion?: string;
  semester?: string;
  totalPracticeTime?: number;
  accuracyRate?: number;
  continuousDays?: number;
  createdAt?: string;
  [key: string]: unknown;
}

// ===== 练习相关（兼容旧接口） =====
/**
 * @deprecated 使用 Question 类型替代
 */
export interface QuestionOption {
  id: string;
  label: string;
  content: string;
}

/**
 * @deprecated 使用 SubmitAnswerParams 类型替代
 */
export interface AnswerSubmission {
  sessionId: string;
  questionId: number;
  answer: string;
  timeSpent?: number;
}

/**
 * @deprecated 使用 SubmitAnswerResponse 类型替代
 */
export interface AnswerResult {
  is_correct: boolean;
  correct_answer: string;
  explanation?: string;
}

export interface KnowledgeScore {
  total: number;
  correct: number;
  rate: number;
}

// ===== 错误类型 =====
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

