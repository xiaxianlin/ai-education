import { useCallback, useRef, useState } from "react";
import { useRequest } from "ahooks";
import { studentApi } from "@/lib/api";
import { toast } from "sonner";

type PracticeType = "daily_practice" | "unit_practice" | "assessment";

interface CreatePracticeParams {
  type: PracticeType;
  textbook_id: number;
  unit_id?: number;
}

interface UseCreatePracticeTaskOptions {
  /** 轮询间隔（毫秒），默认 2000 */
  pollingInterval?: number;
  /** 最大轮询次数，默认 150（5分钟） */
  maxPollingCount?: number;
  /** 创建成功回调 */
  onSuccess?: () => void;
  /** 创建失败回调 */
  onError?: (error: string) => void;
}

interface UseCreatePracticeTaskReturn {
  /** 是否正在创建中（包括提交任务和轮询） */
  loading: boolean;
  /** 当前任务状态 */
  taskStatus: TaskStatus | null;
  /** 创建练习 */
  createPractice: (params: CreatePracticeParams) => void;
  /** 取消轮询 */
  cancelPolling: () => void;
}

/**
 * 创建练习任务的 Hook
 * 支持异步任务轮询，直到任务完成或失败
 */
export function useCreatePracticeTask(
  options: UseCreatePracticeTaskOptions = {}
): UseCreatePracticeTaskReturn {
  const {
    pollingInterval = 2000,
    maxPollingCount = 150,
    onSuccess,
    onError,
  } = options;

  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const pollingCountRef = useRef(0);

  /** 轮询任务状态 */
  const {
    loading: pollingLoading,
    run: pollTaskStatus,
    cancel: cancelPollingRequest,
  } = useRequest(
    async (taskId: string) => {
      pollingCountRef.current += 1;

      // 检查是否超过最大轮询次数
      if (pollingCountRef.current > maxPollingCount) {
        cancelPollingRequest();
        setTaskStatus("FAILURE");
        const errorMsg = "练习生成超时，请稍后重试";
        toast.error(errorMsg);
        onError?.(errorMsg);
        throw new Error(errorMsg);
      }

      return await studentApi.getPracticeTaskStatus(taskId);
    },
    {
      manual: true,
      pollingInterval,
      pollingWhenHidden: false,
      pollingErrorRetryCount: -1, // 无限重试，直到手动取消
      onSuccess: (status: TaskStatus) => {
        setTaskStatus(status);

        switch (status) {
          case "SUCCESS":
            cancelPollingRequest();
            onSuccess?.();
            break;

          case "FAILURE":
            cancelPollingRequest();
            const errorMsg = "练习生成失败，请重试";
            toast.error(errorMsg);
            onError?.(errorMsg);
            break;

          case "REVOKED":
            cancelPollingRequest();
            toast.info("任务已取消");
            break;

          case "PENDING":
          case "STARTED":
          case "RETRY":
            // 继续轮询，useRequest 会自动处理
            break;
        }
      },
      onError: (error) => {
        console.error("轮询任务状态失败:", error);
        // 网络错误时继续尝试轮询，useRequest 会自动重试
      },
    }
  );

  /** 取消轮询 */
  const cancelPolling = useCallback(() => {
    cancelPollingRequest();
    setTaskStatus(null);
    pollingCountRef.current = 0;
  }, [cancelPollingRequest]);

  /** 创建练习 */
  const { loading: createLoading, run: runCreatePractice } = useRequest(
    (params: CreatePracticeParams) => studentApi.createPractice(params),
    {
      manual: true,
      onSuccess: (taskId: string) => {
        if (taskId) {
          // 初始化轮询状态
          setTaskStatus("PENDING");
          pollingCountRef.current = 0;
          // 手动触发第一次轮询
          pollTaskStatus(taskId);
        } else {
          setTaskStatus("FAILURE");
          const errorMsg = "未获取到任务ID";
          toast.error(errorMsg);
          onError?.(errorMsg);
        }
      },
      onError: (error) => {
        console.error("创建练习任务失败:", error);
        setTaskStatus("FAILURE");
        const errorMsg = "创建练习失败，请重试";
        toast.error(errorMsg);
        onError?.(errorMsg);
      },
    }
  );

  /** 包装 createPractice */
  const createPractice = useCallback(
    (params: CreatePracticeParams) => {
      runCreatePractice(params);
    },
    [runCreatePractice]
  );

  return {
    loading: createLoading || pollingLoading,
    taskStatus,
    createPractice,
    cancelPolling,
  };
}
