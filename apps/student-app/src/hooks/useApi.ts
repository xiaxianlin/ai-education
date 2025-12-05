/**
 * API 请求封装 Hook
 * 基于 React Query，提供统一的错误处理和加载状态
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

interface UseApiQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  showError?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
}

interface UseApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  showError?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
}

export function useApiQuery<TData = any>(
  queryKey: string[],
  service: () => Promise<TData>,
  options?: UseApiQueryOptions<TData>
) {
  const {
    showError = true,
    showSuccess = false,
    successMessage,
    onSuccess,
    onError,
    ...restOptions
  } = options || {};

  return useQuery({
    queryKey,
    queryFn: service,
    ...restOptions,
    onSuccess: (data) => {
      if (showSuccess && successMessage) {
        Toast.show({
          type: 'success',
          text1: successMessage,
        });
      }
      onSuccess?.(data);
    },
    onError: (error) => {
      if (showError) {
        const message = error instanceof Error ? error.message : "操作失败";
        Toast.show({
          type: 'error',
          text1: message,
        });
      }
      onError?.(error);
    },
  });
}

export function useApiMutation<TData = any, TVariables = void>(
  service: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  const {
    showError = true,
    showSuccess = false,
    successMessage,
    onSuccess,
    onError,
    ...restOptions
  } = options || {};

  return useMutation({
    mutationFn: service,
    ...restOptions,
    onSuccess: (data, variables, context) => {
      if (showSuccess && successMessage) {
        Toast.show({
          type: 'success',
          text1: successMessage,
        });
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (showError) {
        const message = error instanceof Error ? error.message : "操作失败";
        Toast.show({
          type: 'error',
          text1: message,
        });
      }
      onError?.(error, variables, context);
    },
  });
}

// 兼容性：提供类似 useRequest 的接口
export function useApi<TData = any, TParams extends any[] = any[]>(
  service: (...args: TParams) => Promise<TData>,
  options?: {
    manual?: boolean;
    onSuccess?: (data: TData, params: TParams) => void;
    onError?: (error: Error, params: TParams) => void;
    showError?: boolean;
    showSuccess?: boolean;
    successMessage?: string;
  }
) {
  const [params, setParams] = useState<TParams | null>(null);
  const {
    manual = false,
    showError = true,
    showSuccess = false,
    successMessage,
    onSuccess,
    onError,
  } = options || {};

  const query = useQuery({
    queryKey: ['useApi', params],
    queryFn: () => (params ? service(...params) : Promise.reject(new Error('No params'))),
    enabled: !manual && params !== null,
    ...(options as any),
    onSuccess: (data) => {
      if (showSuccess && successMessage) {
        Toast.show({
          type: 'success',
          text1: successMessage,
        });
      }
      if (params) {
        onSuccess?.(data, params);
      }
    },
    onError: (error) => {
      if (showError) {
        const message = error instanceof Error ? error.message : "操作失败";
        Toast.show({
          type: 'error',
          text1: message,
        });
      }
      if (params) {
        onError?.(error as Error, params);
      }
    },
  });

  const run = useCallback((...args: TParams) => {
    setParams(args as TParams);
  }, []);

  return {
    ...query,
    run,
    loading: query.isLoading,
    data: query.data,
    error: query.error,
  };
}

