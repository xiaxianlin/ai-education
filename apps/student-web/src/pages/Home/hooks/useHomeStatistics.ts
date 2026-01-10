import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";

/**
 * 首页统计数据 Hook
 */
export function useHomeStatistics() {
  const { data, loading, error, refresh } = useRequest(
    async () => {
      return await studentApi.getPracticeStatistics();
    },
    {
      refreshOnWindowFocus: false,
    }
  );

  return {
    statistics: data,
    loading,
    error,
    refresh,
  };
}
