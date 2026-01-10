declare global {
  /**
   * 练习会话
   */
  interface Practice {
    id: string;
    student_id: string;
    practice_type: string;
    subject: string | null;
    grade: number | null;
    ability_code: string | null;
    unit_id: number | null;
    question_count: number;
    answer_count: number;
    correct_count: number;
    status: number; // 0-未开始, 1-进行中, 2-已完成, 3-已废弃
    generate_status: number; // 0-生成中, 1-已完成, -1-生成失败
    generate_time: number | null;
    start_time: number;
    end_time: number | null;
    create_time: number;
    update_time: number | null;
    student?: Student;
  }

  /**
   * 练习答题记录
   */
  interface PracticeAnswer {
    id: number;
    session_id: string;
    question_id: string;
    student_id: string;
    question_order: number;
    text_answer: string | null;
    status: number; // 0-未答 1-正确 2-错误
    time_spent: number;
    submit_time: number | null;
    correct_answer: string | null;
    analysis: string | null;
    is_corrected: number;
    corrected_time: number | null;
    create_time: number;
    update_time: number | null;
    question?: Question;
  }

  /**
   * 练习报告
   */
  interface PracticeReport {
    id: number;
    session_id: string;
    student_id: string;
    total_questions: number;
    correct_questions: number;
    total_time: number;
    overall_score: number;
    current_ability: number;
    confidence: number;
    ability_level: string;
    percentile: number;
    knowledge_scores: string;
    question_distribution: string;
    ability_breakdown: string;
    learning_speed: number;
    consistency: number;
    strengths: string;
    weaknesses: string;
    recommendations: string;
    create_time: number;
  }

  /**
   * 练习详情数据
   */
  interface PracticeData {
    session: Practice;
    questions: Question[];
    answers: PracticeAnswer[];
    report: PracticeReport | null;
  }

  /**
   * 搜索练习请求
   */
  interface SearchPracticeRequest extends SearchRequest {
    practice_type?: string;
    status?: number;
    student_id?: string;
  }

  /**
   * 练习状态枚举
   */
  type PracticeStatus = 0 | 1 | 2 | 3;

  /**
   * 练习生成状态枚举
   */
  type PracticeGenerateStatus = -1 | 0 | 1;
}

export {};
