import {
  AbilityType as _AbilityType,
  AnswerType as _AnswerType,
  CognitiveLevel as _CognitiveLevel,
  Difficulty as _Difficulty,
  InteractionType as _InteractionType,
  ManagerType as _ManagerType,
  PracticeGenerateStatus as _PracticeGenerateStatus,
  PracticeParameterType as _PracticeParameterType,
  PracticeParameterValueType as _PracticeParameterValueType,
  PracticeSessionStatus as _PracticeSessionStatus,
  PracticeType as _PracticeType,
  ResourceType as _ResourceType,
  Stage as _Stage,
} from "../constants";

declare global {
  type AbilityType = _AbilityType;
  type AnswerType = _AnswerType;
  type CognitiveLevel = _CognitiveLevel;
  type Difficulty = _Difficulty;
  type InteractionType = _InteractionType;
  type ManagerType = _ManagerType;
  type PracticeGenerateStatus = _PracticeGenerateStatus;
  type PracticeParameterType = _PracticeParameterType;
  type PracticeParameterValueType = _PracticeParameterValueType;
  type PracticeSessionStatus = _PracticeSessionStatus;
  type PracticeType = _PracticeType;
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
   * 能力域信息（对应 AbilityDomainSchema）
   */
  interface AbilityDomain {
    id: number;
    subject: string;
    code: string;
    name: string;
    description?: string;
    sort_order: number;
    is_active: number;
    create_time: number;
    update_time: number;
  }

  /**
   * 原子能力信息（对应 AbilityAtomicSchema）
   */
  interface AbilityAtomic {
    id: number;
    subject: string;
    grade: number;
    domain_code: string;
    code: string;
    name: string;
    description?: string;
    difficulty: number; // 1-5
    sort_order: number;
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
    ability_dimensions?: string[];
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
    scoring?: Record<string, unknown>;
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
    stem: Record<string, unknown>; // 对应 SubStemSchema，但后端使用 Dict[str, Any]
    interaction_type: InteractionType;
    interaction_config?: Record<string, unknown>;
    options?: Array<Record<string, unknown>>; // 对应 OptionSchema[]，但后端使用 List[Dict[str, Any]]
    resources?: Array<Record<string, unknown>>; // 对应 ResourceSchema[]，但后端使用 List[Dict[str, Any]]
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
    knowledge_points?: string[];
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
    status: number; // 0-正常, 1-禁用
    create_time: number;
    update_time?: number;
  }

  /**
   * 练习实体
   */
  interface Practice {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    // 专项类型（使用能力类型）
    specialty_type?: AbilityType | string;
    // 适用范围
    subject?: string;
    stages?: Stage[];
    grades?: number[];
    // 配置
    question_count_config?: QuestionCountConfig;
    difficulty_config?: DifficultyConfig;
    ability_config?: AbilityConfig;
    feedback_config?: PracticeFeedbackConfig;
    prompt?: string;
    // 参数配置
    parameter_config?: PracticeParameter[];
    // 元数据
    is_active?: boolean;
    create_time: number;
    update_time: number;
  }

  /**
   * 题量配置
   */
  interface QuestionCountConfig {
    total?: number;
    per_group?: number;
    max_groups?: number;
    time_limit_minutes?: number;
  }

  /**
   * 难度配置
   */
  interface DifficultyConfig {
    level?: string;
    target_accuracy?: number;
    distribution?: {
      easy?: number;
      medium?: number;
      hard?: number;
    };
  }

  /**
   * 能力配置
   */
  interface AbilityConfig {
    cognitive_levels?: CognitiveLevel[];
    distribution?: { key: string; value: number }[];
  }

  /**
   * 反馈配置（练习）
   */
  interface PracticeFeedbackConfig {
    instant_feedback?: boolean;
    show_explanation?: boolean;
    gamification?: {
      enable_points?: boolean;
      enable_badges?: boolean;
      enable_progress?: boolean;
    };
    encouragement_messages?: string[];
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
    options_source?: "units" | "textbooks" | "knowledge_points" | "custom";
  }

  /**
   * 练习参数配置
   */
  interface PracticeParameter {
    key: string;
    type: PracticeParameterType;
    required: boolean;
    description: string;
    value_type: PracticeParameterValueType;
    value?: any;
  }

  /**
   * 练习会话（对应 PracticeSessionSchema）
   */
  interface PracticeSession {
    id: number;
    student_id: string;
    practice_id?: number; // 练习ID
    practice_slug?: string; // 练习slug
    parameters?: Record<string, any>; // 练习参数
    question_count: number; // 题目总数
    answer_count: number; // 已答题数
    correct_count: number; // 正确数
    status: PracticeSessionStatus; // 会话状态: 0-未开始, 1-进行中, 2-已完成, 3-已废弃
    generate_status: PracticeGenerateStatus; // 生成状态: 0-未生成, 1-生成中, 2-已生成
    generate_time?: number; // 生成时间（Unix时间戳，秒）
    start_time: number; // 开始时间（Unix时间戳，秒）
    end_time?: number; // 结束时间（Unix时间戳，秒）
    create_time: number; // 创建时间（Unix时间戳，秒）
    update_time?: number; // 更新时间（Unix时间戳，秒）

    textbook_id?: number; // 教材ID
    unit_id?: number; // 单元ID
  }

  /**
   * 答题记录（对应 PracticeSessionAnswerSchema）
   */
  interface PracticeSessionAnswer {
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
   * 练习会话报告
   */
  interface PracticeSessionReport {
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
   * 练习会话数据
   */
  interface PracticeSessionData {
    practice: Practice;
    session: PracticeSession;
    answers: PracticeSessionAnswer[];
    questions: Question[];
    report?: PracticeSessionReport;
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

