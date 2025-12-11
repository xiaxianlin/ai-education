export enum PracticeCardStatus {
  WAIT_TO_GENERATE = "WAIT_TO_GENERATE", // 准备生成
  GENERATING = "GENERATING", // 生成中
  READY_TO_PRACTICE = "READY_TO_PRACTICE", // 练习中-待开始
  IN_PROGRESS = "IN_PROGRESS", // 练习中-进行中
  COMPLETED = "COMPLETED", // 练习完成
}

export interface PracticeCardState {
  status: PracticeCardStatus;
  practice?: PracticeSession;
  canRegenerate: boolean;
  canViewReport: boolean;
}

