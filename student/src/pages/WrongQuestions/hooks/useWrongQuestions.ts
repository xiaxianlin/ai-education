/**
 * 错题集页面逻辑 Hook
 * 负责错题集页面的业务逻辑
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { profileApi, WrongQuestion } from '@/services/profile';
import { toast } from 'sonner';
import { useApiError } from '@/hooks/useApiError';

export type FilterType = 'all' | 'unmastered' | 'mastered';

export function useWrongQuestions() {
  const { handleError } = useApiError();

  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('unmastered');
  const [loadingAction, setLoadingAction] = useState<number | null>(null);

  useEffect(() => {
    loadWrongQuestions();
  }, [filter]);

  const loadWrongQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const mastered = filter === 'all' ? undefined : filter === 'mastered' ? 1 : 0;
      const data = await profileApi.getWrongQuestions(mastered);
      setWrongQuestions(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [filter, handleError]);

  const handleMarkAsMastered = useCallback(async (questionId: number) => {
    try {
      setLoadingAction(questionId);
      await profileApi.markQuestionAsMastered(questionId);
      toast.success('已标记为已掌握');
      loadWrongQuestions();
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingAction(null);
    }
  }, [loadWrongQuestions, handleError]);

  const handleUnmarkAsMastered = useCallback(async (questionId: number) => {
    try {
      setLoadingAction(questionId);
      await profileApi.unmarkQuestionAsMastered(questionId);
      toast.success('已标记为未掌握');
      loadWrongQuestions();
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingAction(null);
    }
  }, [loadWrongQuestions, handleError]);

  const stats = useMemo(() => {
    const total = wrongQuestions.length;
    const mastered = wrongQuestions.filter(q => q.is_mastered === 1).length;
    const unmastered = wrongQuestions.filter(q => q.is_mastered === 0).length;
    return { total, mastered, unmastered };
  }, [wrongQuestions]);

  return {
    wrongQuestions,
    loading,
    filter,
    loadingAction,
    stats,
    setFilter,
    handleMarkAsMastered,
    handleUnmarkAsMastered,
    reload: loadWrongQuestions,
  };
}

