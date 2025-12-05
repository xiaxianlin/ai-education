declare global {
  // ===== 学生相关类型 =====

  interface Student {
    id: string;
    name: string;
    phone: string;
    grade: number;
    status: number;
    create_time: number;
    update_time?: number;
  }

  interface StudentForm {
    name?: string;
    phone?: string;
    grade?: number;
    status?: number;
  }

  interface StudentSearchParams extends SearchParams {
    keyword?: string;
    status?: number;
  }

  interface ResetPasswordResponse {
    password: string;
  }

  // ===== 练习相关类型 =====

  /**
   * 练习会话状态
   * 0: 未开始
   * 1: 进行中
   * 2: 已完成
   */
  type PracticeSessionStatus = 0 | 1 | 2;

  /** 练习生成状态
   * -1: 生成失败
   * 0: 生成中
   * 1: 生成成功
   */
  type PracticeGenerateStatus = -1 | 0 | 1;

  /**
   * 练习类型
   */
  type PracticeSessionType = 'daily_practice' | 'unit_practice' | 'assessment';

  /**
   * 练习会话（对应 PracticeSessionSchema）
   */
  interface PracticeSession {
    id: number;
    student_id: string;
    session_type: PracticeSessionType;
    target_id?: number; // 单元ID或日期（如 20241123）
    textbook_id?: number; // 教材ID
    question_count: number; // 题目总数
    answer_count: number; // 已答题数
    correct_count: number; // 正确数
    status: PracticeSessionStatus; // 会话状态：0-未开始, 1-进行中, 2-已完成
    generate_status: PracticeGenerateStatus; // 生成状态：-1-生成失败, 0-生成中, 1-生成成功
    start_time: number; // 开始时间（Unix时间戳，秒）
    end_time?: number; // 结束时间（Unix时间戳，秒）
    create_time: number; // 创建时间（Unix时间戳，秒）
    update_time?: number; // 更新时间（Unix时间戳，秒）

    textbook?: Textbook;
  }

  /**
   * 答题记录（对应 PracticeAnswerSchema）
   */
  interface PracticeAnswer {
    id: number;
    session_id: number;
    question_id: number;
    question_order: number; // 题目顺序
    text_answer?: string; // 文本答案
    status: number; // 答题状态: 0-未答, 1-正确, 2-错误
    time_spent: number; // 耗时（秒）
    submit_time?: number; // 提交时间
    audio_answer?: string; // 音频答案（OSS 存储路径）

    question?: Question;
  }

  /**
   * 错题记录（对应 PracticeWrongRecordSchema）
   */
  interface PracticeWrongRecord {
    id: number;
    student_id: string;
    question_id: number;
    session_id: number;
    unit_id?: number;
    knowledge?: string;
    textbook_id?: number;
    user_answer?: string;
    correct_answer?: string;
    analysis?: string;
    time_spent: number;
    is_corrected: number;
    corrected_time: number;
    create_time: number;
    update_time: number;
  }

  /**
   * 练习报告（对应 PracticeReportSchema）
   */
  interface PracticeReport {
    id: number;
    session_id: number;
    student_id: string;
    total_questions: number;
    correct_questions: number;
    total_time: number; // 总耗时（秒）
    overall_score: number; // 总得分
    current_ability?: number; // 当前能力值（-3到+3，主要用于assessment）
    confidence?: number; // 置信度
    ability_level?: string; // 能力等级
    percentile?: number; // 百分位排名
    knowledge_scores?: string; // 知识点掌握情况（JSON字符串）
    question_distribution?: string; // 题目来源分布（JSON字符串）
    ability_breakdown?: string; // 能力分解（JSON字符串）
    learning_speed?: number; // 学习速度
    consistency?: number; // 稳定性
    strengths?: string; // 优势（JSON数组字符串）
    weaknesses?: string; // 薄弱点（JSON数组字符串）
    recommendations?: string; // 学习建议（JSON数组字符串）
    create_time: number;
  }

  /**
   * 练习会话详情（对应 PracticeDetailSchema）
   */
  interface PracticeDetail {
    session: PracticeSession;
    answers: PracticeAnswer[];
    report?: PracticeReport;
    wrong_records: PracticeWrongRecord[];
  }
}

export {};
