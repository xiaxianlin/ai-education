/**
 * API 相关类型定义
 * 统一管理所有 API 接口的类型
 */

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

// ===== 用户相关 =====
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
  [key: string]: unknown; // 允许其他字段，但避免使用 any
}

export interface LoginParams {
  phone: string;
  password: string;
}

// ===== 练习相关 =====
export interface Question {
  id: number;
  type: string;
  subtype?: string;
  content: string;
  options: string;
  difficulty: string;
  knowledge: string;
  resource?: string;
  resource_type?: string;
  resource_content?: string;
  answer?: string;
  is_correct?: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
  content: string;
}

export interface AnswerSubmission {
  sessionId: string;
  questionId: number;
  answer: string;
  timeSpent?: number;
}

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

