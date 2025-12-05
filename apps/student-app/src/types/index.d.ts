// 类型定义文件，从 shared-frontend 包导入类型
// 这些类型应该从 @ai-education/shared-frontend 包中导入

// 临时类型定义，实际应该从 shared-frontend 导入
declare global {
  interface Student {
    id: number;
    name: string;
    phone: string;
    grade: number;
  }

  interface Textbook {
    id: number;
    name: string;
    subject: string;
    grade: number;
    semester: string;
    textbook_id?: number;
  }

  interface Unit {
    id: number;
    name: string;
    textbook_id: number;
  }

  interface Question {
    id: number;
    content: string;
    type: string;
    options?: string[];
    difficulty?: string;
    knowledge?: string;
    resource?: string;
    resource_type?: string;
  }

  interface PracticeSession {
    id: number;
    session_type: string;
    status: number;
    question_count: number;
    answer_count: number;
    correct_count: number;
    total_time?: number;
  }

  interface PracticeAnswer {
    question_id: number;
    text_answer?: string;
    audio_answer?: string;
    status?: number;
  }

  interface PracticeReport {
    total_score: number;
  }

  interface Profile {
    student: Student;
    textbooks: Textbook[];
  }

  interface Knowledge {
    id: number;
    name: string;
  }

  interface UploadRecordingResult {
    transcript?: string;
    analysis?: any;
  }

  interface SubmitAnswerResponse {
    is_correct: boolean;
    session_progress?: {
      answer_count: number;
      correct_count: number;
      status: number;
    };
  }

  interface ApiData<T = any> {
    status: number;
    message?: string;
    data: T;
  }

  interface LoginParams {
    phone: string;
    password: string;
  }
}

export {};

