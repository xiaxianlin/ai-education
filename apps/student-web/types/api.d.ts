declare global {
  /**
   * Celery 任务状态
   */
  type TaskStatus = "PENDING" | "STARTED" | "RETRY" | "FAILURE" | "SUCCESS" | "REVOKED";

  type AnswerStatus = 0 | 1 | 2;

  /**
   * 练习会话类型（对应后端 PracticeType 枚举）
   */
  type PracticeSessionType = "daily_practice" | "unit_practice" | "assessment";

  interface LoginRequest {
    phone: string;
    password: string;
  }

  interface Profile {
    student: Student;
    textbooks: Textbook[];
  }

  interface CreatePracticeRequest {
    type?: PracticeSessionType;  // 兼容旧逻辑
    practice_id?: number;  // 优先使用
    textbook_id: number;
    unit_id?: number;
  }

  interface Practice {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    type: 'system' | 'custom';
    practice_type?: 'daily_practice' | 'unit_practice' | 'assessment';
    config: {
      default?: { generate_count?: number; recall_count?: number };
      grade_specific?: Record<string, { generate_count?: number; recall_count?: number }>;
    };
    create_time: number;
    update_time: number;
  }

  interface AnswerRequest {
    session_id: number;
    question_id: string;
    answer: string;
    time_spent: number;
    is_audio_answer: boolean;
    audio_match?: boolean;
    audio_analysis?: string;
  }

  interface AudioAnswerAnalysisResponse {
    text: string;
    match: boolean;
    analysis: string;
  }
}

export { };

