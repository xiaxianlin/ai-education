import { request } from '@umijs/max';

export const StudentApi = {
  search: async (params: StudentSearchParams) => {
    const res = await request<ListApiData<Student>>('/student/search', { params });
    return res.data;
  },

  create: async (data: StudentForm) => {
    const res = await request<ApiData<string>>('/student', {
      method: 'POST',
      data,
    });
    return res.data;
  },

  update: async (id: string, data: StudentUpdateForm) => {
    const res = await request<ApiData<Student>>(`/student/${id}`, {
      method: 'PATCH',
      data,
    });
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/student/${id}`, {
      method: 'DELETE',
    });
  },

  getTextbooks: async (id: string) => {
    const res = await request<ApiData<Textbook[]>>(`/student/${id}/subjects`);
    return res.data;
  },

  saveTextbooks: async (id: string, textbookIds: number[]) => {
    await request<ApiData<void>>(`/student/${id}/subjects`, {
      method: 'POST',
      data: { ids: textbookIds },
    });
  },

  resetPassword: async (id: string) => {
    const res = await request<ApiData<string>>(`/student/${id}/reset_password`, {
      method: 'POST',
    });
    return res.data;
  },

  // 获取学生配置
  getProfile: async (id: string) => {
    const res = await request<ApiData<StudentProfile>>(`/student/${id}/profile`);
    return res.data;
  },

  // 创建或更新学生配置
  saveProfile: async (id: string, data: StudentProfileForm) => {
    const res = await request<ApiData<StudentProfile>>(`/student/${id}/profile`, {
      method: 'POST',
      data,
    });
    return res.data;
  },

  // 获取学习统计
  getStats: async (id: string) => {
    const res = await request<ApiData<StudentStats>>(`/student/${id}/stats`);
    return res.data;
  },

  // 更新学习统计
  updateStats: async (id: string, data: Partial<StudentStats>) => {
    const res = await request<ApiData<StudentStats>>(`/student/${id}/stats`, {
      method: 'POST',
      data,
    });
    return res.data;
  },

  // 获取学习记录
  getRecords: async (id: string, params?: StudyRecordSearchParams) => {
    const res = await request<ListApiData<StudyRecord>>(`/student/${id}/records`, { params });
    return res.data;
  },

  // 创建学习记录
  createRecord: async (id: string, data: {
    question_id: number;
    is_correct: number;
    score: number;
    time_spent: number;
    textbook_id: number;
    unit_id?: number;
    knowledge_id?: number;
  }) => {
    const res = await request<ApiData<StudyRecord>>(`/student/${id}/records`, {
      method: 'POST',
      data,
    });
    return res.data;
  },

  // 获取错题列表
  getWrongQuestions: async (id: string, params?: WrongQuestionQueryParams) => {
    const res = await request<ListApiData<StudentWrongQuestion>>(`/student/${id}/wrong_questions`, { params });
    return res.data;
  },

  // 标记错题为已掌握
  markQuestionAsMastered: async (id: string, questionId: number) => {
    const res = await request<ApiData<void>>(`/student/${id}/wrong_questions/${questionId}/master`, {
      method: 'POST',
    });
    return res.data;
  },

  // 取消错题掌握状态
  unmarkQuestionAsMastered: async (id: string, questionId: number) => {
    const res = await request<ApiData<void>>(`/student/${id}/wrong_questions/${questionId}/unmaster`, {
      method: 'POST',
    });
    return res.data;
  },

  // 获取今日练习列表
  getDailyPractices: async (id: string, limit?: number) => {
    const res = await request<ListApiData<DailyPracticeSession>>(`/student/${id}/daily_practices`, {
      params: limit ? { limit } : {},
    });
    return res.data;
  },

  // 生成今日练习
  generateDailyPractice: async (id: string) => {
    const res = await request<ApiData<{
      session: DailyPracticeSession | null;
      task_id: number | null;
      status: string;
      progress: number;
    }>>(`/student/${id}/daily_practices/generate`, {
      method: 'POST',
    });
    return res.data;
  },

  // 获取今日练习详情
  getDailyPracticeDetail: async (id: string, sessionId: number) => {
    const res = await request<ApiData<DailyPracticeSessionDetail>>(`/student/${id}/daily_practices/${sessionId}`);
    return res.data;
  },
};

