/**
 * 练习状态卡片类型定义
 */

export type PracticeType = "ability" | "unit";

export interface PracticeStateCardProps {
  /** 练习类型 */
  type: PracticeType;
  /** 能力代码（能力练习必填） */
  abilityCode?: string;
  /** 原子能力信息（能力练习可选，用于显示能力详情） */
  atomic?: AbilityAtomic;
  /** 单元信息（单元练习必填） */
  unit?: Unit;
  /** 教材信息 */
  textbook?: Textbook;
  /** 是否显示知识点按钮（仅单元练习） */
  showKnowledgeButton?: boolean;
  /** 知识点按钮点击回调 */
  onKnowledgeClick?: (unit: Unit) => void;
}

export interface UsePracticeOptions {
  /** 练习类型 */
  type: PracticeType;
  /** 能力代码 */
  abilityCode?: string;
  /** 单元 ID */
  unitId?: number;
  /** 学科 */
  subject?: string;
  /** 年级 */
  grade?: number;
}

export interface UsePracticeReturn {
  /** 练习数据 */
  practice: Practice | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 是否正在创建 */
  creating: boolean;
  /** 创建练习 */
  createPractice: () => void;
  /** 刷新数据 */
  refresh: () => void;
  /** 是否可以创建 */
  canCreate: boolean;
  /** 轮询重试次数 */
  retryCount: number;
}

/** 轮询配置 */
export const POLL_CONFIG = {
  /** 初始轮询间隔（毫秒） */
  initialInterval: 1000,
  /** 最大轮询间隔（毫秒） */
  maxInterval: 5000,
  /** 最大重试次数 */
  maxRetries: 60,
  /** 退避倍数 */
  backoffMultiplier: 1.2,
} as const;
