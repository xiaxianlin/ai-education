import { PanelType } from "./types";

export const getPanelType = (session: PracticeSession, report?: PracticeSessionReport): PanelType => {
  if (session.status === 0) return PanelType.READY;
  if (session.status === 1) return PanelType.PROCESSING;
  if (session.status === 2 && !report) return PanelType.SETTLEMENT;
  if (session.status === 2 && report) return PanelType.RESULT;
  return PanelType.LOADING;
};
