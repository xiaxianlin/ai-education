import { request } from '@umijs/max';

// 根据 API.md 定义的练习会话接口
export interface PracticeSession {
  session_id: number;
  session_type: 'daily_practice' | 'unit_practice' | 'assessment';
  target_id?: number; // 每日练习的日期（如 20241123），单元练习的单元ID，能力评估的目标ID
  question_count: number;
  answer_count: number;
  correct_count: number;
  status: number; // 0-未开始, 1-进行中, 2-已完成
  create_time?: number;
  start_time?: number;
  end_time?: number;
  questions?: Array<{
    id: number;
    content: string;
    type?: string;
    subtype?: string;
    order?: number;
    options?: string;
    answer?: string;
    difficulty?: string;
    knowledge?: string;
    resource?: string;
    resource_type?: 'image' | 'audio' | null;
  }>;
  // 每日练习特有字段
  date?: number; // 日期（如 20241123）
  score?: number; // 得分
  total_questions?: number; // 总题数
  correct_questions?: number; // 正确题数
  // 单元练习特有字段
  unit_id?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  // 能力评估特有字段
  assessment_type?: 'unit' | 'comprehensive' | 'topic';
  current_ability?: number; // 能力值
  ability_level?: 'beginner' | 'intermediate' | 'advanced';
  overall_score?: number; // 总分
  confidence?: number; // 置信度（0-1）
  answered_count?: number; // 已答题数
  // 其他字段
  answers?: string; // JSON 字符串格式的答案
  total_time?: number; // 总用时（秒）
  update_time?: number;
}

// 练习会话详情（根据 API.md）
export interface PracticeSessionDetail {
  session: PracticeSession;
  answers: Array<{
    question_id: number;
    question_content: string;
    text_answer?: string;
    is_correct: number; // 0-未答, 1-正确, 2-错误
    time_spent: number; // 答题耗时（秒）
    audio_data?: string; // 音频答案（base64）
  }>;
  report?: {
    total_questions: number;
    correct_questions: number;
    overall_score: number;
    total_time: number;
  };
  // 兼容字段
  questions?: Array<{
    id: number;
    content: string;
    type?: string;
    subtype?: string;
    options?: string;
    answer?: string;
    difficulty?: string;
    knowledge?: string;
    resource?: string;
    resource_type?: 'image' | 'audio' | null;
    is_correct?: boolean; // 能力评估中的答题结果
    order?: number;
  }>;
  // 单元练习特有
  unit?: {
    id: number;
    name: string;
    textbook_id: number;
  };
}

// 每日练习会话（扩展类型）
export interface DailyPracticeSession extends Omit<PracticeSession, 'status'> {
  session_type: 'daily_practice';
  date: number; // 日期（如 20241123）
  score: number;
  total_questions: number;
  correct_questions: number;
  status: number | 'pending' | 'in_progress' | 'completed' | 'failed'; // 兼容数字和字符串状态
}

// 单元练习会话（扩展类型）
export interface UnitPracticeSession extends Omit<PracticeSession, 'status'> {
  session_type: 'unit_practice';
  unit_id: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  score: number;
  total_questions: number;
  correct_questions: number;
  accuracy?: number; // 准确率
  status: number | 'pending' | 'in_progress' | 'completed' | 'failed'; // 兼容数字和字符串状态
}

// 能力评估（扩展类型）
export interface AssessmentTest extends Omit<PracticeSession, 'status'> {
  session_type: 'assessment';
  assessment_type: 'unit' | 'comprehensive' | 'topic';
  current_ability: number;
  ability_level: 'beginner' | 'intermediate' | 'advanced';
  overall_score: number;
  confidence: number;
  answered_count: number;
  status: number | 'pending' | 'in_progress' | 'completed' | 'failed'; // 兼容数字和字符串状态
}

export interface UnitPracticeStatus {
  [unitId: string]: PracticeSession | null;
}

export const PracticeApi = {
  // 获取学生每日练习
  getDailyPractice: async (studentId: string) => {
    const res = await request<ApiData<PracticeSession>>(`/practice/${studentId}/daily`);
    return res.data;
  },

  // 为学生创建每日练习
  createDailyPractice: async (studentId: string) => {
    const res = await request<ApiData<PracticeSession>>(`/practice/${studentId}/daily/create`, {
      method: 'POST',
    });
    return res.data;
  },

  // 为学生重新生成每日练习
  regenerateDailyPractice: async (studentId: string) => {
    const res = await request<ApiData<PracticeSession>>(`/practice/${studentId}/daily/regenerate`, {
      method: 'POST',
    });
    return res.data;
  },

  // 为学生创建单元练习
  createUnitPractice: async (studentId: string, unitId: number) => {
    const res = await request<ApiData<PracticeSession>>(`/practice/${studentId}/unit/${unitId}/create`, {
      method: 'POST',
    });
    return res.data;
  },

  // 为学生重新生成单元练习
  regenerateUnitPractice: async (studentId: string, unitId: number) => {
    const res = await request<ApiData<PracticeSession>>(`/practice/${studentId}/unit/${unitId}/regenerate`, {
      method: 'POST',
    });
    return res.data;
  },

  // 为学生创建能力评估
  createAssessment: async (studentId: string) => {
    const res = await request<ApiData<PracticeSession>>(`/practice/${studentId}/assessment/create`, {
      method: 'POST',
    });
    return res.data;
  },

  // 为学生重新生成能力评估
  regenerateAssessment: async (studentId: string) => {
    const res = await request<ApiData<PracticeSession>>(`/practice/${studentId}/assessment/regenerate`, {
      method: 'POST',
    });
    return res.data;
  },

  // 获取学生练习历史
  getPracticeHistory: async (studentId: string, practiceType: 'daily_practice' | 'unit_practice' | 'assessment') => {
    const res = await request<ApiData<PracticeSession[]>>(`/practice/${studentId}/history/${practiceType}`);
    return res.data;
  },

  // 获取练习会话详情
  getSessionDetail: async (sessionId: number) => {
    const res = await request<ApiData<PracticeSessionDetail>>(`/practice/session/${sessionId}/detail`);
    return res.data;
  },
};

