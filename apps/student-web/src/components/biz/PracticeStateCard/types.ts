/**
 * 练习状态卡片类型定义
 */
import { ReactNode } from "react";

export type PracticeType = "ability_practice" | "unit_practice";

export interface PracticeStateCardProps {
  /** 练习类型 */
  type: PracticeType;
  /** 能力代码（能力练习必填） */
  atomic?: Ability;
  /** 单元信息（单元练习必填） */
  unit?: Unit;
  /** 右上角额外内容 */
  extra?: ReactNode;
}

export interface UsePracticeOptions {
  /** 练习类型 */
  type: PracticeType;
  /** 能力代码（能力练习必填） */
  abilityCode?: string;
  /** 单元 ID（单元练习必填） */
  unitId?: number;
  /** 能力信息（用于获取 subject 和 grade） */
  atomic?: Ability;
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
  /** 当前状态 */
  state: "generating" | "completed" | "practicing" | "waiting";
  /** 统计信息（仅练习中和已完成状态显示） */
  stats?: {
    total: number;
    correct: number;
    wrong: number;
  };
}
