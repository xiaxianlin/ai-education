import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useCreatePractice } from "@/hooks/useCreatePractice";

export const useDailyPractice = (textbookId: number) => {
  /** 获取每日练习 */
  const { data: practice, refresh } = useRequest(() => studentApi.getDailyPractice(textbookId), {
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
    params: { type: "daily_practice", textbook_id: textbookId },
    refresh,
  });

  return {
    practice,
    loading,
    status,
    createPractice,
  };
};
