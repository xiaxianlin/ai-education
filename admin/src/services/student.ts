import { request } from '@umijs/max';

export const StudentApi = {
  search: async (params: StudentSearchParams) => {
    const res = await request<ListApiData<Student>>('/student/search', { params });
    return res.data;
  },

  create: async (data: StudentForm) => {
    const res = await request<ApiData<Student>>('/student', { method: 'POST', data });
    return res.data;
  },

  update: async (id: string, data: StudentForm) => {
    const res = await request<ApiData<Student>>(`/student/${id}`, { method: 'PATCH', data });
    return res.data;
  },

  getDetail: async (id: string) => {
    const res = await request<ApiData<StudentProfile>>(`/student/${id}`);
    return res.data;
  },

  delete: async (id: string) => {
    await request<ApiData<void>>(`/student/${id}`, { method: 'DELETE' });
  },

  resetPassword: async (id: string) => {
    const res = await request<ApiData<ResetPasswordResponse>>(`/student/${id}/reset_password`, {
      method: 'POST',
    });
    return res.data;
  },

  getTextbooks: async (id: string) => {
    const res = await request<ApiData<Textbook[]>>(`/student/${id}/textbooks`);
    return res.data;
  },

  addTextbook: async (id: string, textbookId: number) => {
    await request<ApiData<void>>(`/student/${id}/textbook/${textbookId}`, { method: 'POST' });
  },

  removeTextbook: async (id: string, textbookId: number) => {
    await request<ApiData<void>>(`/student/${id}/textbook/${textbookId}`, { method: 'DELETE' });
  },

  // 练习相关 API（管理端）
  // 获取学生练习历史
  getPracticeHistory: async (studentId: string, practiceType: PracticeSessionType) => {
    const res = await request<ApiData<PracticeSession[]>>(
      `/practice/${studentId}/history/${practiceType}`,
    );
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
  regenerateDailyPractice: async (studentId: string, sessionId: number) => {
    const res = await request<ApiData<PracticeSession>>(`/practice/${studentId}/daily/regenerate`, {
      method: 'POST',
    });
    return res.data;
  },

  // 为学生重新生成单元练习
  regenerateUnitPractice: async (studentId: string, unitId: number) => {
    const res = await request<ApiData<PracticeSession>>(
      `/practice/${studentId}/unit/${unitId}/regenerate`,
      { method: 'POST' },
    );
    return res.data;
  },

  // 为学生创建能力评估
  createAssessment: async (studentId: string) => {
    const res = await request<ApiData<PracticeSession>>(
      `/practice/${studentId}/assessment/create`,
      { method: 'POST' },
    );
    return res.data;
  },

  // 为学生重新生成能力评估
  regenerateAssessment: async (studentId: string) => {
    const res = await request<ApiData<PracticeSession>>(
      `/practice/${studentId}/assessment/regenerate`,
      { method: 'POST' },
    );
    return res.data;
  },

  // 获取练习会话详情
  getPracticeSession: async (sessionId: number) => {
    const res = await request<ApiData<PracticeSessionDetail>>(`/practice/session/${sessionId}`);
    return res.data;
  },

  removePracticeSession: async (sessionId: number) => {
    await request<ApiData<void>>(`/practice/session/${sessionId}`, { method: 'DELETE' });
  },
};
