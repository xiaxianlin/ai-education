import { useAntdApp } from '@/lib/antdApp';

/**
 * 通用的表格请求处理
 */
export function useTableRequest<T, P = any>(
  requestFn: (params: P) => Promise<{ data: T[]; total: number }>,
) {
  const { message } = useAntdApp();
  return async (params: any) => {
    try {
      const { pageSize, current, ...filter } = params;
      const searchParams = {
        page: current || 1,
        size: pageSize || 10,
        ...filter,
      } as P;

      const res = await requestFn(searchParams);
      return {
        data: res?.data || [],
        total: res?.total || 0,
        success: true,
      };
    } catch (error: any) {
      message.error(error?.message || '请求失败');
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };
}
