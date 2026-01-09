import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { createContainer } from "unstated-next";

const useContainer = () => {
  /** 获取能力练习 */
  const { data: practices = [], refresh } = useRequest(() => studentApi.getAbilityPractices());

  const { loading, run: createPractice } = useRequest(
    (textbookId: number) => studentApi.createPractice({ type: "ability_practice", textbook_id: textbookId }),
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
