/**
 * 生成类型
 */
export enum GenerateType {
  /** 文本 */
  TEXT = "text",
  /** 图片 */
  IMAGE = "image",
  /** 视频 */
  VIDEO = "video",
  /** 音频 */
  AUDIO = "audio",
}

/**
 * 管理员类型
 */
export enum ManagerType {
  /** 系统管理员 */
  SYSTEM = 0,
  /** 超级管理员 */
  ADMIN = 1,
  /** 普通管理员 */
  NORMAL = 2,
}
/**
 * 练习参数类型
 */
export enum PracticeParameterType {
  /** 内置参数 */
  SYSTEM = "system",
  /** 输入参数 */
  INPUT = "input",
}

/**
 * 练习参数值类型
 */
export enum PracticeParameterValueType {
  /** 字符串 */
  STRING = "string",
  /** 数字 */
  NUMBER = "number",
  /** 对象 */
  OBJECT = "object",
  /** 数组 */
  ARRAY = "array",
}

/**
 * 练习会话状态
 */
export enum PracticeSessionStatus {
  /** 等待练习 */
  READY = 0,
  /** 正在生成中 */
  PRACTICING = 1,
  /** 已完成 */
  COMPLETED = 2,
}

/**
 * 练习生成状态
 */
export enum PracticeGenerateStatus {
  /** 生成失败 */
  FAILED = 0,
  /** 生成中 */
  GENERATING = 1,
  /** 生成成功 */
  SUCCESS = 2,
}

/**
 * 练习类型
 */
export enum PracticeType {
  /** 系统练习 */
  SYSTEM = "system",
  /** 自定义练习 */
  CUSTOM = "custom",
}

export const PRACTICE_TYPE_MAP: Record<PracticeType, string> = {
  system: "系统练习",
  custom: "自定义练习",
};

export const PRACTICE_TYPE_OPTIONS = Object.entries(PRACTICE_TYPE_MAP).map(([value, label]) => ({
  label,
  value,
}));

export const PRACTICE_PARAMETER_VALUE_TYPE_MAP: Record<PracticeParameterValueType, string> = {
  string: "字符串",
  number: "数字",
  object: "对象",
  array: "数组",
};

export const PRACTICE_PARAMETER_VALUE_TYPE_OPTIONS = Object.entries(PRACTICE_PARAMETER_VALUE_TYPE_MAP).map(
  ([value, label]) => ({
    label,
    value,
  })
);

export const PRACTICE_PARAMETER_TYPE_MAP: Record<PracticeParameterType, string> = {
  system: "内置参数",
  input: "输入参数",
};

export const PRACTICE_PARAMETER_TYPE_OPTIONS = Object.entries(PRACTICE_PARAMETER_TYPE_MAP).map(([value, label]) => ({
  label,
  value,
}));

export const PRACTICE_SESSION_STATUS_MAP: Record<PracticeSessionStatus, string> = {
  0: "未开始",
  1: "进行中",
  2: "已完成",
};

export const PRACTICE_SESSION_STATUS_OPTIONS = Object.entries(PRACTICE_SESSION_STATUS_MAP).map(([value, label]) => ({
  label,
  value,
}));

export const PRACTICE_GENERATE_STATUS_MAP: Record<PracticeGenerateStatus, string> = {
  0: "生成失败",
  1: "生成中",
  2: "生成成功",
};

export const PRACTICE_GENERATE_STATUS_OPTIONS = Object.entries(PRACTICE_GENERATE_STATUS_MAP).map(([value, label]) => ({
  label,
  value,
}));

export const GRADES: Record<number, string> = {
  1: "一年级",
  2: "二年级",
  3: "三年级",
  4: "四年级",
  5: "五年级",
  6: "六年级",
  7: "七年级",
  8: "八年级",
  9: "九年级",
  10: "高一",
  11: "高二",
  12: "高三",
};

export const GRADE_OPTIONS = Object.entries(GRADES).map(([value, label]) => ({
  label,
  value,
}));

// ============ 题型系统常量 ============

/** 学段枚举 */
export enum Stage {
  PRIMARY_LOW = "primary_low",
  PRIMARY_HIGH = "primary_high",
  JUNIOR = "junior",
  SENIOR = "senior",
}

/** 交互类型枚举 */
export enum InteractionType {
  SINGLE_CHOICE = "single_choice",
  MULTI_CHOICE = "multi_choice",
  IMAGE_CHOICE = "image_choice",
  TEXT_INPUT = "text_input",
  HANDWRITING = "handwriting",
  VOICE_INPUT = "voice_input",
  DRAG_DROP = "drag_drop",
  CONNECT_LINE = "connect_line",
  SORT_ORDER = "sort_order",
  TRUE_FALSE = "true_false",
  CORRECT_WRONG = "correct_wrong",
  FOLLOW_READ = "follow_read",
  FREE_SPEAK = "free_speak",
  FILL_BLANK = "fill_blank",
  MULTI_STEP = "multi_step",
}

/** 认知层次枚举 */
export enum CognitiveLevel {
  REMEMBER = "remember",
  UNDERSTAND = "understand",
  APPLY = "apply",
  ANALYZE = "analyze",
  EVALUATE = "evaluate",
  CREATE = "create",
}

/** 难度枚举 */
export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

/** 资源类型枚举 */
export enum ResourceType {
  NONE = "none",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  ANIMATION = "animation",
}

/** 答案类型枚举 */
export enum AnswerType {
  EXACT = "exact",
  FUZZY = "fuzzy",
  RUBRIC = "rubric",
  AI = "ai",
  COMPOSITE = "composite",
}

/** 交互类型与组件映射 */
export const INTERACTION_COMPONENT_MAP: Record<InteractionType, string> = {
  single_choice: "RadioGroup",
  multi_choice: "CheckboxGroup",
  image_choice: "ImageRadioGroup",
  text_input: "TextField",
  handwriting: "HandwritingCanvas",
  voice_input: "VoiceRecorder",
  drag_drop: "DragDropZone",
  connect_line: "ConnectionLine",
  sort_order: "SortableList",
  true_false: "TrueFalseToggle",
  correct_wrong: "CorrectWrongToggle",
  follow_read: "FollowReadPlayer",
  free_speak: "FreeSpeakRecorder",
  fill_blank: "FillBlankInput",
  multi_step: "MultiStepForm",
};

/** 学段与年级映射 */
export const STAGE_GRADES: Record<Stage, number[]> = {
  primary_low: [1, 2, 3],
  primary_high: [4, 5, 6],
  junior: [7, 8, 9],
  senior: [10, 11, 12],
};

/** 学段标签 */
export const STAGE_LABELS: Record<Stage, string> = {
  primary_low: "小学低段",
  primary_high: "小学高段",
  junior: "初中",
  senior: "高中",
};

/** 学段选项 */
export const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({
  label,
  value,
}));

/** 难度标签 */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

/** 认知层次标签 */
export const COGNITIVE_LEVEL_LABELS: Record<CognitiveLevel, string> = {
  remember: "识记",
  understand: "理解",
  apply: "应用",
  analyze: "分析",
  evaluate: "评价",
  create: "创造",
};

/** 交互类型标签 */
export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  single_choice: "单选题",
  multi_choice: "多选题",
  image_choice: "图片选择",
  text_input: "文本输入",
  handwriting: "手写输入",
  voice_input: "语音输入",
  drag_drop: "拖拽放置",
  connect_line: "连线匹配",
  sort_order: "排序排列",
  true_false: "是非判断",
  correct_wrong: "对错判断",
  follow_read: "跟读",
  free_speak: "自由表达",
  fill_blank: "填空",
  multi_step: "多步骤",
};

/** 资源类型标签 */
export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  none: "无",
  image: "图片",
  audio: "音频",
  video: "视频",
  animation: "动画",
};

/** 答案类型标签 */
export const ANSWER_TYPE_LABELS: Record<AnswerType, string> = {
  exact: "精确匹配",
  fuzzy: "模糊匹配",
  rubric: "评分标准",
  ai: "AI评分",
  composite: "复合题",
};

// ============ 练习场景与专项类型常量 ============

/** 场景类型枚举 */
export enum SceneType {
  DAILY_TRAINING = "daily_training",
  UNIT_TEST = "unit_test",
  COMPREHENSIVE_ASSESSMENT = "comprehensive_assessment",
}

/** 场景类型标签 */
export const SCENE_TYPE_LABELS: Record<SceneType, string> = {
  daily_training: "日常训练",
  unit_test: "单元测试",
  comprehensive_assessment: "综合评估",
};

/** 场景类型选项 */
export const SCENE_TYPE_OPTIONS = Object.entries(SCENE_TYPE_LABELS).map(([value, label]) => ({
  label,
  value,
}));

/** 专项类型枚举 */
export enum SpecialtyType {
  // 语文专项
  PINYIN = "pinyin",
  LITERACY = "literacy",
  VOCABULARY = "vocabulary",
  SENTENCE = "sentence",
  PARAGRAPH = "paragraph",
  READING = "reading",
  WRITING = "writing",
  COMPREHENSIVE_CHINESE = "comprehensive_chinese",
  // 数学专项
  COUNTING = "counting",
  CALCULATION = "calculation",
  SHAPE = "shape",
  POSITION = "position",
  MEASUREMENT = "measurement",
  STATISTICS = "statistics",
  PROBLEM_SOLVING = "problem_solving",
  COMPREHENSIVE_MATH = "comprehensive_math",
  // 英语专项
  ALPHABET = "alphabet",
  WORDS = "words",
  SENTENCE_PATTERN = "sentence_pattern",
  GRAMMAR = "grammar",
  LISTENING = "listening",
  SPEAKING = "speaking",
  ENGLISH_READING = "english_reading",
  COMPREHENSIVE_ENGLISH = "comprehensive_english",
}

/** 专项类型标签 */
export const SPECIALTY_TYPE_LABELS: Record<SpecialtyType, string> = {
  // 语文
  pinyin: "拼音专项",
  literacy: "识字专项",
  vocabulary: "词语专项",
  sentence: "句子专项",
  paragraph: "段落专项",
  reading: "阅读专项",
  writing: "写话/习作专项",
  comprehensive_chinese: "语文综合",
  // 数学
  counting: "数数专项",
  calculation: "计算专项",
  shape: "图形专项",
  position: "位置专项",
  measurement: "测量专项",
  statistics: "统计专项",
  problem_solving: "解决问题专项",
  comprehensive_math: "数学综合",
  // 英语
  alphabet: "字母专项",
  words: "单词专项",
  sentence_pattern: "句型专项",
  grammar: "语法专项",
  listening: "听力专项",
  speaking: "口语专项",
  english_reading: "英语阅读专项",
  comprehensive_english: "英语综合",
};

/** 按科目分组的专项类型 */
export const SPECIALTY_TYPES_BY_SUBJECT: Record<string, SpecialtyType[]> = {
  语文: [
    SpecialtyType.PINYIN,
    SpecialtyType.LITERACY,
    SpecialtyType.VOCABULARY,
    SpecialtyType.SENTENCE,
    SpecialtyType.PARAGRAPH,
    SpecialtyType.READING,
    SpecialtyType.WRITING,
    SpecialtyType.COMPREHENSIVE_CHINESE,
  ],
  数学: [
    SpecialtyType.COUNTING,
    SpecialtyType.CALCULATION,
    SpecialtyType.SHAPE,
    SpecialtyType.POSITION,
    SpecialtyType.MEASUREMENT,
    SpecialtyType.STATISTICS,
    SpecialtyType.PROBLEM_SOLVING,
    SpecialtyType.COMPREHENSIVE_MATH,
  ],
  英语: [
    SpecialtyType.ALPHABET,
    SpecialtyType.WORDS,
    SpecialtyType.SENTENCE_PATTERN,
    SpecialtyType.GRAMMAR,
    SpecialtyType.LISTENING,
    SpecialtyType.SPEAKING,
    SpecialtyType.ENGLISH_READING,
    SpecialtyType.COMPREHENSIVE_ENGLISH,
  ],
};

/** 获取科目专项选项 */
export const getSpecialtyOptions = (subject: string) => {
  const types = SPECIALTY_TYPES_BY_SUBJECT[subject] || [];
  return types.map((type) => ({
    label: SPECIALTY_TYPE_LABELS[type],
    value: type,
  }));
};
