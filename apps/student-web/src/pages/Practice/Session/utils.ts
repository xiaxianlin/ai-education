import { PanelType } from "./types";

export const getPracticeTypeName = (sessionType?: PracticeType): string => {
  if (!sessionType) return "练习";
  switch (sessionType) {
    case "daily_practice":
      return "日常练习";
    case "unit_practice":
      return "单元练习";
    case "assessment":
      return "能力评测";
    default:
      return "练习";
  }
};

export const getPanelType = (session: PracticeSession, report?: PracticeReport): PanelType => {
  if (session.status === 0) return PanelType.READY;
  if (session.status === 1) return PanelType.PROCESSING;
  if (session.status === 2 && !report) return PanelType.SETTLEMENT;
  if (session.status === 2 && report) return PanelType.RESULT;
  return PanelType.LOADING;
};
