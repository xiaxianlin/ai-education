import { useMemo } from "react";
import { createContainer } from "unstated-next";
import {
  PracticeCardState,
  PracticeCardStatus,
} from "../types/practice-card";

type PracticeType = "daily_practice" | "unit_practice" | "assessment";

interface UsePracticeCardStateOptions {
  practice?: PracticeSession;
  practiceType: PracticeType;
  isCreating?: boolean;
}

const usePracticeCardState = (options?: UsePracticeCardStateOptions) => {
  const { practice, practiceType = "daily_practice", isCreating = false } =
    options ?? { practiceType: "daily_practice", isCreating: false };
  return useMemo<PracticeCardState>(() => {
    // 准备生成（无记录或生成失败）
    if (!practice || practice.generate_status === -1) {
      return {
        status: PracticeCardStatus.WAIT_TO_GENERATE,
        practice,
        canRegenerate: true,
        canViewReport: false,
      };
    }

    // 生成中
    if (isCreating || practice.generate_status === 0) {
      return {
        status: PracticeCardStatus.GENERATING,
        practice,
        canRegenerate: false,
        canViewReport: false,
      };
    }

    // 练习中（题目已生成）
    if (practice.generate_status === 1 && practice.status !== 2) {
      return {
        status:
          practice.status === 0
            ? PracticeCardStatus.READY_TO_PRACTICE
            : PracticeCardStatus.IN_PROGRESS,
        practice,
        canRegenerate: false,
        canViewReport: false,
      };
    }

    // 练习完成
    return {
      status: PracticeCardStatus.COMPLETED,
      practice,
      canRegenerate: practiceType !== "daily_practice",
      canViewReport: true,
    };
  }, [practice, practiceType, isCreating]);
};

export const PracticeCardStateModel =
  createContainer<PracticeCardState, UsePracticeCardStateOptions>(
    usePracticeCardState
  );

