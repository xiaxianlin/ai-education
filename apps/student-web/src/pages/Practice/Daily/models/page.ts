import { studentApi } from "@/common/api";
import { useRequest } from "ahooks";
import { createContainer } from "unstated-next";

const useContainer = () => {
  /** 获取日常练习 */
  const { data: practices = [], refresh } = useRequest(() => studentApi.getDailyPractices());

  const { loading, run: createPractice } = useRequest(
    (textbookId: number) => studentApi.createPractice({ type: "daily_practice", textbook_id: textbookId }),
    {
      manual: true,
      onSuccess: () => {
        refresh();
      },
    }
  );

  return {
    loading,
    practices,
    createPractice,
  };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
