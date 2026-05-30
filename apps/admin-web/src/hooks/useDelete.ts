import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';

interface UseDeleteOptions {
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * 通用的删除操作 Hook
 * 封装了删除请求的通用逻辑
 */
export function useDelete<T = string>(
  deleteFn: (id: T) => Promise<any>,
  options?: UseDeleteOptions,
) {
  const {
    onSuccess,
    successMessage = '删除成功',
    errorMessage = '删除失败',
  } = options || {};

  const { runAsync: handleDelete, loading } = useRequest(
    async (id: T) => {
      await deleteFn(id);
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success(successMessage);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || errorMessage);
      },
    },
  );

  return {
    handleDelete,
    loading,
  };
}
