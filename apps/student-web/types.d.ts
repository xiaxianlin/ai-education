/**
 * 全局类型声明
 * 引用 shared-web 的统一类型，使类型全局可用
 */
import "@ai-education/shared-web/types";

declare global {
  interface LoginRequest {
    phone: string;
    password: string;
  }

  interface Profile {
    name: string;
    phone: string;
    grade: number;
    semester?: string;
    subject?: string;

    textbooks: Textbook[];
  }

  interface UpdateStudentSettingsRequest {
    grade: number;
    semester: string;
    subject: string;
  }

  interface CreatePracticeRequest {
    type: PracticeType;
    unit_id?: number;
    ability_code?: string;
    subject?: string;
    grade?: number;
  }

  interface AnswerRequest {
    session_id: string;
    question_id: string;
    answer: string | any; // 学生答案（支持字符串、数组、对象）
    time_spent: number;
    audio_url?: string; // 音频答案URL
  }

  interface AudioAnswerAnalysisResponse {
    text: string;
    match: boolean;
    analysis: string;
  }
}

export {};
