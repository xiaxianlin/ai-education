declare global {
  interface Student {
    id: string;
    name: string;
    phone: string;
    grade?: number;
    status: number;
    create_time: number;
    update_time?: number;
    textbooks?: Textbook[];
  }

  interface StudentForm {
    name: string;
    phone: string;
    password?: string;
  }

  interface StudentUpdateForm {
    name?: string;
    phone?: string;
    status?: number;
  }

  interface StudentSearchParams extends SearchParams {
    keyword?: string;
    status?: number;
  }

  interface ResetPasswordResponse {
    password: string;
  }

  // 学生配置信息
  interface StudentProfile {
    id?: number;
    student_id: string;
    current_textbook_id?: number;
    preferred_subjects?: string;
    difficulty_preference?: string;
    created_at?: number;
    updated_at?: number;
  }

  // 学习统计
  interface StudentStats {
    id?: number;
    student_id: string;
    total_practice: number;
    total_questions: number;
    correct_questions: number;
    accuracy: number;
    current_streak: number;
    max_streak: number;
    total_time: number;
    created_at?: number;
    updated_at?: number;
  }

  // 学习记录
  interface StudyRecord {
    id: number;
    student_id: string;
    question_id: number;
    is_correct: number;
    score: number;
    time_spent: number;
    textbook_id: number;
    unit_id?: number;
    knowledge_id?: number;
    study_date: number;
    created_at: number;
  }

  // 今日练习会话
  interface DailyPracticeSession {
    id: number;
    student_id: string;
    date: number; // YYYYMMDD格式
    total_questions: number;
    correct_questions: number;
    total_time: number;
    score: number;
    practice_type: string;
    knowledge_coverage: string; // JSON
    question_distribution: string; // JSON
    question_ids: string; // JSON数组
    answers: string; // JSON
    status: string; // in_progress/completed
    create_time: number;
    update_time: number;
  }

  // 今日练习详情
  interface DailyPracticeSessionDetail {
    session: DailyPracticeSession;
    questions: Array<{
      id: number;
      type: string;
      subtype?: string;
      content: string;
      options?: string;
      difficulty: string;
      knowledge: string;
      resource?: string;
      resource_type?: string;
      resource_content?: string;
      answer?: string;
      is_correct?: boolean;
    }>;
  }

  // 错题
  interface StudentWrongQuestion {
    id: number;
    student_id: string;
    question_id: number;
    question_content?: string;
    wrong_count: number;
    is_mastered: number;
    last_wrong_time: number;
    created_at: number;
    updated_at: number;
  }

  // 学生配置表单
  interface StudentProfileForm {
    current_textbook_id?: number;
    preferred_subjects?: string;
    difficulty_preference?: string;
  }

  // 学习记录查询参数
  interface StudyRecordSearchParams extends SearchParams {
    is_correct?: number;
    start_date?: number;
    end_date?: number;
  }

  // 错题查询参数
  interface WrongQuestionQueryParams {
    mastered?: number;
  }

  // 兼容旧的Manager页面导入
  interface User {
    id: string;
    username: string;
    nickname?: string;
    avatar?: string;
    phone?: string;
    email?: string;
    status: number;
    created_at?: string;
    updated_at?: string;
  }

  interface UserCreateSchema {
    username: string;
    password: string;
    nickname?: string;
    phone?: string;
    email?: string;
  }

  interface UserUpdateSchema {
    nickname?: string;
    phone?: string;
    email?: string;
  }
}

export {};
