import { studentApi } from "@/common/api";
import { useRequest } from "ahooks";
import { createContainer } from "unstated-next";

const useContainer = (textbook?: Textbook) => {
  const { data: units = [], loading } = useRequest(() => studentApi.getTextbookUnits(textbook?.id || 0), {
    ready: !!textbook?.id,
    refreshDeps: [textbook?.id],
  });

  const { data: practices = [] } = useRequest(() => studentApi.getUnitPractices(textbook?.id || 0), {
    ready: !!textbook?.id,
    refreshDeps: [textbook?.id],
  });

  const { loading: creating, run: createPractice } = useRequest(
    (unitId: number) =>
      studentApi.createPractice({ type: "unit_practice", textbook_id: textbook?.id || 0, unit_id: unitId }),
    {
      manual: true,
    }
  );

  return {
    loading,
    units,
    practices,
    creating,
    createPractice,
  };
};

export const UnitPracticeModel = createContainer(useContainer);
export const useUnitPracticeModel = UnitPracticeModel.useContainer;
