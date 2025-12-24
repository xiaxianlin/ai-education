import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useState } from "react";
import { createContainer } from "unstated-next";

const useContainer = () => {
  const [unit, setUnit] = useState<Unit>();

  const { loading, data: knowledges = [] } = useRequest(() => studentApi.getUnitKnowledges(unit?.id || 0), {
    ready: !!unit?.id,
    refreshDeps: [unit?.id],
  });
  return {
    unit,
    loading,
    knowledges,
    setUnit,
  };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
