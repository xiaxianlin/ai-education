/**
 * 每日练习页面逻辑 Hook
 * 负责每日练习页面的业务逻辑
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { practiceApi, DailyPracticeSession } from '@/services/practice';
import { toast } from 'sonner';
import { useApiError } from '@/shared/hooks/useApiError';

export type PracticeStatus = 'checking' | 'ready' | 'generating' | 'error';

export function useDailyPracticePage() {
  const navigate = useNavigate();
  const { handleError } = useApiError();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<DailyPracticeSession | null>(null);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [status, setStatus] = useState<PracticeStatus>('checking');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    checkTodayPractice();
  }, []);

  const checkTodayPractice = useCallback(async () => {
    try {
      setLoading(true);
      const result = await practiceApi.checkTodayPractice();

      if (result.session) {
        setSession(result.session);
        setStatus('ready');
        setProgress(100);
      } else if (result.task_id) {
        setTaskId(result.task_id);
        setStatus(result.status as PracticeStatus);
        setProgress(result.progress);
        pollProgress(result.task_id);
      } else {
        setStatus('error');
      }
    } catch (error) {
      handleError(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const pollProgress = useCallback((taskId: number) => {
    const interval = setInterval(async () => {
      try {
        const result = await practiceApi.getDailyPracticeProgress(taskId);
        setStatus(result.status as PracticeStatus);
        setProgress(result.progress);

        if (result.status === 'completed' && result.session) {
          clearInterval(interval);
          setSession(result.session);
          setStatus('ready');
          setProgress(100);
          toast.success('🎉 今日练习已生成！');
        } else if (result.status === 'failed') {
          clearInterval(interval);
          setStatus('error');
          toast.error(result.error_message || '生成今日练习失败');
        }
      } catch (error) {
        console.error('Failed to get progress:', error);
        clearInterval(interval);
        setStatus('error');
      }
    }, 2000);

    // 30秒后停止轮询
    setTimeout(() => {
      clearInterval(interval);
    }, 30000);
  }, []);

  const handleStartPractice = useCallback(async () => {
    if (!session) {
      toast.error('练习尚未生成完成');
      return;
    }

    try {
      navigate({ to: `/daily-practice/${session.id}` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '启动练习失败';
      toast.error(errorMessage);
    }
  }, [session, navigate]);

  return {
    loading,
    session,
    status,
    progress,
    handleStartPractice,
  };
}

