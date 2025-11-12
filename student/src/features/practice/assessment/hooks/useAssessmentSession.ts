import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { practiceApi, AssessmentNextQuestion } from '@/services/practice';
import { toast } from 'sonner';

export function useAssessmentSession() {
  const { assessmentId } = useParams({ from: '/assessment/$assessmentId' });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [nextQuestionData, setNextQuestionData] = useState<AssessmentNextQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeStarted, setTimeStarted] = useState(Date.now());

  useEffect(() => {
    if (assessmentId) {
      loadNextQuestion();
    }
  }, [assessmentId]);

  const loadNextQuestion = useCallback(async () => {
    try {
      setLoading(true);
      setUserAnswer('');
      setShowResult(false);
      setTimeStarted(Date.now());

      const data = await practiceApi.getNextAssessmentQuestion(Number(assessmentId));

      if (!data) {
        // 没有下一题，评测结束
        return null;
      } else {
        setNextQuestionData(data);
        return data;
      }
    } catch (error) {
      console.error('Failed to load next question:', error);
      const errorMessage = error instanceof Error ? error.message : '加载题目失败';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (showResult || submitting || !nextQuestionData) return;

      setUserAnswer(answer);
      setSubmitting(true);
      const timeSpent = Math.round((Date.now() - timeStarted) / 1000);

      try {
        const result = await practiceApi.submitAssessmentAnswer({
          assessment_id: Number(assessmentId),
          question_id: nextQuestionData.question.id,
          answer,
          time_spent: timeSpent,
        });

        setShowResult(true);
        toast.success(result.is_correct ? '回答正确！' : '回答错误。');

        // 自动加载下一题（延迟2秒让学生看结果）
        setTimeout(async () => {
          const nextData = await loadNextQuestion();
          if (!nextData) {
            // 没有下一题，触发完成评测
            navigate({ to: `/assessment/${assessmentId}/complete` });
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to submit answer:', error);
        const errorMessage = error instanceof Error ? error.message : '提交答案失败';
        toast.error(errorMessage);
        setSubmitting(false);
      }
    },
    [showResult, submitting, nextQuestionData, timeStarted, assessmentId, loadNextQuestion, navigate]
  );

  return {
    loading,
    nextQuestionData,
    userAnswer,
    showResult,
    submitting,
    handleAnswer,
    loadNextQuestion,
  };
}

