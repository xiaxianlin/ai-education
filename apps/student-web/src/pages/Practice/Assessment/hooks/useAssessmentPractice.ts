import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useMemo } from "react";
import dayjs from "dayjs";
import { getPracticeStatus } from "../../util";

export const useAssessmentPractice = (textbookId: number) => {
  /** 获取综合评估 */
  const {
    data: practice,
    refresh,
    cancel,
  } = useRequest(() => studentApi.getAssessment(textbookId), {
    pollingInterval: 2000,
    onSuccess: (practice) => {
      if (!practice || practice.generate_status === 1) {
        cancel();
      }
    },
  });

  /** 创建评估 */
  const { loading, run: createPractice } = useRequest(
    () => studentApi.createPractice({ type: "assessment", textbook_id: textbookId }),
    {
      manual: true,
      onSuccess: () => refresh(),
    }
  );

  const status = useMemo(() => getPracticeStatus(practice), [practice]);

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
