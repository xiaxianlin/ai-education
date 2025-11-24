/**
 * 练习结果页面逻辑 Hook
 */
import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { practiceApi } from '@/services/practice';
import type { PracticeSessionDetail } from '@/services/practice/types';

export function usePracticeResult() {
  const { sessionId } = useParams({ from: '/practice-result/$sessionId' });
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<PracticeSessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadResult();
    }
  }, [sessionId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionIdNum = parseInt(sessionId!);
      const data = await practiceApi.getSessionDetail(sessionIdNum);
      setSessionData(data);
    } catch (err) {
      console.error('Failed to load practice result:', err);
      setError(err instanceof Error ? err.message : '加载练习结果失败');
    } finally {
      setLoading(false);
    }
  };

  const report = sessionData?.report || null;

  return {
    loading,
    sessionData,
    report,
    error,
  };
}

