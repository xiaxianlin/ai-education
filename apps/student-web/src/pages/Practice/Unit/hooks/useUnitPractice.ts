import { studentApi } from "@/lib/api";
import { useBoolean, useRequest } from "ahooks";
import { useMemo } from "react";
import { getPracticeStatus } from "../../util";

export const useUnitPractice = (unit: Unit, textbook: Textbook) => {
  const [visible, { setTrue: showConfirmModal, setFalse: hideConfirmModal }] = useBoolean(false);

  /** 获取单元练习 */
  const {
    data: practice,
    refresh,
    cancel,
  } = useRequest(() => studentApi.getUnitPractice(unit.id), {
    ready: !!unit.id,
    refreshDeps: [unit.id],
    pollingInterval: 2000,
    onSuccess: (practice) => {
      if (!practice || practice.generate_status === 1) {
        cancel();
      }
    },
  });

  /** 创建练习 */
  const { loading, run: createPractice } = useRequest(
    () =>
      studentApi.createPractice({
        type: "unit_practice",
        textbook_id: textbook.id,
        unit_id: unit.id,
      }),
    {
      manual: true,
      onSuccess: () => refresh(),
    }
  );

  const status = useMemo(() => getPracticeStatus(practice), [practice]);

  return {
    visible,
    practice,
    loading,
    status,
    refresh,
    createPractice,
    showConfirmModal,
    hideConfirmModal,
  };
};
