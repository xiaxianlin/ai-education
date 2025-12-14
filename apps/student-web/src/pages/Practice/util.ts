import { PracticeStatus } from "./constants";

export const getPracticeStatus = (practice?: PracticeSession, taskStatus?: TaskStatus) => {
  if (taskStatus) {
    switch (taskStatus) {
      case "SUCCESS":
        return PracticeStatus.READY;
      case "FAILURE":
      case "REVOKED":
        return PracticeStatus.WAIT;
      default:
        return PracticeStatus.GENERATING;
    }
  }
  if (practice) {
    if (practice.generate_status === 0) {
      return PracticeStatus.GENERATING;
    }
    switch (practice.status) {
      case 0:
        return PracticeStatus.READY;
      case 1:
        return PracticeStatus.COMPLETED;
      case 2:
        return PracticeStatus.WAIT;
    }
    return PracticeStatus.WAIT;
  }

  return PracticeStatus.WAIT;
};
