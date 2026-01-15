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

export { };

