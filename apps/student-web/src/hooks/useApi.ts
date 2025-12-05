/**
 * API 请求封装 Hook
 * 基于 ahooks 的 useRequest，提供统一的错误处理和加载状态
 */
import { useRequest } from "ahooks";
import { toast } from "sonner";
import type { Options } from "ahooks/lib/useRequest/src/types";

interface UseApiOptions<TData, TParams extends any[]>
  extends Options<TData, TParams> {
  showError?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
}

export function useApi<TData = any, TParams extends any[] = any[]>(
  service: (...args: TParams) => Promise<TData>,
  options?: UseApiOptions<TData, TParams>
) {
  const {
    showError = true,
    showSuccess = false,
    successMessage,
    onSuccess,
    onError,
    ...restOptions
  } = options || {};

  return useRequest(service, {
    ...restOptions,
    onSuccess: (data, params) => {
      if (showSuccess && successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(data, params);
    },
    onError: (error, params) => {
      if (showError) {
        const message = error instanceof Error ? error.message : "操作失败";
        toast.error(message);
      }
      onError?.(error, params);
    },
  });
}
