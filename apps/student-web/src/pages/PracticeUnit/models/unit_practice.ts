import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { createContainer } from "unstated-next";

const useContainer = (textbook?: Textbook) => {
  const { data: units = [], loading } = useRequest(() => studentApi.getTextbookUnits(textbook?.id || 0), {
    ready: !!textbook?.id,
    refreshDeps: [textbook?.id],
  });

  return {
    loading,
    units,
  };
};

export const UnitPracticeModel = createContainer(useContainer);
export const useUnitPracticeModel = UnitPracticeModel.useContainer;
