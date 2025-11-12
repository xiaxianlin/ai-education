import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { practiceApi, PracticeSessionDetail } from '@/services/practice';
import { toast } from 'sonner';

export function useUnitPracticeSession() {
  const { sessionId } = useParams({ from: '/unit-practice/$sessionId' });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<PracticeSessionDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [answerResults, setAnswerResults] = useState<Record<number, boolean>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await practiceApi.getPracticeSession(parseInt(sessionId!));
      setSessionData(data);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load session:', error);
      const errorMessage = error instanceof Error ? error.message : '加载练习失败';
      toast.error(errorMessage);
      navigate({ to: '/unit-practice' });
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = sessionData?.questions[currentQuestionIndex];
  const totalQuestions = sessionData?.questions.length || 0;
  const answeredCount = Object.keys(userAnswers).length;

  const handleAnswerChange = useCallback((answer: string) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  }, [currentQuestion]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || !sessionData) return;

    const answer = userAnswers[currentQuestion.id];
    if (!answer) {
      toast.error('请先选择答案');
      return;
    }

    try {
      setSubmitting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const result = await practiceApi.submitAnswer({
        session_id: sessionData.session.id,
        question_id: currentQuestion.id,
        answer,
        time_spent: timeSpent,
      });

      setAnswerResults((prev) => ({
        ...prev,
        [currentQuestion.id]: result.is_correct,
      }));

      toast.success(result.is_correct ? '回答正确！' : '回答错误');

      // 自动进入下一题
      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setStartTime(Date.now());
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      const errorMessage = error instanceof Error ? error.message : '提交答案失败';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [currentQuestion, sessionData, userAnswers, startTime, currentQuestionIndex, totalQuestions]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setStartTime(Date.now());
    }
  }, [currentQuestionIndex]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setStartTime(Date.now());
    }
  }, [currentQuestionIndex, totalQuestions]);

  return {
    loading,
    sessionData,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    answeredCount,
    userAnswers,
    answerResults,
    submitting,
    handleAnswerChange,
    handleSubmitAnswer,
    goToPreviousQuestion,
    goToNextQuestion,
    setStartTime,
  };
}

