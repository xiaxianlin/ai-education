import { useCallback } from 'react';
import { toast } from 'sonner';
import { ApiError } from '../types/api';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: Error) => void;
}

export function useApiError(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logError = true,
    onError,
  } = options;

  const handleError = useCallback((error: unknown) => {
    let message = '操作失败，请重试';
    let code = 0;

    if (error instanceof ApiError) {
      message = error.message;
      code = error.code;
      if (logError) {
        console.error('[API Error]', {
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }
    } else if (error instanceof Error) {
      message = error.message;
      if (logError) {
        console.error('[Error]', error);
      }
    } else {
      if (logError) {
        console.error('[Unknown Error]', error);
      }
    }

    if (showToast) {
      toast.error(message);
    }

    if (onError) {
      onError(error as Error);
    }

    return { message, code };
  }, [showToast, logError, onError]);

  return { handleError };
}

