import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";

/**
 * 能力掌握度数据 Hook
 */
export function useMasterySummary() {
  const { data, loading, error, refresh } = useRequest(
    async () => {
      return await studentApi.getMasterySummary();
    },
    {
      refreshOnWindowFocus: false,
    }
  );

  return {
    masterySummary: data,
    loading,
    error,
    refresh,
  };
}
