import { PracticeStatus } from "./constants";

export const getPracticeStatus = (practice?: PracticeSession) => {
  if (!practice) {
    return PracticeStatus.WAIT;
  }
  if (practice.generate_status === 0) {
    return PracticeStatus.GENERATING;
  }
  if (practice.status === 0) {
    return PracticeStatus.READY;
  }
  if (practice.status === 1) {
    return PracticeStatus.PRACTICING;
  }
  if (practice.status === 2) {
    return PracticeStatus.COMPLETED;
  }
};
