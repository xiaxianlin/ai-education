declare global {
  /**
   * 题型更新请求
   */
  interface QuestionTypeSaveRequest {
    id?: number;
    name: string;
    code: string;
    category: 'ability_practice' | 'unit_practice';
    description?: string;
    subject?: string;
    ability_code?: string;
    configs: Record<string, unknown>;
  }

  /**
   * 搜索题目请求
   */
  interface SearchQuestionRequest {
    page?: number;
    size?: number;
    id?: string;
    question_type_code?: string;
    subject?: string;
    grade?: number;
    name?: string;
  }

  /**
   * 更新题目请求
   */
  interface QuestionUpdateRequest {
    content?: Record<string, any>;
    answer?: Record<string, any>;
    explanation?: string;
  }
}

export {};
