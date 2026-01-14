declare global {
  /**
   * 搜索题型请求
   * 字段名称与后端 QuestionTypeSearchSchema 对齐（使用下划线命名）
   */
  interface QuestionTypeSearchRequest extends SearchRequest {
    subject?: string;
    grade?: number; // 后端使用 grade (单数，匹配适用年级列表)
    interaction_type?: InteractionType; // 后端使用 interaction_type
    page?: number;
    size?: number; // 后端使用 size
  }

  /**
   * 搜索题目请求
   * 字段名称与后端 QuestionSearchSchema 对齐（使用下划线命名）
   */
  interface SearchQuestionRequest extends SearchRequest {
    id?: string; // 后端使用 id，题目ID（精确匹配）
    name?: string; // 后端使用 name，题目名称（题干文本，模糊匹配）
    question_type_id?: number; // 后端使用 question_type_id
    question_type_code?: string; // 后端使用 question_type_code
    subject?: string;
    grade?: number;
    stage?: Stage;
    difficulty?: Difficulty;
    cognitive_level?: CognitiveLevel; // 后端使用 cognitive_level
    source?: string;
    is_active?: boolean; // 后端使用 is_active
    keyword?: string; // 前端特有的关键词搜索（不在后端 schema 中）
    page?: number;
    size?: number; // 后端使用 size
  }

  /**
   * 创建题型请求
   * 字段名称与后端 QuestionTypeCreateSchema 对齐（使用下划线命名）
   */
  interface QuestionTypeCreateRequest {
    code: string;
    name: string;
    description?: string;
    subject: string;
    stages: Stage[];
    grades: number[];
    interaction_type: InteractionType; // 后端使用 interaction_type
    interaction_config?: Record<string, unknown>; // 后端使用 interaction_config
    resource_type?: ResourceType; // 后端使用 resource_type，默认值为 "text"
    resource_config?: Record<string, unknown>; // 后端使用 resource_config
    answer_type: AnswerType; // 后端使用 answer_type
    answer_config?: Record<string, unknown>; // 后端使用 answer_config
    feedback_config?: FeedbackConfig; // 后端使用 feedback_config
    cognitive_levels?: CognitiveLevel[]; // 后端使用 cognitive_levels
    ability_atomic_codes?: string[]; // 后端使用 ability_atomic_codes
    difficulty?: Difficulty; // 后端使用 difficulty
    ai_prompt?: string; // 后端使用 ai_prompt
    output_schema?: Record<string, unknown>; // 后端使用 output_schema
    sort_order?: number; // 后端使用 sort_order，默认值为 0
  }

  /**
   * 更新题型请求
   * 字段名称与后端 QuestionTypeUpdateSchema 对齐（使用下划线命名）
   */
  interface QuestionTypeUpdateRequest {
    name?: string;
    description?: string;
    stages?: Stage[];
    grades?: number[];
    interaction_config?: Record<string, unknown>; // 后端使用 interaction_config
    resource_type?: ResourceType; // 后端使用 resource_type
    resource_config?: Record<string, unknown>; // 后端使用 resource_config
    answer_config?: Record<string, unknown>; // 后端使用 answer_config
    feedback_config?: FeedbackConfig; // 后端使用 feedback_config
    cognitive_levels?: CognitiveLevel[]; // 后端使用 cognitive_levels
    ability_atomic_codes?: string[]; // 后端使用 ability_atomic_codes
    difficulty?: Difficulty; // 后端使用 difficulty
    ai_prompt?: string; // 后端使用 ai_prompt
    output_schema?: Record<string, unknown>; // 后端使用 output_schema
    sort_order?: number; // 后端使用 sort_order
    is_active?: boolean; // 后端使用 is_active
  }

  /**
   * 创建题目请求
   * 字段名称与后端 QuestionCreateSchema 对齐（使用下划线命名）
   */
  interface QuestionCreateRequest {
    id?: string;
    question_type_id: number; // 后端使用 question_type_id
    question_type_code: string; // 后端使用 question_type_code
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
    cognitive_level?: CognitiveLevel; // 后端使用 cognitive_level
    knowledge_points?: string[]; // 后端使用 knowledge_points
    ability_tags?: string[]; // 后端使用 ability_tags
    source?: string; // 后端使用 source，默认值为 "ai"
    prompt_id?: number; // 后端使用 prompt_id
  }

  /**
   * 更新题目请求
   * 字段名称与后端 QuestionUpdateSchema 对齐（使用下划线命名）
   */
  interface QuestionUpdateRequest {
    stem?: Stem;
    options?: QuestionOption[];
    blanks?: Array<Record<string, unknown>>;
    resources?: QuestionResource[];
    answer?: Answer;
    explanation?: string;
    difficulty?: Difficulty;
    cognitive_level?: CognitiveLevel; // 后端使用 cognitive_level
    knowledge_points?: string[]; // 后端使用 knowledge_points
    ability_tags?: string[]; // 后端使用 ability_tags
    is_active?: boolean; // 后端使用 is_active
  }

}

export {};
