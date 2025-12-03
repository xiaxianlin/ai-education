/**
 * 统一的数据类型定义
 * 基于后端 server/core/schema.py 和 server/student/schema.py 定义
 * 确保前后端类型一致
 */

// ===== 基础类型 =====
declare global {
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
    subject: string; // 科目：数学/英语
    version: string; // 版本：人教版等
    grade: number; // 年级：1-12
    semester: string; // 学期：上学期/下学期/整学期
    file?: string; // PDF文件路径
    index_file_id?: string; // 索引文件ID
    is_parsed?: number; // 是否已解析：0-未解析, 1-已解析
    active?: number; // 是否激活（学生端）：1-激活, 0-未激活
  }

  /**
   * 单元信息（对应 UnitSchema）
   */
  interface Unit {
    id: number;
    textbook_id: number;
    name: string;
    content: string;
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
  }

  /**
   * 题目信息（对应 QuestionSchema）
   */
  interface Question {
    id: number;
    type: string; // 题目类型（主类型）
    subtype?: string; // 题目子类型
    subject: string; // 科目
    grade: number; // 年级
    content: string; // 题目内容
    options?: string; // 选项（多行文本）
    answer?: string; // 答案
    resource?: string; // 资源路径（图片/音频URL）
    difficulty?: string; // 难度
    resource_type?: "image" | "audio" | null; // 资源类型
    resource_content?: string; // 资源内容（录音文本等）
    textbook_id: number;
    unit_id?: number; // 单元ID
    knowledge?: string; // 知识点
    // 前端扩展字段
    is_correct?: boolean; // 是否答对（答题后）
    order?: number; // 题目顺序（练习会话中）
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
  type PracticeSessionType = "daily_practice" | "unit_practice" | "assessment";

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
    textbook?: Textbook; // 教材信息（可选）
  }

  // ===== 单元练习状态（字典类型） =====
  /**
   * 单元练习状态映射
   * key: unit_id (string)
   * value: PracticeSession | null
   */
  type UnitPracticeStatus = Record<string, PracticeSession | null>;

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
  }

  /**
   * 错题记录（对应 StudentWrongRecordSchema）
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
    analysis?: string; // 错题分析
    time_spent?: number;
    is_corrected: number; // 是否已订正：0-未订正, 1-已订正
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
   * 提交答案请求参数（对应 AnswerQuestionSchema）
   */
  interface SubmitAnswerParams {
    session_id: number;
    question_id: number;
    answer: string;
    time_spent: number; // 答题耗时（秒）
    is_audio_answer?: boolean; // 是否为音频回答（口语题）
    audio_data?: string; // 音频 OSS 存储路径
  }

  /**
   * 提交答案响应
   */
  interface SubmitAnswerResponse {
    is_correct: boolean;
    correct_answer: string;
    user_answer?: string; // 用户答案（可能是ASR识别后的文本）
    analysis?: string; // 错题分析（答错时返回）
    session_progress: {
      answer_count: number;
      correct_count: number;
      total_count: number; // 题目总数
      status: PracticeSessionStatus;
    };
  }

  /**
   * 上传录音结果（对应 UploadRecordingResultSchema）
   */
  interface UploadRecordingResult {
    oss_path: string; // OSS 存储路径
    transcription: string; // ASR 识别文本
  }

  /**
   * 开始练习响应
   */
  interface BeginPracticeResponse {
    session_id: number;
    status: PracticeSessionStatus;
    session_type: PracticeSessionType;
    target_id?: number;
    textbook_id?: number;
    question_count: number;
    answer_count: number;
    correct_count: number;
    generate_status?: number; // 生成状态：-1-生成失败, 0-生成中, 1-生成成功
    start_time: number;
    create_time: number;
  }

  /**
   * 完成练习响应
   */
  interface CompletePracticeResponse {
    report_id: number;
  }
}
export {};
