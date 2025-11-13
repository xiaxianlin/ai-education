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
      
      // 解析已提交的答案，恢复进度
      if (data.session.answers) {
        try {
          const answers = JSON.parse(data.session.answers);
          const restoredAnswers: Record<number, string> = {};
          const restoredResults: Record<number, boolean> = {};
          
          // 恢复已提交的答案
          Object.entries(answers).forEach(([questionIdStr, answerData]: [string, any]) => {
            const questionId = parseInt(questionIdStr);
            if (answerData.answer) {
              restoredAnswers[questionId] = answerData.answer;
            }
            if (answerData.is_correct !== undefined) {
              restoredResults[questionId] = answerData.is_correct;
            }
          });
          
          setUserAnswers(restoredAnswers);
          setAnswerResults(restoredResults);
          
          // 找到第一个未回答的题目，如果没有则跳转到最后一题
          let targetIndex = 0;
          if (data.questions && data.questions.length > 0) {
            const firstUnansweredIndex = data.questions.findIndex(
              (q) => !restoredResults[q.id]
            );
            if (firstUnansweredIndex !== -1) {
              targetIndex = firstUnansweredIndex;
            } else {
              // 所有题目都已回答，跳转到最后一题
              targetIndex = data.questions.length - 1;
            }
          }
          setCurrentQuestionIndex(targetIndex);
        } catch (parseError) {
          console.error('Failed to parse answers:', parseError);
        }
      }
      
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
  const answeredCount = Object.keys(answerResults).length;

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

