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
  TEXT = "text",
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

/** 难度颜色 */
export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "green",
  medium: "orange",
  hard: "red",
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
  text: "文本",
  image: "图片",
  audio: "音频",
  video: "视频",
  animation: "动画",
};

/** 资源类型颜色 */
export const RESOURCE_TYPE_COLORS: Record<ResourceType, string> = {
  text: "blue",
  image: "green",
  audio: "purple",
  video: "orange",
  animation: "red",
};

/** 答案类型标签 */
export const ANSWER_TYPE_LABELS: Record<AnswerType, string> = {
  exact: "精确匹配",
  fuzzy: "模糊匹配",
  rubric: "评分标准",
  ai: "AI评分",
  composite: "复合题",
};

/** 获取科目专项选项（兼容性函数，使用能力类型） */
export const getSpecialtyOptions = (subject: string) => {
  return getAbilityOptions(subject);
};

// ============ 能力维度常量 ============

/** 能力维度枚举（按科目分组，使用科目前缀区分） */
export enum AbilityType {
  // 语文能力
  CHINESE_PHONETIC = "phonetic", // 拼音
  CHINESE_CHARACTER = "character", // 识字写字
  CHINESE_VOCABULARY = "vocabulary", // 词语积累
  CHINESE_SENTENCE = "sentence", // 句子运用
  CHINESE_PARAGRAPH = "paragraph", // 段落
  CHINESE_READING = "reading", // 阅读理解
  CHINESE_WRITING = "writing", // 书面表达
  CHINESE_SPEAKING = "speaking", // 口语表达
  CHINESE_COMPREHENSIVE = "comprehensive_chinese", // 语文综合

  // 数学能力
  MATH_NUMBER_SENSE = "number_sense", // 数感
  MATH_COUNTING = "counting", // 数数
  MATH_CALCULATION = "calculation", // 运算能力
  MATH_SHAPE = "shape", // 图形
  MATH_POSITION = "position", // 位置
  MATH_MEASUREMENT = "measurement", // 测量
  MATH_STATISTICS = "statistics", // 统计
  MATH_PROBLEM_SOLVING = "problem_solving", // 解决问题
  MATH_SPATIAL = "spatial", // 空间观念
  MATH_DATA = "data", // 数据分析
  MATH_REASONING = "reasoning", // 推理能力
  MATH_MODELING = "modeling", // 模型思想
  MATH_APPLICATION = "application", // 应用意识
  MATH_COMPREHENSIVE = "comprehensive_math", // 数学综合

  // 英语能力
  ENGLISH_ALPHABET = "alphabet", // 字母
  ENGLISH_WORDS = "words", // 单词
  ENGLISH_SENTENCE_PATTERN = "sentence_pattern", // 句型
  ENGLISH_LISTENING = "listening", // 听力理解
  ENGLISH_SPEAKING = "speaking", // 口语表达
  ENGLISH_READING = "reading", // 阅读理解
  ENGLISH_WRITING = "writing", // 书面表达
  ENGLISH_VOCABULARY = "vocabulary", // 词汇知识
  ENGLISH_GRAMMAR = "grammar", // 语法知识
  ENGLISH_COMPREHENSIVE = "comprehensive_english", // 英语综合
}

export const ABILITY_TYPE_OPTIONS: Record<string, Array<{ label: string; value: string }>> = {
  语文: [
    { label: "拼音", value: "phonetic" },
    { label: "拼音", value: "pinyin" }, // 兼容旧值
    { label: "识字", value: "literacy" }, // 兼容旧值
    { label: "识字写字", value: "character" },
    { label: "词语积累", value: "vocabulary" },
    { label: "句子运用", value: "sentence" },
    { label: "段落", value: "paragraph" },
    { label: "阅读理解", value: "reading" },
    { label: "书面表达", value: "writing" },
    { label: "口语表达", value: "speaking" },
    { label: "语文综合", value: "comprehensive_chinese" },
  ],
  数学: [
    { label: "数感", value: "number_sense" },
    { label: "数数", value: "counting" },
    { label: "运算能力", value: "calculation" },
    { label: "图形", value: "shape" },
    { label: "位置", value: "position" },
    { label: "测量", value: "measurement" },
    { label: "统计", value: "statistics" },
    { label: "解决问题", value: "problem_solving" },
    { label: "空间观念", value: "spatial" },
    { label: "数据分析", value: "data" },
    { label: "推理能力", value: "reasoning" },
    { label: "模型思想", value: "modeling" },
    { label: "应用意识", value: "application" },
    { label: "数学综合", value: "comprehensive_math" },
  ],
  英语: [
    { label: "字母", value: "alphabet" },
    { label: "单词", value: "words" },
    { label: "句型", value: "sentence_pattern" },
    { label: "听力理解", value: "listening" },
    { label: "口语表达", value: "speaking" },
    { label: "阅读理解", value: "reading" },
    { label: "英语阅读", value: "english_reading" }, // 兼容旧值
    { label: "书面表达", value: "writing" },
    { label: "词汇知识", value: "vocabulary" },
    { label: "语法知识", value: "grammar" },
    { label: "英语综合", value: "comprehensive_english" },
  ],
};

export const ABILITY_TYPE_MAP = Object.entries(ABILITY_TYPE_OPTIONS).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [key]: value.reduce((acc, { value, label }) => ({ ...acc, [value]: label }), {}),
  }),
  {}
) as Record<string, Record<string, string>>;

/** 根据科目获取能力维度选项 */
export const getAbilityOptions = (subject: string) => {
  return ABILITY_TYPE_OPTIONS[subject] || [];
};
