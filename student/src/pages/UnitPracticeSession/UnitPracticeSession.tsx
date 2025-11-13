import { useNavigate } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/biz/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { QuestionCard } from '../DailyPractice/components/QuestionCard';
import { AnswerOptions } from '../DailyPractice/components/AnswerOptions';
import { NavigationButtons } from '../DailyPractice/components/NavigationButtons';
import { useUnitPracticeSession } from './hooks/useUnitPracticeSession';
import { useCompleteUnitPractice } from './hooks/useCompleteUnitPractice';
import { UnitProgressIndicator } from '../UnitPractice/components/UnitProgressIndicator';
import { UnitResultModal } from '../UnitPractice/components/UnitResultModal';

export function UnitPracticeSession() {
  const navigate = useNavigate();
  const {
    loading,
    sessionData,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    answeredCount,
    userAnswers,
    audioUrls,
    answerResults,
    submitting,
    handleAnswerChange,
    handleSubmitAnswer,
    goToPreviousQuestion,
    goToNextQuestion,
  } = useUnitPracticeSession();

  const { report, completePractice } = useCompleteUnitPractice();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <LoadingSpinner size="lg" text="加载中..." />
        </div>
      </div>
    );
  }

  if (report) {
    return (
      <>
        <Header />
        <UnitResultModal report={report} />
      </>
    );
  }

  if (!sessionData || !currentQuestion) {
    return null;
  }

  const hasAnswered = answerResults[currentQuestion.id] !== undefined;
  const currentAnswer = userAnswers[currentQuestion.id];
  const currentAudioUrl = audioUrls[currentQuestion.id];
  const isCorrect = answerResults[currentQuestion.id];
  const hasAnswer = currentQuestion.type === '口语题' 
    ? !!currentAudioUrl 
    : !!currentAnswer;

  const handleComplete = async () => {
    const unansweredCount = totalQuestions - answeredCount;
    await completePractice(sessionData.session.id, unansweredCount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 返回按钮 */}
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/unit-practice' })}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          返回单元练习
        </Button>

        <UnitProgressIndicator
          unitName={sessionData.unit.name}
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
        />

        <QuestionCard
          question={currentQuestion}
          index={currentQuestionIndex}
          hasAnswered={hasAnswered}
          isCorrect={isCorrect}
        />

        <div className="space-y-6">
          <AnswerOptions
            question={currentQuestion}
            answer={currentAnswer}
            hasAnswered={hasAnswered}
            isCorrect={isCorrect}
            onAnswerChange={handleAnswerChange}
          />

          <NavigationButtons
            canGoPrevious={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < totalQuestions - 1}
            hasAnswered={hasAnswered}
            hasAnswer={hasAnswer}
            submitting={submitting}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
            onPrevious={goToPreviousQuestion}
            onNext={goToNextQuestion}
            onSubmit={handleSubmitAnswer}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
}

