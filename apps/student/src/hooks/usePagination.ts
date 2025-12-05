/**
 * 分页 Hook
 * 基于 ahooks 的 usePagination
 */
import { usePagination as useAhooksPagination } from "ahooks";

interface PaginationParams {
  current: number;
  pageSize: number;
}

export function usePagination<TData extends { total: number; list: any[] }>(
  service: (params: PaginationParams) => Promise<TData>,
  options?: {
    defaultPageSize?: number;
    defaultCurrent?: number;
  }
) {
  const { data, loading, pagination, run, refresh } = useAhooksPagination(
    ({ current, pageSize }) => service({ current, pageSize }),
    {
      defaultPageSize: options?.defaultPageSize || 10,
      defaultCurrent: options?.defaultCurrent || 1,
    }
  );

  return {
    data: data?.list || [],
    total: data?.total || 0,
    loading,
    current: pagination.current,
    pageSize: pagination.pageSize,
    changePage: pagination.onChange,
    changePageSize: pagination.changePageSize,
    run,
    refresh,
  };
}
