import { studentApi } from "@/common/api";
import { useRequest } from "ahooks";
import { createContainer } from "unstated-next";

const useContainer = () => {
  /** 获取综合评估 */
  const { data: practices = [], refresh } = useRequest(() => studentApi.getAssessments(), {
    onSuccess: (res) => {
      // 如果有正在生成的评估，定期刷新
      const generatingPractice = res.find((p) => p.generate_status === PracticeGenerateStatus.GENERATING);
      if (generatingPractice) {
        setTimeout(() => {
          refresh();
        }, 1000);
      }
    },
  });

  const { loading, run: createPractice } = useRequest(
    (textbookId: number) => studentApi.createPractice({ type: "assessment", textbook_id: textbookId }),
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
