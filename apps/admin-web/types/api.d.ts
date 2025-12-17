declare global {
  /**
   * 登录模型
   */
  interface LoginRequest {
    username?: string;
    password?: string;
  }

  /**
   * 修改密码模型
   */
  interface ModifyPasswordRequest {
    origin?: string;
    password?: string;
  }

  /**
   * 创建管理员模型
   */
  interface CreateManagerRequest {
    username: string;
    type: ManagerType;
  }

  /**
   * 更新管理员请求
   */
  interface UpdateManagerRequest {
    status?: number;
    type?: ManagerType;
  }

  /**
   * 搜索学生请求
   */
  interface SearchStudentRequest extends SearchRequest {
    phone?: string;
    status?: number;
  }

  /**
   * 更新学生请求
   */
  interface SaveStudentRequest {
    name?: string;
    phone?: string;
    grade?: number;
    status?: number;
  }

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
   * 搜索教材请求
   */
  interface SearchTextbookRequest extends SearchRequest {
    version?: string;
    grade?: number;
    subject?: string;
  }

  /**
   * 保存教材请求
   */
  interface SaveTextbookRequest {
    subject: string;
    version: string;
    grade: number;
    semester: string;
  }

  /**
   * 创建单元请求
   */
  interface CreateUnitRequest {
    name: string;
    content: string;
    textbook_id: number;
  }

  /**
   * 更新单元请求
   */
  interface UpdateUnitRequest {
    name?: string;
    content?: string;
  }

  /**
   * 创建知识点请求
   */
  interface CreateKnowledgeRequest {
    name: string;
    content: string;
    textbook_id: number;
    unit_id: number;
  }

  /**
   * 更新知识点请求
   */
  interface UpdateKnowledgeRequest {
    name?: string;
    content?: string;
  }

  /**
   * 搜索教师用书请求
   */
  interface SearchTeacherBookRequest extends SearchRequest {
    version?: string;
    grade?: number;
    subject?: string;
  }

  /**
   * 保存教师用书请求
   */
  interface SaveTeacherBookRequest {
    subject: string;
    version: string;
    grade: number;
    semester: string;
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

  // ========== Prompt 管理 ==========

  interface SearchPromptRequest extends SearchRequest {
    name?: string;
    type?: string;
    slug?: string;
  }

  interface SearchPromptVersionRequest extends SearchRequest {
    prompt_id?: number;
  }

  interface SavePromptRequest {
    name?: string;
    slug?: string;
    type?: string;
    description?: string;
    template_content?: string;
    negative_content?: string;
    model_params?: any;
  }

  interface TestPromptRequest {
    variables?: Record<string, any>;
    model_provider?: string;
    model_name?: string;
    model_params?: {
      temperature?: number;
      max_tokens?: number;
      [key: string]: any;
    };
  }

  interface TestPromptResponse {
    rendered_prompt: string;
    response_snapshot: {
      content?: string;
      model?: string;
      usage?: {
        prompt_tokens?: number | null;
        completion_tokens?: number | null;
        total_tokens?: number | null;
      };
      finish_reason?: string;
      model_provider: string;
      model_name: string;
      model_params: any;
      latency_ms: number;
      response_id?: string | null;
      error?: string;
    };
    ai_response?: string;
    latency_ms: number;
    status: 'testing' | 'success' | 'failed';
    error?: string | null;
    record_id: number;
  }

  interface PromptMetrics {
    calls: number;
    success_rate: number;
    p95_latency_ms?: number | null;
  }

  interface PromptDetail {
    id?: number;
    name: string;
    slug: string;
    type?: string;
    description?: string;
    template_content: string;
    negative_content?: string;
    model_params?: any;
    version_id: number;
    is_published: number;
    create_time?: number;
    changelog?: string;
    scene?: string;
    tags?: string[];
  }
}

export {};
