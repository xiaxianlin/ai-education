import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { PracticeStatus } from "../../constants";
import dayjs from "dayjs";

export const useAssessmentPractice = (textbookId: number) => {
  const [taskId, setTaskId] = useState<string>("");
  const [status, setStatus] = useState<PracticeStatus>(PracticeStatus.WAIT);

  /** 获取综合评估 */
  const { data: practice, refresh } = useRequest(() => studentApi.getAssessment(textbookId));

  const shouldCreate = useMemo(() => {
    // 如果练习未完成，则不能创建新的评估
    if (practice?.status !== 2) {
      return false;
    }

    // 最近一次完成评估的时间
    const completedTime = dayjs((practice.update_time || 0) * 1000);

    // 如果最近一次完成评估的时间在30天前，则可以创建新的评估
    return completedTime.isBefore(dayjs().subtract(30, "day"));
  }, [practice]);

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
          toast.error("评估生成失败");
          cancel();
          setStatus(PracticeStatus.WAIT);
          break;
      }
    },
    onError: (error) => {
      console.error("生成评估任务失败:", error);
      cancel();
    },
  });

  /** 创建评估 */
  const { loading, run: createPractice } = useRequest(
    () => studentApi.createPractice({ type: "assessment", textbook_id: textbookId }),
    {
      manual: true,
      onSuccess: (taskId) => {
        setTaskId(taskId);
        setStatus(PracticeStatus.GENERATING);
      },
    },
  );

  useEffect(() => {
    if (!practice) {
      setStatus(PracticeStatus.WAIT);
      return;
    }
    if (practice.status === 1) {
      setStatus(PracticeStatus.PRACTICING);
    } else if (practice.status === 2) {
      setStatus(PracticeStatus.COMPLETED);
    } else if (practice.generate_status === 1) {
      setStatus(PracticeStatus.READY);
    }
  }, [practice]);

  return {
    status,
    loading,
    practice,
    shouldCreate,
    refresh,
    createPractice,
  };
};
