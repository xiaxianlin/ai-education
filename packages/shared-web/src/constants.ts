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

export const ManagerTypeMap: Record<ManagerType, string> = {
  [ManagerType.SYSTEM]: "系统管理员",
  [ManagerType.ADMIN]: "超级管理员",
  [ManagerType.NORMAL]: "普通管理员",
};

export enum PracticeType {
  UNIT_PRACTICE = "unit_practice",
  ABILITY_PRACTICE = "ability_practice",
}

export const PracticeTypeMap: Record<PracticeType, string> = {
  [PracticeType.UNIT_PRACTICE]: "单元练习",
  [PracticeType.ABILITY_PRACTICE]: "能力练习",
};

/**
 * 练习状态
 */
export enum PracticeStatus {
  /** 未开始 */
  READY = 0,
  /** 进行中 */
  PRACTICING = 1,
  /** 已完成 */
  COMPLETED = 2,
  /** 已废弃 */
  ABANDONED = 3,
}

/**
 * 练习生成状态
 * 注意：与后端保持一致：0-生成中, 1-已完成, -1-生成失败
 */
export enum PracticeGenerateStatus {
  /** 生成中 */
  GENERATING = 0,
  /** 已完成 */
  SUCCESS = 1,
  /** 生成失败 */
  FAILED = -1,
}

export const GRADES: Record<number, string> = {
  1: "一年级",
  2: "二年级",
  3: "三年级",
  4: "四年级",
  5: "五年级",
  6: "六年级",
};

/** 学科列表 */
export const SUBJECTS = ["语文", "数学", "英语"];

/** 学期列表 */
export const SEMESTERS = ["上学期", "下学期"];

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

/** 学段标签 */
export const STAGE_LABELS: Record<Stage, string> = {
  primary_low: "小学低段",
  primary_high: "小学高段",
  junior: "初中",
  senior: "高中",
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

/** 答案类型标签 */
export const ANSWER_TYPE_LABELS: Record<AnswerType, string> = {
  exact: "精确匹配",
  fuzzy: "模糊匹配",
  rubric: "评分标准",
  ai: "AI评分",
  composite: "复合题",
};
