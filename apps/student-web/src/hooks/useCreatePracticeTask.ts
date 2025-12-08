import { useCallback, useRef, useState } from "react";
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
  onSuccess?: (sessionId: number) => void;
  /** 创建失败回调 */
  onError?: (error: string) => void;
}

interface UseCreatePracticeTaskReturn {
  /** 是否正在创建中（包括提交任务和轮询） */
  loading: boolean;
  /** 当前任务状态 */
  taskStatus: TaskStatus | null;
  /** 创建练习 */
  createPractice: (params: CreatePracticeParams) => Promise<void>;
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

  const [loading, setLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingCountRef = useRef(0);
  const isPollingRef = useRef(false);

  /** 清理轮询 */
  const clearPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    isPollingRef.current = false;
    pollingCountRef.current = 0;
  }, []);

  /** 取消轮询 */
  const cancelPolling = useCallback(() => {
    clearPolling();
    setLoading(false);
    setTaskStatus(null);
  }, [clearPolling]);

  /** 轮询任务状态 */
  const pollTaskStatus = useCallback(
    async (taskId: string) => {
      if (!isPollingRef.current) return;

      pollingCountRef.current += 1;

      // 检查是否超过最大轮询次数
      if (pollingCountRef.current > maxPollingCount) {
        clearPolling();
        setLoading(false);
        setTaskStatus("failed");
        const errorMsg = "练习生成超时，请稍后重试";
        toast.error(errorMsg);
        onError?.(errorMsg);
        return;
      }

      try {
        const response = await studentApi.getPracticeTaskStatus(taskId);
        setTaskStatus(response.status);

        switch (response.status) {
          case "completed":
            clearPolling();
            setLoading(false);
            if (response.result?.session_id) {
              onSuccess?.(response.result.session_id);
            }
            break;

          case "failed":
            clearPolling();
            setLoading(false);
            const errorMsg = response.error || "练习生成失败";
            toast.error(errorMsg);
            onError?.(errorMsg);
            break;

          case "cancelled":
            clearPolling();
            setLoading(false);
            toast.info("任务已取消");
            break;

          case "pending":
          case "processing":
            // 继续轮询
            pollingTimerRef.current = setTimeout(() => {
              pollTaskStatus(taskId);
            }, pollingInterval);
            break;
        }
      } catch (error) {
        console.error("轮询任务状态失败:", error);
        // 网络错误时继续尝试轮询
        pollingTimerRef.current = setTimeout(() => {
          pollTaskStatus(taskId);
        }, pollingInterval);
      }
    },
    [pollingInterval, maxPollingCount, clearPolling, onSuccess, onError]
  );

  /** 创建练习 */
  const createPractice = useCallback(
    async (params: CreatePracticeParams) => {
      // 如果正在进行中，不重复提交
      if (loading) return;

      setLoading(true);
      setTaskStatus("pending");
      clearPolling();

      try {
        // 提交创建任务
        const response = await studentApi.createPractice(params);
        
        if (response.task_id) {
          // 开始轮询任务状态
          isPollingRef.current = true;
          pollingCountRef.current = 0;
          pollTaskStatus(response.task_id);
        } else {
          throw new Error("未获取到任务ID");
        }
      } catch (error) {
        console.error("创建练习任务失败:", error);
        setLoading(false);
        setTaskStatus("failed");
        const errorMsg = "创建练习失败，请重试";
        toast.error(errorMsg);
        onError?.(errorMsg);
      }
    },
    [loading, clearPolling, pollTaskStatus, onError]
  );

  return {
    loading,
    taskStatus,
    createPractice,
    cancelPolling,
  };
}

