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
    type?: PracticeSessionType; // 兼容旧逻辑
    practice_id?: number; // 优先使用
    textbook_id: number;
    unit_id?: number;
    ability_codes?: string[]; // 原子能力 code 列表（能力练习必填）
    subject?: string; // 科目（能力练习必填）
    grade?: number; // 年级（能力练习必填）
  }


  interface AnswerRequest {
    session_id: string; // UUID v4
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

