import { studentApi } from "@/lib/api";
import { useBoolean, useRequest } from "ahooks";
import { useCreatePractice } from "@/hooks/useCreatePractice";

export const useUnitPractice = (unit: Unit, textbook: Textbook) => {
  const [visible, { setTrue: showConfirmModal, setFalse: hideConfirmModal }] = useBoolean(false);

  /** 获取单元练习 */
  const { data: practice, refresh } = useRequest(() => studentApi.getUnitPractice(unit.id), {
    ready: !!unit.id,
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
    params: { type: "unit_practice", textbook_id: textbook.id, unit_id: unit.id },
    refresh,
    onSuccess: hideConfirmModal,
  });

  return {
    visible,
    practice,
    loading,
    status,
    createPractice,
    showConfirmModal,
    hideConfirmModal,
  };
};
