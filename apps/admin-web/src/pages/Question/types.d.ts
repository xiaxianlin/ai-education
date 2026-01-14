declare global {
  /**
   * 搜索题型请求
   * 字段名称与后端 QuestionTypeSearchSchema 对齐（使用下划线命名）
   */
  interface QuestionTypeSearchRequest extends SearchRequest {
    subject?: string;
    category?: "ability_practice" | "unit_practice";
    grade_band?: "Low" | "Mid" | "High";
    ability_code?: string;
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
    question_type_code?: string; // 后端使用 question_type_code
    subject?: string;
    grade?: number;
    ability_code?: string;
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
    category: "ability_practice" | "unit_practice";
    grade_band?: "Low" | "Mid" | "High";
    ability_code?: string;
    media_context?: {
      types?: string[];
      configs?: Record<string, unknown>;
    };
    scaffolding_config?: {
      mode?: string;
      hints?: Array<Record<string, unknown>>;
      templates?: string[];
      config?: Record<string, unknown>;
    };
    evaluation_config?: {
      mode: "auto_match" | "ai_analysis";
      correct_answer?: unknown;
      rubrics?: Array<{
        dimension: string;
        max_score: number;
        description?: string;
      }>;
      config?: Record<string, unknown>;
    };
    prompt?: string;
  }

  /**
   * 更新题型请求
   * 字段名称与后端 QuestionTypeUpdateSchema 对齐（使用下划线命名）
   */
  interface QuestionTypeUpdateRequest {
    name?: string;
    description?: string;
    category?: "ability_practice" | "unit_practice";
    grade_band?: "Low" | "Mid" | "High";
    ability_code?: string;
    media_context?: {
      types?: string[];
      configs?: Record<string, unknown>;
    };
    scaffolding_config?: {
      mode?: string;
      hints?: Array<Record<string, unknown>>;
      templates?: string[];
      config?: Record<string, unknown>;
    };
    evaluation_config?: {
      mode: "auto_match" | "ai_analysis";
      correct_answer?: unknown;
      rubrics?: Array<{
        dimension: string;
        max_score: number;
        description?: string;
      }>;
      config?: Record<string, unknown>;
    };
    prompt?: string;
  }

  /**
   * 创建题目请求
   * 字段名称与后端 QuestionCreateSchema 对齐（使用下划线命名）
   */
  interface QuestionCreateRequest {
    id?: string;
    question_type_code: string; // 后端使用 question_type_code
    subject: string;
    grade: number;
    ability_code?: string;
    content: {
      stem: string | Stem; // 题干文本或对象
      resource?: QuestionResource; // 题干资源（单个）
      options?: QuestionOption[]; // 选项列表
      sub_questions?: Array<Record<string, unknown>>; // 子题列表（复合题）
    };
    answer: Answer;
    explanation?: string;
  }

  /**
   * 更新题目请求
   * 字段名称与后端 QuestionUpdateSchema 对齐（使用下划线命名）
   */
  interface QuestionUpdateRequest {
    content?: {
      stem?: string | Stem; // 题干文本或对象
      resource?: QuestionResource; // 题干资源（单个）
      options?: QuestionOption[]; // 选项列表
      sub_questions?: Array<Record<string, unknown>>; // 子题列表（复合题）
    };
    answer?: Answer;
    explanation?: string;
    ability_code?: string;
  }

}

export {};
