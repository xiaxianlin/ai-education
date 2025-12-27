declare global {
  /**
   * 搜索题目请求
   */
  interface SearchQuestionRequest extends SearchRequest {
    subject?: string;
    grade?: number;
    stage?: Stage;
    questionTypeCode?: string;
    difficulty?: Difficulty;
    textbookId?: number;
    unitId?: number;
    isActive?: boolean;
    keyword?: string;
    pageSize?: number;
  }

  /** 创建题型请求 */
  interface QuestionTypeCreateRequest {
    code: string;
    name: string;
    description?: string;
    subject: string;
    stages: Stage[];
    grades: number[];
    interactionType: InteractionType;
    interactionConfig?: Record<string, unknown>;
    resourceType?: ResourceType;
    resourceConfig?: Record<string, unknown>;
    answerType: AnswerType;
    answerConfig?: Record<string, unknown>;
    feedbackConfig?: FeedbackConfig;
    cognitiveLevels?: CognitiveLevel[];
    abilityDimensions?: string[];
    aiPrompt?: string;
    sortOrder?: number;
  }

  /** 更新题型请求 */
  interface QuestionTypeUpdateRequest {
    name?: string;
    description?: string;
    stages?: Stage[];
    grades?: number[];
    interactionConfig?: Record<string, unknown>;
    resourceType?: ResourceType;
    resourceConfig?: Record<string, unknown>;
    answerConfig?: Record<string, unknown>;
    feedbackConfig?: FeedbackConfig;
    cognitiveLevels?: CognitiveLevel[];
    abilityDimensions?: string[];
    aiPrompt?: string;
    sortOrder?: number;
    isActive?: boolean;
  }

  /** 创建题目请求 */
  interface QuestionCreateRequest {
    id?: string;
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
    source?: string;
    promptId?: number;
  }

  /** 更新题目请求 */
  interface QuestionUpdateRequest {
    stem?: Stem;
    options?: QuestionOption[];
    blanks?: Array<Record<string, unknown>>;
    resources?: QuestionResource[];
    answer?: Answer;
    explanation?: string;
    difficulty?: Difficulty;
    cognitiveLevel?: CognitiveLevel;
    knowledgePoints?: string[];
    abilityTags?: string[];
    isActive?: boolean;
  }

  /** 创建题目模板请求 */
  interface QuestionTemplateCreateRequest {
    name: string;
    questionTypeId: number;
    description?: string;
    systemPrompt?: string;
    userPromptTemplate?: string;
    variables?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    isActive?: boolean;
  }

  /** 更新题目模板请求 */
  interface QuestionTemplateUpdateRequest {
    name?: string;
    description?: string;
    systemPrompt?: string;
    userPromptTemplate?: string;
    variables?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    isActive?: boolean;
  }
}

export {};
