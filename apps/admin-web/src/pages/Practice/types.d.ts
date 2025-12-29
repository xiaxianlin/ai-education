declare global {
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
    parameter_config?: PracticeParameter[];
    prompt?: string;
    // 元数据
    sort_order?: number;
    is_active?: boolean;
  }

  interface SearchPracticeRequest extends SearchRequest {
    subject?: string;
    grade?: number;
  }

  interface PracticeParameter {
    key: string;
    description: string;
    value_type: 'string' | 'number' | 'object' | 'array' | 'boolean';
    required: boolean;
  }
}

export { };

