import { studentApi } from "@/lib/api";
import { useBoolean, useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PracticeStatus } from "../../constants";

export const useUnitPractice = (unit: Unit, textbook: Textbook) => {
  const [taskId, setTaskId] = useState<string>("");
  const [status, setStatus] = useState<PracticeStatus>(PracticeStatus.WAIT);
  const [visible, { setTrue: showConfirmModal, setFalse: hideConfirmModal }] = useBoolean(false);

  /** 获取单元练习 */
  const { data: practice, refresh } = useRequest(() => studentApi.getUnitPractice(unit.id), {
    refreshDeps: [unit.id],
  });

  /** 轮询任务状态 */
  const { cancel } = useRequest(() => studentApi.getPracticeTaskStatus(taskId), {
    ready: !!taskId,
    refreshDeps: [taskId],
    pollingInterval: 2000,
    onSuccess: (status) => {
      switch (status) {
        case "SUCCESS":
          refresh();
          cancel();
          setStatus(PracticeStatus.READY);
          break;
        case "FAILURE":
        case "REVOKED":
          toast.error("练习生成失败");
          cancel();
          setStatus(PracticeStatus.WAIT);
          break;
      }
    },
    onError: (error) => {
      console.error("生成练习任务失败:", error);
      cancel();
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
      onSuccess: (taskId) => {
        setTaskId(taskId);
        setStatus(PracticeStatus.GENERATING);
      },
    },
  );

  useEffect(() => {
    if (!practice) {
      setStatus(PracticeStatus.WAIT);
      return;
    }
    if (practice.status === 1) {
      setStatus(PracticeStatus.PRACTICING);
    } else if (practice.status === 2) {
      setStatus(PracticeStatus.COMPLETED);
    } else if (practice.generate_status === 1) {
      setStatus(PracticeStatus.READY);
    }
  }, [practice]);

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
