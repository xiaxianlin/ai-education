/**
 * useUnitPractice Hook
 * 用于查询、创建和轮询指定单元 ID 的练习
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { studentApi } from "@/lib/api";
import { PracticeGenerateStatus } from "@ai-education/shared-web";
import { useRequest } from "ahooks";

export function useUnitPractice(unitId: number) {
  const { activeTextbook } = useProfileModel();

  // 查询练习
  const {
    data: practice,
    loading,
    refresh,
  } = useRequest(() => studentApi.getUnitPracticeById(unitId), {
    ready: !!unitId,
    refreshDeps: [unitId],
    onSuccess: (res) => {
      if (res?.generate_status === PracticeGenerateStatus.GENERATING) {
        setTimeout(() => refresh(), 1000);
      }
    },
  });

  // 创建练习
  const { loading: creating, run: handleCreatePractice } = useRequest(
    () => studentApi.createPractice({ type: "unit_practice", unit_id: unitId }),
    {
      manual: true,
      onSuccess: refresh,
    }
  );

  return {
    practice: practice || null,
    loading,
    creating,
    createPractice: handleCreatePractice,
    refresh,
    canCreate: !!activeTextbook?.id,
  };
}
