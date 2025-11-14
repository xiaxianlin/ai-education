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
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);

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
      setIsCorrect(undefined);
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

  // 将选项标签（A、B、C）转换为选项文本
  const convertAnswerToText = useCallback((answer: string, question: any): string => {
    if (!question || !question.options) return answer;

    try {
      const options: Array<string | { label: string; text: string }> = JSON.parse(question.options);
      
      // 如果是选项标签（A、B、C等），转换为选项文本
      if (answer.length === 1 && answer >= 'A' && answer <= 'Z') {
        const index = answer.charCodeAt(0) - 65;
        if (index >= 0 && index < options.length) {
          const option = options[index];
          return typeof option === 'object' && option !== null && 'text' in option
            ? option.text
            : String(option);
        }
      }
      
      return answer;
    } catch {
      // 如果解析失败，直接返回原答案
      return answer;
    }
  }, []);

  const handleAnswerChange = useCallback((answer: string, audioUrl?: string) => {
    if (showResult || submitting || !nextQuestionData) return;
    setUserAnswer(answer);
  }, [showResult, submitting, nextQuestionData]);

  const handleSubmitAnswer = useCallback(
    async (answerOverride?: string) => {
      const answerToUse = answerOverride || userAnswer;
      if (showResult || submitting || !nextQuestionData || !answerToUse) {
        if (!answerToUse) {
          toast.error('请先选择答案');
        }
        return;
      }

      setSubmitting(true);
      const timeSpent = Math.round((Date.now() - timeStarted) / 1000);

      // 将答案转换为选项文本（如果需要）
      const answerToSubmit = convertAnswerToText(answerToUse, nextQuestionData.question);

      try {
        const result = await practiceApi.submitAssessmentAnswer({
          assessment_id: Number(assessmentId),
          question_id: nextQuestionData.question.id,
          answer: answerToSubmit,
          time_spent: timeSpent,
        });

        setShowResult(true);
        setIsCorrect(result.is_correct);
        toast.success(result.is_correct ? '回答正确！' : '回答错误。');
      } catch (error) {
        console.error('Failed to submit answer:', error);
        const errorMessage = error instanceof Error ? error.message : '提交答案失败';
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
    [showResult, submitting, nextQuestionData, userAnswer, timeStarted, assessmentId, navigate, convertAnswerToText]
  );

  const goToNextQuestion = useCallback(async () => {
    if (!showResult || submitting) return;
    
    const nextData = await loadNextQuestion();
    if (!nextData) {
      // 没有下一题，触发完成评测
      navigate({ to: `/assessment/${assessmentId}/complete` });
    }
  }, [showResult, submitting, loadNextQuestion, navigate, assessmentId]);

  // 兼容旧的 handleAnswer 接口（直接提交答案）
  const handleAnswer = useCallback(
    async (answer: string) => {
      if (showResult || submitting || !nextQuestionData) return;

      setUserAnswer(answer);
      const answerToSubmit = convertAnswerToText(answer, nextQuestionData.question);
      
      setSubmitting(true);
      const timeSpent = Math.round((Date.now() - timeStarted) / 1000);

      try {
        const result = await practiceApi.submitAssessmentAnswer({
          assessment_id: Number(assessmentId),
          question_id: nextQuestionData.question.id,
          answer: answerToSubmit,
          time_spent: timeSpent,
        });

        setShowResult(true);
        setIsCorrect(result.is_correct);
        toast.success(result.is_correct ? '回答正确！' : '回答错误。');
      } catch (error) {
        console.error('Failed to submit answer:', error);
        const errorMessage = error instanceof Error ? error.message : '提交答案失败';
        toast.error(errorMessage);
        setSubmitting(false);
      }
    },
    [showResult, submitting, nextQuestionData, timeStarted, assessmentId, loadNextQuestion, navigate, convertAnswerToText]
  );

  return {
    loading,
    nextQuestionData,
    userAnswer,
    showResult,
    submitting,
    isCorrect,
    handleAnswer,
    handleAnswerChange,
    handleSubmitAnswer,
    goToNextQuestion,
    loadNextQuestion,
  };
}

