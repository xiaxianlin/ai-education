import { useState, useCallback } from 'react';
import { practiceApi, AssessmentReport } from '@/services/practice';
import { toast } from 'sonner';

export function useCompleteAssessment() {
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<AssessmentReport | null>(null);

  const completeAssessment = useCallback(async (assessmentId: number) => {
    try {
      setSubmitting(true);
      const result = await practiceApi.completeAssessment(assessmentId);
      setReport(result);
      toast.success('能力评测完成！');
      return result;
    } catch (error) {
      console.error('Failed to complete assessment:', error);
      const errorMessage = error instanceof Error ? error.message : '完成评测失败';
      toast.error(errorMessage);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitting,
    report,
    completeAssessment,
  };
}

