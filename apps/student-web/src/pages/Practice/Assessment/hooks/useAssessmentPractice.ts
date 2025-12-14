import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useCreatePractice } from "@/hooks/useCreatePractice";

export const useAssessmentPractice = (textbookId: number) => {
  /** 获取综合评估 */
  const { data: practice, refresh } = useRequest(() => studentApi.getAssessment(textbookId), {
    onSuccess: (res) => {
      if (res.generate_status === 0) {
        setTimeout(() => {
          refresh();
        }, 1000);
      }
    },
  });

  const { loading, status, createPractice } = useCreatePractice({
    practice,
    params: { type: "assessment", textbook_id: textbookId },
    refresh,
  });

  const shouldCreate = useMemo(() => {
    if (!practice) {
      return true;
    }

    // 如果练习未完成，则不能创建新的评估
    if (practice?.status !== 2) {
      return false;
    }

    // 最近一次完成评估的时间
    const completedTime = dayjs((practice.update_time || 0) * 1000);

    // 如果最近一次完成评估的时间在30天前，则可以创建新的评估
    return completedTime.isBefore(dayjs().subtract(30, "day"));
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
