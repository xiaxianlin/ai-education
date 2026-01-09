/**
 * 通用练习 Hook
 * 统一能力练习和单元练习的查询、创建和轮询逻辑
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { studentApi } from "@/lib/api";
import { PracticeGenerateStatus } from "@ai-education/shared-web";
import { useRequest } from "ahooks";
import { useCallback, useMemo, useRef, useState } from "react";
import { POLL_CONFIG, UsePracticeOptions, UsePracticeReturn } from "./types";

export function usePractice(options: UsePracticeOptions): UsePracticeReturn {
  const { type, abilityCode, unitId, subject, grade } = options;
  const { activeTextbook } = useProfileModel();

  // 轮询状态
  const [retryCount, setRetryCount] = useState(0);
  const currentIntervalRef = useRef(POLL_CONFIG.initialInterval);

  // 查询函数
  const queryFn = useCallback(async () => {
    if (type === "ability" && abilityCode) {
      return studentApi.getAbilityPracticeByCode(abilityCode);
    }
    if (type === "unit" && unitId) {
      return studentApi.getUnitPracticeById(unitId);
    }
    return null;
  }, [type, abilityCode, unitId]);

  // 创建函数
  const createFn = useCallback(async () => {
    if (type === "ability" && abilityCode) {
      return studentApi.createPractice({
        type: "ability_practice",
        ability_code: abilityCode,
        subject,
        grade,
      });
    }
    if (type === "unit" && unitId) {
      return studentApi.createPractice({
        type: "unit_practice",
        unit_id: unitId,
      });
    }
    throw new Error("Invalid practice type or missing parameters");
  }, [type, abilityCode, unitId, subject, grade]);

  // 判断是否可以查询
  const canQuery = useMemo(() => {
    if (type === "ability") return !!abilityCode;
    if (type === "unit") return !!unitId;
    return false;
  }, [type, abilityCode, unitId]);

  // 查询练习
  const {
    data: practice,
    loading,
    refresh,
  } = useRequest(queryFn, {
    ready: canQuery,
    refreshDeps: [type, abilityCode, unitId],
    onSuccess: (res) => {
      if (res?.generate_status === PracticeGenerateStatus.GENERATING) {
        // 检查是否超过最大重试次数
        if (retryCount >= POLL_CONFIG.maxRetries) {
          console.warn("练习生成轮询超时，已停止轮询");
          return;
        }

        // 指数退避轮询
        const nextInterval = Math.min(
          currentIntervalRef.current * POLL_CONFIG.backoffMultiplier,
          POLL_CONFIG.maxInterval
        );
        currentIntervalRef.current = nextInterval;
        setRetryCount((c) => c + 1);

        setTimeout(() => refresh(), nextInterval);
      } else {
        // 重置轮询状态
        currentIntervalRef.current = POLL_CONFIG.initialInterval;
        setRetryCount(0);
      }
    },
  });

  // 创建练习
  const { loading: creating, run: handleCreatePractice } = useRequest(createFn, {
    manual: true,
    onSuccess: () => {
      // 重置轮询状态
      currentIntervalRef.current = POLL_CONFIG.initialInterval;
      setRetryCount(0);
      refresh();
    },
  });

  // 判断是否可以创建
  const canCreate = useMemo(() => {
    if (type === "ability") {
      return !!activeTextbook && !!abilityCode && !!subject && !!grade;
    }
    if (type === "unit") {
      return !!activeTextbook && !!unitId;
    }
    return false;
  }, [type, activeTextbook, abilityCode, unitId, subject, grade]);

  return {
    practice: practice || null,
    loading,
    creating,
    createPractice: handleCreatePractice,
    refresh,
    canCreate,
    retryCount,
  };
}
