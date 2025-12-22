declare global {
  /**
   * 搜索学生请求
   */
  interface SearchQuestionRequest extends SearchRequest {
    question_id?: string;
    keyword?: string;
    textbook_id?: number;
    unit_id?: number;
    type?: string;
    subtype?: string;
    difficulty?: string;
    subject?: string;
    grade?: number;
  }

  /**
   * 更新题目请求
   */
  interface UpdateQuestionRequest {
    subject?: string;
    grade?: number;
    type?: string;
    subtype?: string;
    content?: string;
    options?: string | string[];
    answer?: string;
    resource?: string;
    resource_type?: string;
    resource_content?: string;
    difficulty?: string;
    knowledge?: string;
    unit_id?: number;
    textbook_id?: number;
  }

  /**
   * 搜索题型请求
   */
  interface SearchQuestionTypeRequest {
    scene?: string;
    subject?: string;
    grade?: number;
  }

  /**
   * 创建题型请求
   */
  interface CreateQuestionTypeRequest {
    title: string;
    scene: string;
    subject: string;
    grade: number;
    description?: string;
    resource_type?: string;
    prompt?: string;
  }

  /**
   * 更新题型请求
   */
  interface UpdateQuestionTypeRequest {
    title?: string;
    scene?: string;
    description?: string;
    resource_type?: string;
    prompt?: string;
  }
}

export {};
