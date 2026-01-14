import {
  AnswerType as _AnswerType,
  CognitiveLevel as _CognitiveLevel,
  Difficulty as _Difficulty,
  InteractionType as _InteractionType,
  ManagerType as _ManagerType,
  PracticeGenerateStatus as _PracticeGenerateStatus,
  PracticeStatus as _PracticeStatus,
  ResourceType as _ResourceType,
  Stage as _Stage,
} from "../constants";

declare global {
  type AnswerType = _AnswerType;
  type CognitiveLevel = _CognitiveLevel;
  type Difficulty = _Difficulty;
  type InteractionType = _InteractionType;
  type ManagerType = _ManagerType;
  type PracticeGenerateStatus = _PracticeGenerateStatus;
  type PracticeStatus = _PracticeStatus;
  type ResourceType = _ResourceType;
  type Stage = _Stage;

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
   * 教材版本信息（对应 TextbookVersionSchema）
   */
  interface TextbookVersion {
    id: number;
    subject: string;
    name: string;
    revision_year: number;
    is_enabled: number;
    create_time?: number;
    update_time?: number;
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
   */
  interface QuestionType {
    id: number;
    code: string;
    name: string;
    description?: string;
    subject: string;
    stages: Stage[];
    grades: number[];
    interaction_type: InteractionType;
    interaction_config?: Record<string, unknown>;
    resource_type: ResourceType;
    resource_config?: Record<string, unknown>;
    answer_type: AnswerType;
    answer_config?: Record<string, unknown>;
    feedback_config?: FeedbackConfig;
    cognitive_levels?: CognitiveLevel[];
    ability_atomic_codes?: string[]; // 关联的能力代码列表
    difficulty?: Difficulty;
    ai_prompt?: string;
    output_schema?: Record<string, unknown>;
    sort_order: number;
    is_active: boolean;
    create_time: number;
    update_time: number;
  }

  // ================ 基础结构 ================

  /** 答案（对应 AnswerSchema） */
  interface Answer {
    type: AnswerType;
    correct_answers?: string[];
    accept_answers?: string[];
    scoring?: Record<string, number>;
    rubric?: Record<string, unknown>;
  }

  /** 选项（对应 OptionSchema） */
  interface QuestionOption {
    id: string;
    text?: string;
    image_url?: string;
    audio_url?: string;
    is_correct: boolean;
    feedback?: string;
  }

  /** 资源（对应 ResourceSchema） */
  interface QuestionResource {
    id: string;
    type: string; // 资源类型：none/image/audio/video/animation
    url: string;
    alt?: string;
    position: "stem" | "option" | "background"; // 向后兼容字段
    resource_type?: "stem" | "option"; // 资源归属类型：'stem'（题干资源）/'option'（选项资源），向后兼容时可能不存在
    option_id?: string; // 关联的选项ID（当 resource_type='option' 时必填）
    size?: Record<string, number>; // 尺寸，如 { width: number, height: number }
    style?: Record<string, unknown>;
    duration?: number;
    transcript?: string;
  }

  /** 子题题干（简化版，对应 SubStemSchema） */
  interface SubStem {
    text: string;
    rich_text?: string;
    hints?: string[];
  }

  /** 子题结构 - 用于复合题/应用题（对应 SubQuestionSchema） */
  interface SubQuestion {
    id: string;
    order: number;
    stem: SubStem | string; // 对应 SubStemSchema，但后端使用 Dict[str, Any]
    interaction_type: InteractionType;
    interaction_config?: Record<string, unknown>;
    options?: Array<Record<string, unknown>>; // 对应 OptionSchema[]，但后端使用 List[Dict[str, Any]]
    resources?: QuestionResource[]; // 对应 ResourceSchema[]，但后端使用 List[Dict[str, Any]]
    answer: Record<string, unknown>; // 对应 AnswerSchema，但后端使用 Dict[str, Any]
    explanation?: string;
  }

  /** 题干（对应 StemSchema） */
  interface Stem {
    text: string;
    rich_text?: string;
    audio_url?: string;
    highlight_words?: string[];
    hints?: string[];
    sub_questions?: Array<Record<string, unknown>>; // 对应 SubQuestionSchema[]，但后端使用 List[Dict[str, Any]]
  }

  /** 反馈项（对应 FeedbackItemSchema） */
  interface FeedbackItem {
    sound?: string;
    animation?: string;
    messages?: string[];
    points?: number;
    show_hint?: boolean;
    max_attempts?: number;
  }

  /** 反馈配置（对应 FeedbackConfigSchema） */
  interface FeedbackConfig {
    correct?: Record<string, unknown>; // 对应 FeedbackItemSchema，但后端使用 Dict[str, Any]
    incorrect?: Record<string, unknown>; // 对应 FeedbackItemSchema，但后端使用 Dict[str, Any]
    partial?: Record<string, unknown>; // 对应 FeedbackItemSchema，但后端使用 Dict[str, Any]
  }

  /**
   * 题目信息（对应 QuestionSchema）
   */
  interface Question {
    id: string;
    question_type_id: number;
    question_type_code: string;
    subject: string;
    grade: number;
    stage: Stage;
    stem: Stem;
    options?: QuestionOption[];
    blanks?: Array<Record<string, unknown>>;
    resources?: QuestionResource[];
    answer: Answer;
    explanation?: string;
    difficulty: Difficulty;
    cognitive_level?: CognitiveLevel;
    ability_tags?: string[];
    source: string;
    usage_count: number;
    correct_rate?: string;
    avg_time_spent?: number;
    is_active: boolean;
    create_time: number;
    update_time: number;
    // 关联关系
    question_type?: QuestionType;
    // 前端扩展字段
    is_correct?: boolean; // 是否答对（答题后）
    order?: number; // 题目顺序（练习会话中）
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
    status: number; // 0-正常, 1-禁用
    create_time: number;
    update_time?: number;
  }

  /**
   * 学生教材配置（对应 StudentTextbookConfigSchema）
   */
  interface StudentTextbookConfig {
    id: number;
    student_id: string;
    textbook_id: number;
    textbook?: Textbook; // 关联的教材信息
    create_time: number;
    update_time: number;
  }

  /**
   * 保存学生教材配置请求
   */
  interface SaveStudentTextbookConfigRequest {
    textbook_id: number;
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
    status: PracticeStatus; // 练习状态: 0-未开始, 1-进行中, 2-已完成, 3-已废弃
    generate_status: PracticeGenerateStatus; // 生成状态: 0-生成中, 1-已完成, -1-生成失败
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

export {};
