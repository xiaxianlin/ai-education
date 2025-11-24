import { api } from '@/lib/api';
import type { Student, Textbook, CheckAuthResponse } from '@/lib/types/schema';

/**
 * 学生资料（兼容旧接口）
 * 实际应使用 CheckAuthResponse
 */
export interface StudentProfile {
  id?: number;
  student_id?: string;
  current_textbook_id?: number;
  preferred_subjects?: string;
  difficulty_preference?: string;
  create_time?: number;
  update_time?: number;
  // 根据 API.md，check 接口返回的格式
  student?: Student;
  textbook?: Textbook;
}

export interface UpdateProfileParams {
  current_textbook_id?: number;
  preferred_subjects?: string;
  difficulty_preference?: string;
}

export const profileApi = {
  /**
   * 检查登录状态（根据 API.md: GET /api/student/check）
   * 返回学生信息和当前教材信息
   */
  check: async (): Promise<CheckAuthResponse> => {
    return api.get<CheckAuthResponse>('/check');
  },

  /**
   * 获取个人资料（兼容旧接口）
   * 使用 check 接口获取信息
   */
  getProfile: async (): Promise<StudentProfile | null> => {
    try {
      const data = await profileApi.check();
      return {
        student_id: data.student.id,
        current_textbook_id: data.textbook?.id,
        student: data.student,
        textbook: data.textbook,
      };
    } catch (error) {
      console.error('获取个人资料失败:', error);
      return null;
    }
  },

  /**
   * 更新个人资料（兼容旧接口）
   * 如果更新的是 current_textbook_id，使用激活教材接口
   */
  updateProfile: async (params: UpdateProfileParams): Promise<StudentProfile> => {
    // 如果更新的是当前教材，使用激活教材接口
    if (params.current_textbook_id !== undefined) {
      await profileApi.activateTextbook(params.current_textbook_id);
      // 重新获取资料
      const profile = await profileApi.getProfile();
      if (!profile) {
        throw new Error('更新失败');
      }
      return profile;
    }
    
    // 其他字段的更新（如果需要后端支持）
    // 目前先返回当前资料
    const profile = await profileApi.getProfile();
    if (!profile) {
      throw new Error('更新失败');
    }
    return profile;
  },

  getStats: async () => {
    return api.get<StudentStats>('/profile/stats');
  },

  getWrongQuestions: async (mastered?: number) => {
    const params = mastered !== undefined ? `?mastered=${mastered}` : '';
    return api.get<WrongQuestion[]>(`/profile/wrong_questions${params}`);
  },

  markQuestionAsMastered: async (questionId: number) => {
    return api.post(`/profile/wrong_questions/${questionId}/master`);
  },

  unmarkQuestionAsMastered: async (questionId: number) => {
    return api.post(`/profile/wrong_questions/${questionId}/unmaster`);
  },

  getRecords: async () => {
    return api.get<StudyRecord[]>('/profile/records');
  },

  createRecord: async (params: CreateStudyRecordParams) => {
    return api.post<StudyRecord>('/profile/records', params);
  },

  // ===== 教材相关接口（根据 API.md） =====
  
  /**
   * 获取学生教材列表（根据 API.md: GET /api/student/textbook/all）
   */
  getTextbooks: async (): Promise<Textbook[]> => {
    return api.get<Textbook[]>('/textbook/all');
  },

  /**
   * 获取教材单元列表（根据 API.md: GET /api/student/textbook/units?textbook_id=1）
   * 如果不指定 textbook_id，则获取当前激活教材的单元
   */
  getUnits: async (textbookId?: number): Promise<Unit[]> => {
    const params = textbookId ? `?textbook_id=${textbookId}` : '';
    return api.get<Unit[]>(`/textbook/units${params}`);
  },

  /**
   * 激活教材（根据 API.md: POST /api/student/textbook/acitve/{textbook_id}）
   * 注意：API.md 中拼写是 "acitve"，可能是 "active" 的拼写错误
   */
  activateTextbook: async (textbookId: number): Promise<void> => {
    return api.post(`/textbook/acitve/${textbookId}`);
  },

  // ===== 兼容旧接口的方法 =====
  
  /**
   * 获取教材列表（兼容旧接口）
   * 使用新的接口
   */
  getTextbooksOld: async () => {
    return profileApi.getTextbooks();
  },

  /**
   * 获取单元列表（兼容旧接口）
   * 使用新的接口
   */
  getUnitsOld: async (textbookId?: number) => {
    return profileApi.getUnits(textbookId);
  },
};

export interface StudentStats {
  id: number;
  student_id: string;
  total_practice: number;
  total_questions: number;
  correct_questions: number;
  accuracy: number;
  current_streak: number;
  max_streak: number;
  last_study_date: number;
  total_study_duration: number;
  achievements: string;
  create_time: number;
  update_time?: number;
}

export interface WrongQuestion {
  id: number;
  student_id: string;
  question_id: number;
  wrong_count: number;
  last_wrong_time: number;
  is_mastered: number;
  mastered_time: number;
  create_time: number;
  update_time?: number;
  question_content?: string;
}

export interface StudyRecord {
  id: number;
  student_id: string;
  textbook_id: number;
  unit_id?: number;
  knowledge_id?: number;
  question_id?: number;
  is_correct: number;
  score: number;
  time_spent: number;
  study_date: number;
  create_time: number;
}

export interface CreateStudyRecordParams {
  textbook_id: number;
  unit_id?: number;
  knowledge_id?: number;
  question_id?: number;
  is_correct: number;
  score?: number;
  time_spent?: number;
  study_date?: number;
}

// 导出统一类型（兼容旧接口）
export type { Textbook, Unit, Knowledge } from '@/lib/types/schema';
