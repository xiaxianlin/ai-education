import { api } from '@/lib/api';

export interface StudentProfile {
  id: number;
  student_id: string;
  grade: number;
  textbook_version: string;
  semester: string;
  preferred_subjects: string;
  difficulty_preference: string;
  create_time: number;
  update_time?: number;
}

export interface UpdateProfileParams {
  grade?: number;
  textbook_version?: string;
  semester?: string;
  preferred_subjects?: string;
  difficulty_preference?: string;
}

export const profileApi = {
  getProfile: async (): Promise<StudentProfile | null> => {
    return api.get<StudentProfile>('/profile');
  },

  updateProfile: async (params: UpdateProfileParams): Promise<StudentProfile> => {
    return api.post<StudentProfile>('/profile', params);
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
