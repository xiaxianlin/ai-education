import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { QuestionCard } from '../../daily/components/QuestionCard';
import { AnswerOptions } from '../../daily/components/AnswerOptions';
import { NavigationButtons } from '../../daily/components/NavigationButtons';
import { useUnitPracticeSession } from '../hooks/useUnitPracticeSession';
import { useCompleteUnitPractice } from '../hooks/useCompleteUnitPractice';
import { UnitProgressIndicator } from '../components/UnitProgressIndicator';
import { UnitResultModal } from '../components/UnitResultModal';

export function UnitPracticeSession() {
  const {
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
  const isCorrect = answerResults[currentQuestion.id];

  const handleComplete = async () => {
    const unansweredCount = totalQuestions - answeredCount;
    await completePractice(sessionData.session.id, unansweredCount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <UnitProgressIndicator
          unitName={sessionData.unit.name}
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
        />

        <QuestionCard question={currentQuestion} index={currentQuestionIndex} />

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
            hasAnswer={!!currentAnswer}
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

