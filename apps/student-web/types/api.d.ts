declare global {
  /**
   * Celery 任务状态
   */
  type TaskStatus = "PENDING" | "STARTED" | "RETRY" | "FAILURE" | "SUCCESS" | "REVOKED";

  interface LoginRequest {
    phone: string;
    password: string;
  }

  interface Profile {
    student: Student;
    textbooks: Textbook[];
  }

  interface CreatePracticeRequest {
    type: "daily_practice" | "unit_practice" | "assessment";
    textbook_id: number;
    unit_id?: number;
  }

  interface AnswerRequest {
    session_id: number;
    question_id: number;
    answer: string;
    time_spent: number;
    is_audio_answer: boolean;
    audio_data?: string;
    audio_match?: boolean;
    audio_analysis?: string;
  }

  interface AnswerResponse {
    is_correct: boolean;
    correct_answer: string;
    user_answer: string;
    analysis?: string;
  }

  interface AudioAnswerAnalysisResponse {
    text: string;
    match: boolean;
    analysis: string;
  }
}

export {};
