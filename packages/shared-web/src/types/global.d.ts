declare global {
  /**
   * API 响应类型
   */
  interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status?: number;
  }

  /**
   * 搜索参数
   */
  interface SearchRequest {
    page?: number;
    size?: number;
    sort?: string;
    order?: string;
    keywords?: string;
  }

  /**
   * 分页列表数据
   */
  interface SearchResponse<T> {
    data?: T[];
    total?: number;
  }

  type ManagerType = 0 | 1 | 2; // 0-系统管理员, 1-超级管理员, 2-普通管理员

  /**
   * 管理员信息（对应 ManagerSchema）
   */
  interface Manager {
    id: string;
    username: string;
    type: ManagerType;
    status: number; // 0-停用, 1-启用
    create_time: number;
    update_time?: number;
  }

  /**
   * 学生信息（对应 StudentSchema）
   */
  interface Student {
    id: string;
    name: string;
    phone: string;
    grade: number;
    status: number; // 0-正常, 1-禁用
    create_time: number;
    update_time?: number;
  }

  /**
   * 教材信息（对应 TextbookSchema）
   */
  interface Textbook {
    id: number;
    subject: string;
    version: string;
    grade: number;
    semester: string;
    file?: string;
    index_file_id?: string;
    is_parsed?: number; // 0-未解析, 1-已解析
  }

  /**
   * 教师用书信息（对应 TeacherBookSchema）
   */
  interface TeacherBook {
    id: number;
    subject: string;
    version: string;
    grade: number;
    semester: string;
    file?: string;
    index_file_id?: string;
  }

  /**
   * 单元信息（对应 UnitSchema）
   */
  interface Unit {
    id: number;
    textbook_id: number;
    name: string;
    content: string;
    textbook?: Textbook;
  }

  /**
   * 知识点信息（对应 KnowledgeSchema）
   */
  interface Knowledge {
    id: number;
    textbook_id: number;
    unit_id: number;
    name: string;
    content: string;
    difficulty?: string; // 难度：简单/普通/困难
    importance?: number; // 重要性：1-10
    order?: number; // 排序值
    textbook?: Textbook;
    unit?: Unit;
  }

  /**
   * 题目信息（对应 QuestionSchema）
   */
  interface Question {
    id: string;
    type: QuestionType; // 题目类型（主类型）
    subtype?: string; // 题目子类型
    subject: string; // 科目
    grade: number; // 年级
    content: string; // 题目内容
    options?: string; // 选项（多行文本）
    answer?: string; // 答案
    resource?: string; // 资源路径（图片/音频URL）
    difficulty?: string; // 难度
    resource_type?: "image" | "audio" | string | null; // 资源类型
    resource_content?: string; // 资源内容（录音文本等）
    textbook_id?: number;
    unit_id?: number; // 单元ID
    knowledge?: string; // 知识点
    // 前端扩展字段
    is_correct?: boolean; // 是否答对（答题后）
    order?: number; // 题目顺序（练习会话中）
    textbook?: Textbook;
    unit?: Unit;
  }

  /**
   * 练习会话状态
   * 0: 未开始
   * 1: 进行中
   * 2: 已完成
   */
  type PracticeSessionStatus = 0 | 1 | 2;

  /**
   * 练习生成状态
   * -1: 生成失败
   * 0: 生成中
   * 1: 生成成功
   */
  type PracticeGenerateStatus = -1 | 0 | 1;

  /**
   * 练习类型
   */
  type PracticeType = "daily_practice" | "unit_practice" | "assessment";

  /**
   * 练习会话
   */
  interface PracticeSession {
    id: number;
    student_id: string;
    session_type: PracticeType;
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
   * 答题记录
   */
  interface PracticeAnswer {
    id: number;
    session_id: number;
    question_id: string;
    student_id: string;
    question_order: number; // 题目顺序

    // 题目相关信息（冗余存储）
    unit_id?: number;
    knowledge?: string;
    textbook_id?: number;

    // 答题信息
    text_answer?: string; // 文本答案/用户答案
    audio_answer?: string; // 音频答案（OSS 存储路径）
    status: number; // 答题状态: 0-未答, 1-正确, 2-错误
    time_spent: number; // 耗时（秒）
    submit_time?: number; // 提交时间

    // 错题相关字段（仅当 status=2 时有值）
    correct_answer?: string; // 正确答案
    analysis?: string; // 错题分析
    is_corrected?: number; // 是否已订正 0-未订正 1-已订正
    corrected_time?: number; // 订正时间

    // 时间字段
    create_time: number;
    update_time?: number;

    question?: Question;
  }

  /**
   * 练习报告
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
   * 练习会话详情
   */
  interface PracticeDetail {
    session: PracticeSession;
    answers: PracticeAnswer[];
    questions: Question[];
    report?: PracticeReport;
  }

  /**
   * 题型实体
   */
  interface QuestionType {
    id: number;
    title: string;
    scene: string;
    subject: string;
    grade: number;
    description?: string;
    resource_type?: string;
    prompt?: string;
    create_time: number;
    update_time: number;
  }
}
export {};
