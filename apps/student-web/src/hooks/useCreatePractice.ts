import { studentApi } from "@/lib/api";
import { getPracticeStatus } from "@/pages/Practice/util";
import { useRequest } from "ahooks";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

interface UseCreatePracticeProps {
  practice?: PracticeSession;
  params: CreatePracticeRequest;
  refresh?: () => void;
  onSuccess?: () => void;
}

/**
 * 创建练习的通用 Hook
 * 负责创建练习任务并轮询任务状态
 */
export const useCreatePractice = ({ practice, params, refresh, onSuccess }: UseCreatePracticeProps) => {
  /** 创建练习任务 */
  const {
    data,
    loading,
    run: createPractice,
  } = useRequest(() => studentApi.createPractice(params), {
    manual: true,
    onSuccess,
  });

  /** 轮询任务状态 */
  const { data: taskStatus, cancel: cancelPolling } = useRequest(() => studentApi.getPracticeTaskStatus(data || ""), {
    ready: !!data,
    refreshDeps: [data],
    pollingInterval: 2000,
    onSuccess: (status: TaskStatus) => {
      // 任务完成（成功或失败）时停止轮询
      if (status === "SUCCESS" || status === "FAILURE" || status === "REVOKED") {
        cancelPolling();
      }
      if (status === "FAILURE" || status === "REVOKED") {
        toast.error("创建练习失败");
      }
    },
  });

  const status = useMemo(() => getPracticeStatus(practice, taskStatus), [practice, taskStatus]);

  useEffect(() => {
    if (taskStatus === "SUCCESS") {
      refresh?.();
    }
  }, [taskStatus]);

  return {
    /** 是否正在创建任务 */
    loading,
    /** 当前任务状态 */
    status,
    /** 创建练习 */
    createPractice,
  };
};
