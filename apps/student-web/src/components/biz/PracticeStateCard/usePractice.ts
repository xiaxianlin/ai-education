/**
 * 通用练习 Hook
 * 统一能力练习和单元练习的查询、创建和轮询逻辑
 */
import { studentApi } from "@/lib/api";
import { PracticeGenerateStatus, PracticeStatus } from "@ai-education/shared-web";
import { useRequest } from "ahooks";
import { useMemo } from "react";
import { UsePracticeOptions, UsePracticeReturn } from "./types";

export type PracticeState = "generating" | "completed" | "practicing" | "waiting";

export function usePractice(options: UsePracticeOptions): UsePracticeReturn {
  const { type, abilityCode, unitId } = options;

  // 查询练习
  const {
    data: practice,
    loading,
    refresh,
  } = useRequest(() => studentApi.getPractice({ practice_type: type, unit_id: unitId, ability_code: abilityCode }), {
    refreshDeps: [type, abilityCode, unitId],
    onSuccess: (res) => {
      if (res?.generate_status === PracticeGenerateStatus.GENERATING) {
        setTimeout(() => refresh(), 1000);
      }
    },
  });

  // 创建练习
  const { loading: creating, run: handleCreatePractice } = useRequest(
    () => studentApi.createPractice({ type, ability_code: abilityCode, unit_id: unitId }),
    {
      manual: true,
      onSuccess: refresh,
    }
  );

  const practiceData = practice || null;

  // 状态判断逻辑
  const state = useMemo<PracticeState>(() => {
    if (!practiceData) return "waiting";

    if (practiceData.generate_status === PracticeGenerateStatus.GENERATING) {
      return "generating";
    }

    if (practiceData.status === PracticeStatus.COMPLETED) {
      return "completed";
    }

    if (practiceData.status === PracticeStatus.PRACTICING || practiceData.status === PracticeStatus.READY) {
      return "practicing";
    }

    return "waiting";
  }, [practiceData]);

  // 统计信息（仅练习中和已完成状态显示）
  const stats = useMemo(() => {
    if ((state === "practicing" || state === "completed") && practiceData) {
      return {
        total: practiceData.question_count || 0,
        correct: practiceData.correct_count || 0,
        wrong: (practiceData.answer_count || 0) - (practiceData.correct_count || 0),
      };
    }
    return undefined;
  }, [state, practiceData]);

  return {
    practice: practiceData,
    loading,
    creating,
    createPractice: handleCreatePractice,
    refresh,
    state,
    stats,
  };
}
