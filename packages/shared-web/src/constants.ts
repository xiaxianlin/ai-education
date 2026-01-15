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

/** 学段枚举（仅支持小学阶段） */
export enum Stage {
  LOW = "low",
  MID = "mid",
  HIGH = "high",
}

/** 学段标签 */
export const STAGE_LABELS: Record<Stage, string> = {
  low: "小学低段",
  mid: "小学中段",
  high: "小学高段",
};

/** 学段年级映射 */
export const STAGE_GRADES: Record<Stage, number[]> = {
  low: [1, 2],
  mid: [3, 4],
  high: [5, 6],
};

