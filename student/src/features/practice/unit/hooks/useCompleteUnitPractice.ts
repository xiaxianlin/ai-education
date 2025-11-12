import { useState, useCallback } from 'react';
import { practiceApi, PracticeReport } from '@/services/practice';
import { toast } from 'sonner';

export function useCompleteUnitPractice() {
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<PracticeReport | null>(null);

  const completePractice = useCallback(async (sessionId: number, unansweredCount: number) => {
    if (unansweredCount > 0) {
      const confirm = window.confirm(`还有 ${unansweredCount} 道题未回答，确定要结束练习吗？`);
      if (!confirm) return null;
    }

    try {
      setSubmitting(true);
      const result = await practiceApi.completePractice(sessionId);
      setReport(result);
      return result;
    } catch (error) {
      console.error('Failed to complete practice:', error);
      const errorMessage = error instanceof Error ? error.message : '完成练习失败';
      toast.error(errorMessage);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitting,
    report,
    completePractice,
  };
}

