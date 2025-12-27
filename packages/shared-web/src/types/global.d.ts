import {
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
   * 题型实体
   */
  interface QuestionType {
    id: number;
    code: string;
    name: string;
    description?: string;
    subject: string;
    stages: Stage[];
    grades: number[];
    interactionType: InteractionType;
    interactionConfig?: Record<string, unknown>;
    resourceType: ResourceType;
    resourceConfig?: Record<string, unknown>;
    answerType: AnswerType;
    answerConfig?: Record<string, unknown>;
    feedbackConfig?: FeedbackConfig;
    cognitiveLevels?: CognitiveLevel[];
    abilityDimensions?: string[];
    aiPrompt?: string;
    sortOrder: number;
    isActive: boolean;
    createTime: number;
    updateTime: number;
  }

  // ================ 基础结构 ================

  /** 答案 */
  interface Answer {
    type: AnswerType;
    correctAnswers?: string[];
    acceptAnswers?: string[];
    scoring?: {
      fullScore: number;
      partialScores?: Record<string, number>;
      partialStrategy?: "sum" | "all_or_nothing";
      subScores?: Record<string, number>;
    };
    rubric?: Record<string, { weight: number; criteria: string }>;
  }

  /** 选项 */
  interface QuestionOption {
    id: string;
    text?: string;
    imageUrl?: string;
    audioUrl?: string;
    isCorrect: boolean;
    feedback?: string;
  }

  /** 资源 */
  interface QuestionResource {
    id: string;
    type: ResourceType;
    url: string;
    alt?: string;
    position: "stem" | "option" | "background";
    size?: { width: number; height: number };
    style?: Record<string, unknown>;
    duration?: number;
    transcript?: string;
  }

  /** 子题题干（简化版） */
  interface SubStem {
    text: string;
    richText?: string;
    hints?: string[];
  }

  /** 子题结构 - 用于复合题/应用题 */
  interface SubQuestion {
    id: string;
    order: number;
    stem: SubStem;
    interactionType: InteractionType;
    interactionConfig?: Record<string, unknown>;
    options?: QuestionOption[];
    resources?: QuestionResource[];
    answer: Answer;
    explanation?: string;
  }

  /** 题干 */
  interface Stem {
    text: string;
    richText?: string;
    audioUrl?: string;
    highlightWords?: string[];
    hints?: string[];
    subQuestions?: SubQuestion[];
  }

  /** 反馈项 */
  interface FeedbackItem {
    sound?: string;
    animation?: string;
    messages?: string[];
    points?: number;
    showHint?: boolean;
    maxAttempts?: number;
  }

  /** 反馈配置 */
  interface FeedbackConfig {
    correct?: FeedbackItem;
    incorrect?: FeedbackItem;
    partial?: FeedbackItem;
  }

  /**
   * 题目信息
   */
  interface Question {
    id: string;
    questionTypeId: number;
    questionTypeCode: string;
    subject: string;
    grade: number;
    stage: Stage;
    textbookId?: number;
    unitId?: number;
    stem: Stem;
    options?: QuestionOption[];
    blanks?: Array<Record<string, unknown>>;
    resources?: QuestionResource[];
    answer: Answer;
    explanation?: string;
    difficulty: Difficulty;
    cognitiveLevel?: CognitiveLevel;
    knowledgePoints?: string[];
    abilityTags?: string[];
    source: string;
    usageCount: number;
    correctRate?: string;
    avgTimeSpent?: number;
    isActive: boolean;
    createTime: number;
    updateTime: number;
    // 前端扩展字段
    is_correct?: boolean; // 是否答对（答题后）
    order?: number; // 题目顺序（练习会话中）
    textbook?: Textbook;
    unit?: Unit;
  }

  // ============ 题目模板 ============

  /** 题目模板 */
  interface QuestionTemplate {
    id: number;
    name: string;
    questionTypeId: number;
    description?: string;
    systemPrompt?: string;
    userPromptTemplate?: string;
    variables?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    isActive: boolean;
    createTime: number;
    updateTime: number;
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
    type: PracticeType;
    parameters?: PracticeParameter[];
    create_time: number;
    update_time: number;
  }

  /**
   * 练习提示词关联实体
   */
  interface PracticePrompt {
    id: number;
    subject: string;
    grade: number;
    practice_slug: string;
    prompt_slug: string;
    create_time: number;
    update_time: number;

    practice?: Practice;
    prompt?: Prompt;
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
   * 练习会话
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
    status: PracticeSessionStatus; // 会话状态: 0-未开始, 1-进行中, 2-已完成
    generate_status: PracticeGenerateStatus; // 生成状态: 0-失败, 1-生成中, 2-成功
    start_time: number; // 开始时间（Unix时间戳，秒）
    end_time?: number; // 结束时间（Unix时间戳，秒）
    create_time: number; // 创建时间（Unix时间戳，秒）
    update_time?: number; // 更新时间（Unix时间戳，秒）

    textbook_id?: number; // 教材ID
    unit_id?: number; // 单元ID
  }

  /**
   * 答题记录
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

export {};
