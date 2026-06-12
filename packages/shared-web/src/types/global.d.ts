import { ManagerType as _ManagerType, PracticeType as _PracticeType } from "../constants";

declare global {
  type ManagerType = _ManagerType;
  type PracticeType = _PracticeType;

  // ================ API 响应类型 ================

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
  }

  /**
   * 分页列表数据
   */
  interface SearchResponse<T> {
    data?: T[];
    total?: number;
  }

  // ================ 基础类型 ================

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
   * 教材信息（对应 TextbookSchema）
   */
  interface Textbook {
    id: number;
    teacher_id?: string;
    teacher_name?: string;
    subject: string;
    version: string;
    grade: number;
    semester: string;
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
   * 原子能力信息（对应 AbilityAtomicSchema）
   */
  /**
   * 能力信息（对应 AbilitySchema）
   */
  interface Ability {
    id: number;
    subject: string;
    grade: number;
    code: string;
    name: string;
    description?: string;
    difficulty: number; // 1-5
    is_active: number;
    create_time: number;
    update_time: number;
  }

  /**
   * 题型实体（对应 QuestionTypeSchema）
   * 字段名称与后端 QuestionTypeSchema 对齐
   */
  interface QuestionType {
    id: number;
    code: string;
    name: string;
    description?: string;
    category: PracticeType;
    subject?: string;
    ability_code?: string;
    configs?: Record<string, unknown>;
    create_time: number;
    update_time: number;
    ability?: Ability;
  }

  // ================ 基础结构 ================

  /** 评价量表项（对应 RubricSchema） */
  interface Rubric {
    dimension: string;
    max_score: number;
    description?: string;
  }

  /** 答案（对应 QuestionAnswerSchema） */
  interface Answer {
    value: any; // 学生答案内容
    correct_value?: any; // 正确答案参考
    analysis_mode: string; // "objective" | "subjective"
    explanation?: string; // 答案解析
    rubrics?: Rubric[]; // 评分量表（主观题）
    configs?: Record<string, unknown>; // 其他配置项
  }

  /** 选项（对应 OptionSchema） */
  interface QuestionOption {
    id: string;
    text?: string;
    resource?: QuestionResource; // 选项资源
    is_correct?: boolean;
  }

  /** 资源（对应 ResourceSchema） */
  interface QuestionResource {
    type: string; // 资源类型：image, audio, video
    url: string;
    alt?: string;
  }

  /**
   * 题目内容结构（对应 QuestionContentSchema）
   */
  interface QuestionContent {
    stem: string; // 题干文本
    resource?: QuestionResource; // 题干资源
    options?: QuestionOption[]; // 选项列表
    sub_questions?: QuestionContent; // 子题列表（复合题，单个可选对象）
  }

  /**
   * 题目信息（对应 QuestionSchema）
   */
  interface Question {
    id: string;
    question_type_code: string;
    subject: string;
    grade: number;
    ability_code?: string;
    content: QuestionContent; // 题目内容（包含题干、选项、资源等）
    answer: Answer;
    explanation?: string;
    create_time: number;
    update_time: number;
    // 关联关系
    question_type?: QuestionType;
    // 前端扩展字段
    is_correct?: boolean; // 是否答对（答题后）
    order?: number; // 题目顺序（练习会话中）
    // TODO: 以下字段已删除，如需保留需要重新设计
    // stage: Stage;
    // difficulty: Difficulty;
    // cognitive_level?: CognitiveLevel;
    // ability_tags?: string[];
    // source: string;
    // usage_count: number;
    // correct_rate?: string;
    // avg_time_spent?: number;
    // is_active: boolean;
  }

  /**
   * 学生信息（对应 StudentSchema）
   */
  interface Student {
    id: string;
    name: string;
    phone: string;
    grade: number;
    semester?: string;
    subject?: string;
    teacher_id?: string;
    teacher?: {
      id: string;
      account: string;
      name: string;
      phone: string;
      subject: string;
      school: string;
      status: number;
    };
    status: number; // 0-正常, 1-禁用
    create_time: number;
    update_time?: number;
  }

  /**
   * 题型配置项
   */
  interface QuestionTypeConfigItem {
    question_type_id?: number;
    question_type_code: string;
    count: number;
    difficulty?: string;
    description?: string;
  }

  /**
   * 模板变量
   */
  interface TemplateVariable {
    key: string;
    name: string;
    type: "input" | "select" | "range" | "multiselect";
    required?: boolean;
    default_value?: any;
    options?: Array<{ value: string; label: string }>;
    options_source?: "units" | "textbooks" | "custom";
  }

  /**
   * 练习（对应 PracticeSchema）
   */
  interface Practice {
    id: string; // UUID v4
    student_id: string;
    practice_type: string; // 练习类型: ability_practice/unit_practice
    subject?: string; // 科目
    grade?: number; // 年级
    ability_code?: string; // 原子能力代码（能力练习）
    ability_name?: string; // 原子能力名称（能力练习）
    ability_codes?: string[]; // 原子能力代码列表
    unit_id?: number; // 单元ID（单元练习）
    unit_name?: string; // 单元名称（单元练习）
    question_count: number; // 题目总数
    answer_count: number; // 已答题数
    correct_count: number; // 正确数
    status: number; // 练习状态: 0-未开始, 1-进行中, 2-已完成, 3-已废弃
    generate_status: number; // 生成状态: 0-生成中, 1-已完成, -1-生成失败
    generate_time?: number; // 生成耗时（秒）
    start_time: number; // 开始时间（Unix时间戳，秒）
    end_time?: number; // 结束时间（Unix时间戳，秒）
    create_time: number; // 创建时间（Unix时间戳，秒）
    update_time?: number; // 更新时间（Unix时间戳，秒）
  }

  /**
   * 结构化正确答案
   * 用于前端根据题型渲染正确答案
   */
  interface CorrectAnswerData {
    type: string; // 与 interaction_type 对应
    value?: unknown; // 单值答案（单选题等）
    values?: unknown[]; // 多值答案（多选题等）
    options?: Array<{ id: string; text: string }>; // 选项详情
    sub_answers?: Array<{
      sub_id: string;
      is_correct: boolean;
      value: unknown;
    }>; // 复合题子答案
  }

  /**
   * 答题反馈数据
   * 错题时返回的完整反馈信息
   */
  interface AnswerFeedbackData {
    correct_answer: CorrectAnswerData; // 结构化正确答案
    explanation?: string; // 题目自带解析
    analysis?: string; // AI 针对性分析
  }

  /**
   * 答题记录（对应 PracticeAnswerSchema）
   */
  interface PracticeAnswer {
    id: number;
    session_id: string; // UUID v4
    question_id: string;
    student_id: string;
    question_order: number; // 题目顺序

    // 题目相关信息（冗余存储）
    unit_id?: number;
    textbook_id?: number;

    // 答题信息
    answer?: string | any; // 学生答案（JSON格式，支持字符串、数组、对象）
    audio_url?: string; // 音频答案URL
    status: number; // 答题状态: 0-未答, 1-正确, 2-错误
    time_spent: number; // 耗时（秒）
    submit_time?: number; // 提交时间

    // 错题相关字段（仅当 status=2 时有值）
    // 新格式：结构化对象 { type, value, values, options, sub_answers }
    // 旧格式（兼容）：字符串
    correct_answer?: CorrectAnswerData | string;
    // 新格式：结构化对象 { correct_answer, explanation, analysis }
    // 旧格式（兼容）：字符串
    analysis?: AnswerFeedbackData | string;
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
    session_id: string; // UUID v4
    student_id: string;
    total_questions: number;
    correct_questions: number;
    total_time: number; // 总耗时（秒）
    overall_score: number; // 总得分
    current_ability?: number; // 当前能力值（-3到+3，主要用于assessment）
    confidence?: number; // 置信度
    ability_level?: string; // 能力等级
    percentile?: number; // 百分位排名
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
   * 练习数据
   */
  interface PracticeData {
    session: Practice;
    answers: PracticeAnswer[];
    questions: Question[];
    report?: PracticeReport;
  }

  /**
   * 练习统计数据
   */
  interface PracticeStatistics {
    total_practices: number; // 总练习数
    total_questions: number; // 总做题数
    completed_unit_practices: number; // 完成的单元练习数
    completed_ability_practices: number; // 完成的能力练习数
    total_accuracy: number; // 总正确率（百分比）
    average_accuracy: number; // 平均正确率（百分比）
  }

  /**
   * 练习统计响应
   */
  interface PracticeStatisticsResponse {
    all_time: PracticeStatistics; // 全部时间统计数据
    recent_30_days: PracticeStatistics; // 最近30天统计数据
  }

  /**
   * 能力掌握度概览（对应 MasterySummarySchema）
   */
  interface MasterySummary {
    total_abilities: number; // 总能力数
    practiced_abilities: number; // 已练习能力数
    avg_mastery_score: number; // 平均掌握度
    level_distribution: {
      unlearned?: number; // 未掌握数量
      beginner?: number; // 初步掌握数量
      proficient?: number; // 基本掌握数量
      mastered?: number; // 熟练掌握数量
    }; // 等级分布
  }

  /**
   * 提示词实体
   */
  interface Prompt {
    id: number;
    name: string;
    slug: string;
    type: string;
    description?: string;
    template_content: string;
    negative_content?: string;
    model_params?: Record<string, any>;
    create_time: number;
    update_time?: number;
  }

  /**
   * 提示词详情实体
   */
  interface PromptDetail {
    id: number;
    name: string;
    slug: string;
    type: string;
    description?: string;
    template_content: string;
    negative_content?: string;
    model_params: Record<string, any>;
    create_time: number;
    update_time?: number;
  }
}

export { };
