declare global {
  // ========== 练习提示词配置请求 ==========

  interface SavePracticePromptRequest {
    // 基础信息
    name?: string;
    code?: string;
    description?: string;
    // 场景分类
    scene_type?: SceneType;
    specialty_type?: SpecialtyType;
    // 适用范围
    subject: string;
    stages?: Stage[];
    grades?: number[];
    semesters?: string[];
    // 关联
    practice_id?: number;
    practice_slug?: string;
    prompt_id?: number;
    prompt_slug?: string;
    // 配置
    question_type_configs?: QuestionTypeConfigItem[];
    difficulty_config?: DifficultyConfig;
    question_count_config?: QuestionCountConfig;
    template_variables?: TemplateVariable[];
    // 元数据
    sort_order?: number;
    is_active?: boolean;
  }

  interface SearchPracticePromptRequest extends SearchRequest {
    subject?: string;
    scene_type?: SceneType;
    specialty_type?: SpecialtyType;
    practice_id?: number;
    practice_slug?: string;
    prompt_id?: number;
    prompt_slug?: string;
    is_active?: boolean;
  }

  // ========== 练习管理请求 ==========

  interface SavePracticeRequest {
    name: string;
    slug: string;
    type: PracticeType;
    icon?: string;
    description?: string;
    // 场景类型
    scene_type?: SceneType;
    // 适用范围
    subject?: string;
    stages?: Stage[];
    grades?: number[];
    // 配置
    question_count_config?: QuestionCountConfig;
    difficulty_config?: DifficultyConfig;
    ability_config?: AbilityConfig;
    feedback_config?: PracticeFeedbackConfig;
    // 元数据
    sort_order?: number;
    is_active?: boolean;
  }

  interface SearchPracticeRequest extends SearchRequest {
    name?: string;
    slug?: string;
    type?: PracticeType;
    scene_type?: SceneType;
    subject?: string;
    is_active?: boolean;
  }
}

export {};
