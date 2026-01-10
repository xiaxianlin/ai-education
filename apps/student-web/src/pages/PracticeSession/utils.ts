import { PracticeGenerateStatus, PracticeStatus } from "@ai-education/shared-web";
import { PanelType } from "./types";

export const getPanelType = (session: Practice, report?: PracticeReport): PanelType => {
  // 首先检查生成状态
  if (session.generate_status === PracticeGenerateStatus.GENERATING) {
    return PanelType.LOADING;
  }
  if (session.generate_status === PracticeGenerateStatus.FAILED) {
    return PanelType.EMPTY;
  }

  // 然后检查会话状态
  if (session.status === PracticeStatus.READY) return PanelType.READY;
  if (session.status === PracticeStatus.PRACTICING) return PanelType.PROCESSING;
  if (session.status === PracticeStatus.COMPLETED && !report) return PanelType.SETTLEMENT;
  if (session.status === PracticeStatus.COMPLETED && report) return PanelType.RESULT;
  
  return PanelType.LOADING;
};
