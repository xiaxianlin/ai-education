import { request } from '@umijs/max';
import type {
  PracticeSession,
  PracticeSessionDetail,
  DailyPracticeSession,
  UnitPracticeSession,
  AssessmentTest,
} from './practice';

export const StudentApi = {
  search: async (params: StudentSearchParams) => {
    const res = await request<ListApiData<Student>>('/student/search', { params });
    return res.data;
  },

  getDetail: async (id: string) => {
    const res = await request<ApiData<Student>>(`/student/${id}`);
    return res.data;
  },

  create: async (data: StudentForm) => {
    const res = await request<ApiData<Student>>('/student', {
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
    const res = await request<ApiData<Textbook[]>>(`/student/${id}/textbooks`);
    return res.data;
  },

  saveTextbooks: async (id: string, textbookIds: number[]) => {
    await request<ApiData<void>>(`/student/${id}/textbooks`, {
      method: 'POST',
      data: { ids: textbookIds },
    });
  },

  resetPassword: async (id: string) => {
    const res = await request<ApiData<ResetPasswordResponse>>(`/student/${id}/reset_password`, {
      method: 'POST',
    });
    return res.data;
  },

  // 练习相关 API（管理端）
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
  regenerateDailyPractice: async (studentId: string, sessionId: number) => {
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

  // 获取练习会话详情
  getSessionDetail: async (sessionId: number) => {
    const res = await request<ApiData<PracticeSessionDetail>>(`/practice/session/${sessionId}/detail`);
    return res.data;
  },

  // 获取学生单元练习状态
  getUnitPracticeStatus: async (studentId: string, textbookId: number) => {
    const res = await request<ApiData<Record<string, PracticeSession | null>>>(
      `/practice/units/${textbookId}`,
      { params: { student_id: studentId } },
    );
    return res.data;
  },

  // 获取单元练习列表（根据 API.md，使用 history 接口）
  getUnitPractices: async (studentId: string, limit: number = 30) => {
    const res = await request<ApiData<UnitPracticeSession[]>>(`/practice/${studentId}/history/unit_practice`, {
      params: { limit },
    });
    // 转换为 ListApiData 格式
    return {
      data: res || [],
      total: res?.length || 0,
    };
  },

  // 获取能力评估列表（根据 API.md，使用 history 接口）
  getAssessments: async (studentId: string, limit: number = 30) => {
    const res = await request<ApiData<AssessmentTest[]>>(`/practice/${studentId}/history/assessment`, {
      params: { limit },
    });
    // 转换为 ListApiData 格式
    return {
      data: res || [],
      total: res?.length || 0,
    };
  },

  // 获取每日练习详情（兼容旧接口）
  getDailyPracticeDetail: async (studentId: string, sessionId: number) => {
    const res = await request<ApiData<PracticeSessionDetail>>(`/practice/session/${sessionId}/detail`);
    return res.data;
  },

  // 获取单元练习详情（兼容旧接口）
  getUnitPracticeDetail: async (studentId: string, sessionId: number) => {
    const res = await request<ApiData<PracticeSessionDetail>>(`/practice/session/${sessionId}/detail`);
    return res.data;
  },

  // 获取能力评估详情（兼容旧接口）
  getAssessmentDetail: async (studentId: string, sessionId: number) => {
    const res = await request<ApiData<PracticeSessionDetail>>(`/practice/session/${sessionId}/detail`);
    return res.data;
  },

  // 生成每日练习（兼容旧接口，实际调用 create）
  generateDailyPractice: async (studentId: string) => {
    return StudentApi.createDailyPractice(studentId);
  },

  // 获取学生资料（包含当前教材信息）
  getProfile: async (studentId: string) => {
    const res = await request<ApiData<{ current_textbook_id?: number }>>(`/student/${studentId}/profile`);
    return res.data;
  },

  // 获取每日练习列表（根据 API.md）
  getDailyPractices: async (studentId: string, limit: number = 100) => {
    const res = await request<ApiData<DailyPracticeSession[]>>(`/practice/${studentId}/history/daily_practice`, {
      params: { limit },
    });
    // 转换为 ListApiData 格式
    return {
      data: res || [],
      total: res?.length || 0,
    };
  },

  // 删除每日练习（如果后端支持）
  // 重置能力评估（兼容旧接口）
  resetAssessment: async (studentId: string, assessmentId: number) => {
    return StudentApi.regenerateAssessment(studentId);
  },
};

