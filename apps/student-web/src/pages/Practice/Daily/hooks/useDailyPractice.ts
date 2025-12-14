import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useMemo } from "react";
import { getPracticeStatus } from "../../util";

export const useDailyPractice = (textbookId: number) => {
  /** 获取每日练习 */
  const {
    data: practice,
    refresh,
    cancel,
  } = useRequest(() => studentApi.getDailyPractice(textbookId), {
    pollingInterval: 2000,
    onSuccess: (practice) => {
      if (!practice || practice.generate_status === 1) {
        cancel();
      }
    },
  });

  /** 创建练习 */
  const { loading, run: createPractice } = useRequest(
    () => studentApi.createPractice({ type: "daily_practice", textbook_id: textbookId }),
    {
      manual: true,
      onSuccess: () => refresh(),
    }
  );

  const status = useMemo(() => getPracticeStatus(practice), [practice]);

  return {
    practice,
    loading,
    status,
    refresh,
    createPractice,
  };
};
