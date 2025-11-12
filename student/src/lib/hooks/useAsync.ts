import { useState, useCallback } from 'react';
import { useApiError } from './useApiError';

interface UseAsyncOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
}

export function useAsync<T = unknown>(options: UseAsyncOptions = {}) {
  const { onSuccess, onError, showErrorToast = true } = options;
  const { handleError } = useApiError({ showToast: showErrorToast, onError });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction();
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorResult = handleError(err);
        const error = err instanceof Error ? err : new Error(errorResult.message);
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, onSuccess]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

