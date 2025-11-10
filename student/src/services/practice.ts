import { api } from '@/lib/api';

// ===== 今日练习类型定义 =====
export interface DailyPracticeSession {
  id: number;
  student_id: string;
  date: number;
  total_questions: number;
  correct_questions: number;
  total_time: number;
  score: number;
  practice_type: string;
  knowledge_coverage: string;
  question_distribution: string;
  question_ids: string;
  answers: string;
  status: string;
  create_time: number;
  update_time: number;
}

export interface CreateDailyPracticeParams {
  count?: number;
  practice_type?: string;
}

export interface DailyPracticeSessionDetail {
  session: DailyPracticeSession;
  questions: Question[];
}

export interface DailyPracticeReport {
  session_id: number;
  date: number;
  total_questions: number;
  correct_questions: number;
  score: number;
  total_time: number;
  knowledge_coverage: Record<string, KnowledgeScore>;
  question_distribution: Record<string, number>;
  status: string;
}

export interface DailyPracticeHistoryItem {
  id: number;
  date: number;
  total_questions: number;
  correct_questions: number;
  score: number;
  total_time: number;
  practice_type: string;
  status: string;
}

// ===== 单元练习类型定义 =====
export interface UnitPracticeSession {
  id: number;
  student_id: string;
  unit_id: number;
  practice_date: number;
  total_questions: number;
  correct_questions: number;
  total_time: number;
  score: number;
  knowledge_scores: string;
  difficulty: string;
  question_ids: string;
  answers: string;
  status: string;
  create_time: number;
  update_time: number;
}

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

export interface UnitInfo {
  id: number;
  name: string;
  content: string;
}

export interface PracticeSessionDetail {
  session: UnitPracticeSession;
  questions: Question[];
  unit: UnitInfo;
}

export interface CreatePracticeParams {
  unit_id: number;
  difficulty?: string;
  count?: number;
}

export interface SubmitAnswerParams {
  session_id: number;
  question_id: number;
  answer: string;
  time_spent?: number;
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

export interface PracticeReport {
  session_id: number;
  unit_id: number;
  unit_name: string;
  total_questions: number;
  correct_questions: number;
  score: number;
  total_time: number;
  knowledge_scores: Record<string, KnowledgeScore>;
  status: string;
  practice_date: number;
}

export interface UnitProgress {
  unit_id: number;
  total_sessions: number;
  average_score: number;
  best_score: number;
  total_questions: number;
  correct_questions: number;
  knowledge_progress: Record<string, KnowledgeScore>;
  recent_sessions: Array<{
    id: number;
    practice_date: number;
    score: number;
    total_questions: number;
    correct_questions: number;
    difficulty: string;
  }>;
}

export interface PracticeHistoryItem {
  id: number;
  unit_id: number;
  unit_name: string;
  practice_date: number;
  total_questions: number;
  correct_questions: number;
  score: number;
  total_time: number;
  difficulty: string;
  status: string;
}

// ===== API 函数 =====
export const practiceApi = {
  // ===== 今日练习 API =====
  
  /**
   * 创建今日练习会话
   */
  createDailyPractice: async (params: CreateDailyPracticeParams = {}): Promise<DailyPracticeSession> => {
    return api.post<DailyPracticeSession>('/practice/daily', {
      count: params.count || 10,
      practice_type: params.practice_type || 'daily',
    });
  },

  /**
   * 获取今日练习会话详情
   */
  getDailyPracticeSession: async (sessionId: number): Promise<DailyPracticeSessionDetail> => {
    return api.get<DailyPracticeSessionDetail>(`/practice/daily/${sessionId}`);
  },

  /**
   * 提交今日练习答案
   */
  submitDailyAnswer: async (params: SubmitAnswerParams): Promise<AnswerResult> => {
    return api.post<AnswerResult>('/practice/daily/answer', params);
  },

  /**
   * 完成今日练习
   */
  completeDailyPractice: async (sessionId: number): Promise<DailyPracticeReport> => {
    return api.post<DailyPracticeReport>('/practice/daily/complete', { session_id: sessionId });
  },

  /**
   * 获取今日练习历史
   */
  getDailyPracticeHistory: async (limit?: number): Promise<DailyPracticeHistoryItem[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<DailyPracticeHistoryItem[]>(`/practice/daily/history${params}`);
  },

  // ===== 单元练习 API =====

  /**
   * 创建单元练习会话
   */
  createUnitPractice: async (params: CreatePracticeParams): Promise<UnitPracticeSession> => {
    return api.post<UnitPracticeSession>('/practice/unit', {
      unit_id: params.unit_id,
      difficulty: params.difficulty || 'adaptive',
      count: params.count || 10,
    });
  },

  /**
   * 获取单元练习会话详情
   */
  getPracticeSession: async (sessionId: number): Promise<PracticeSessionDetail> => {
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
  completePractice: async (sessionId: number): Promise<PracticeReport> => {
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
  getPracticeHistory: async (limit?: number): Promise<PracticeHistoryItem[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<PracticeHistoryItem[]>(`/practice/history${params}`);
  },
};

