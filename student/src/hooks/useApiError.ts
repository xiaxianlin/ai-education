/**
 * API 错误处理 Hook
 */
import { useCallback } from "react";
import { toast } from "sonner";

export function useApiError() {
  const handleError = useCallback((error: any) => {
    console.error("API Error:", error);

    // 处理不同类型的错误
    if (error?.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error?.message) {
      toast.error(error.message);
    } else {
      toast.error("操作失败，请稍后重试");
    }
  }, []);

  return {
    handleError,
  };
}
