/**
 * 错题记录服务 API
 * 对应后端 server/student/routes/wrong_records.py
 */
import { api } from "@/lib/api";

export const wrongRecordsService = {
  /**
   * 获取错题列表
   * GET /wrong-records
   */
  getWrongRecords: async (params?: {
    textbook_id?: number;
    unit_id?: number;
    is_corrected?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.textbook_id) queryParams.append("textbook_id", params.textbook_id.toString());
    if (params?.unit_id) queryParams.append("unit_id", params.unit_id.toString());
    if (params?.is_corrected !== undefined) queryParams.append("is_corrected", params.is_corrected.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString();
    return api.get<PracticeWrongRecord[]>(`/wrong-records${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * 标记错题为已订正
   * POST /wrong-records/{record_id}/correct
   */
  markAsCorrected: async (recordId: number) => {
    return api.post(`/wrong-records/${recordId}/correct`);
  },

  /**
   * 获取错题统计
   * GET /wrong-records/stats
   */
  getWrongRecordsStats: async (textbookId?: number) => {
    const params = textbookId ? `?textbook_id=${textbookId}` : "";
    return api.get<{
      total: number;
      corrected: number;
      uncorrected: number;
      by_unit: Record<string, number>;
      by_knowledge: Record<string, number>;
    }>(`/wrong-records/stats${params}`);
  },
};
