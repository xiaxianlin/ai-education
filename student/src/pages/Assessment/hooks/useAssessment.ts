/**
 * 能力评测页面逻辑 Hook
 */
import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { practiceApi } from '@/services/practice';
import { toast } from 'sonner';
import { useApiError } from '@/lib/hooks/useApiError';

export function useAssessment() {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [creating, setCreating] = useState(false);

  const handleStartAssessment = useCallback(async () => {
    try {
      setCreating(true);
      const assessment = await practiceApi.createAssessment({
        assessment_type: 'comprehensive',
        max_questions: 20,
        min_questions: 10,
      });
      toast.success('能力评测已创建，开始答题！');
      const sessionId = assessment.session_id ?? assessment.id;
      if (sessionId) {
        navigate({ to: `/practice/${sessionId}` });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setCreating(false);
    }
  }, [navigate, handleError]);

  return {
    creating,
    handleStartAssessment,
  };
}

