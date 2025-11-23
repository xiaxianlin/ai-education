import { request } from '@umijs/max';

export interface PracticeSession {
  session_id: number;
  session_type: 'daily_practice' | 'unit_practice' | 'assessment';
  target_id?: number;
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
    order?: number;
  }>;
}

export interface PracticeSessionDetail {
  session: PracticeSession;
  answers: Array<{
    question_id: number;
    question_content: string;
    text_answer?: string;
    is_correct: number;
    time_spent: number;
  }>;
  report?: {
    total_questions: number;
    correct_questions: number;
    overall_score: number;
    total_time: number;
  };
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

