declare global {
  /**
   * 登录请求参数（对应 LoginSchema）
   */
  interface LoginParams {
    phone: string;
    password: string;
  }
  /**
   * 提交答案请求参数（对应 AnswerQuestionSchema）
   */
  interface AnswerParams {
    session_id: number;
    question_id: number;
    answer: string;
    time_spent?: number;
    is_audio_answer?: boolean;
    audio_data?: string; // 音频 OSS 存储路径
  }

  /**
   * 提交答案响应
   */
  interface AnswerResponse {
    is_correct: boolean;
    correct_answer: string;
    user_answer: string;
    analysis?: string;
  }

  /**
   * 获取练习会话详情响应
   */
  interface PracticeSessionDetail {
    session: PracticeSession;
    questions: Question[];
    answers: PracticeAnswer[];
    report: PracticeReport;
  }

  /**
   * 完成练习响应
   */
  interface CompletePracticeResponse {
    report_id: number;
  }
}
export {};
