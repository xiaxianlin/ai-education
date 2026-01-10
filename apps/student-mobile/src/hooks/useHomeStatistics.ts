import { useQuery } from "@tanstack/react-query";
import { studentApi } from "../api/client";
import { PracticeStatisticsResponse } from "../api/types";

/**
 * 首页统计数据 Hook
 */
export function useHomeStatistics() {
  return useQuery<PracticeStatisticsResponse>({
    queryKey: ["practiceStatistics"],
    queryFn: async () => {
      return await studentApi.getPracticeStatistics();
    },
  });
}
