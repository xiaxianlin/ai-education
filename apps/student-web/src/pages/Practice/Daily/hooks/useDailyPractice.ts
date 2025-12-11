import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PracticeStatus } from "../../constants";

export const useDailyPractice = (textbookId: number) => {
  const [taskId, setTaskId] = useState<string>("");
  const [status, setStatus] = useState<PracticeStatus>(PracticeStatus.WAIT);
  /** 获取每日练习 */
  const { data: practice, refresh } = useRequest(() => studentApi.getDailyPractice(textbookId), {
    manual: true,
  });

  /** 轮询任务状态 */
  const { cancel } = useRequest(() => studentApi.getPracticeTaskStatus(taskId), {
    ready: !!taskId,
    refreshDeps: [taskId],
    pollingInterval: 2000,
    onSuccess: (status) => {
      switch (status) {
        case "SUCCESS":
          refresh();
          cancel();
          setStatus(PracticeStatus.READY);
          break;
        case "FAILURE":
        case "REVOKED":
          toast.error("练习生成失败");
          cancel();
          setStatus(PracticeStatus.WAIT);
          break;
      }
    },
    onError: (error) => {
      console.error("生成练习任务失败:", error);
      cancel();
    },
  });

  /** 创建练习 */
  const { loading, run: createPractice } = useRequest(
    () => studentApi.createPractice({ type: "daily_practice", textbook_id: textbookId }),
    {
      manual: true,
      onSuccess: (taskId) => {
        setTaskId(taskId);
        setStatus(PracticeStatus.GENERATING);
      },
    },
  );

  useEffect(() => {
    if (practice?.status === 1) {
      setStatus(PracticeStatus.PRACTICING);
    }
    if (practice?.status === 2) {
      setStatus(PracticeStatus.COMPLETED);
    }
  }, [practice]);

  return {
    practice,
    loading,
    status,
    refresh,
    createPractice,
  };
};
