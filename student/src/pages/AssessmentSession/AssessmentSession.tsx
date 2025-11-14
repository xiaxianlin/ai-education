import { useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { ChevronLeft, Brain } from 'lucide-react';
import { LoadingSpinner } from '@/components/biz/LoadingSpinner';
import { useAssessmentSession } from './hooks/useAssessmentSession';
import { useCompleteAssessment } from './hooks/useCompleteAssessment';
import { AssessmentProgress } from './components/AssessmentProgress';
import { AssessmentReport } from './components/AssessmentReport';
import { QuestionCard } from '@/pages/DailyPractice/components/QuestionCard';
import { AnswerOptions } from '@/pages/DailyPractice/components/AnswerOptions';
import { NavigationButtons } from '@/pages/DailyPractice/components/NavigationButtons';

export function AssessmentSession() {
  const { assessmentId } = useParams({ from: '/assessment/$assessmentId' });
  const navigate = useNavigate();

  const {
    loading,
    nextQuestionData,
    userAnswer,
    showResult,
    submitting,
    isCorrect,
    handleAnswerChange,
    handleSubmitAnswer,
    goToNextQuestion,
    loadNextQuestion,
  } = useAssessmentSession();

  const { report, completeAssessment } = useCompleteAssessment();

  // 检查是否需要完成评测
  useEffect(() => {
    if (!loading && !nextQuestionData && !report && assessmentId) {
      completeAssessment(Number(assessmentId));
    }
  }, [loading, nextQuestionData, report, assessmentId, completeAssessment]);

  if (loading && !nextQuestionData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <LoadingSpinner size="lg" text="加载评测中..." />
        </div>
      </div>
    );
  }

  if (report) {
    return (
      <>
        <Header />
        <AssessmentReport report={report} />
      </>
    );
  }

  if (!nextQuestionData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">评测会话不存在</h2>
          <Button onClick={() => navigate({ to: '/assessment' })} className="mt-4">
            返回能力评测
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 头部信息 */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/assessment' })}
            className="flex items-center gap-1 text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span className="text-lg font-semibold text-gray-700">能力评测</span>
          </div>
        </div>

        {/* 进度和能力指标 */}
        <AssessmentProgress questionData={nextQuestionData} />

        {/* 题目卡片 */}
        <QuestionCard
          question={nextQuestionData.question}
          index={nextQuestionData.answered_count}
          hasAnswered={showResult}
          isCorrect={isCorrect}
        />

        {/* 答题选项 */}
        <AnswerOptions
          question={nextQuestionData.question}
          answer={userAnswer}
          hasAnswered={showResult}
          isCorrect={isCorrect}
          onAnswerChange={handleAnswerChange}
        />

        {/* 导航按钮 */}
        <NavigationButtons
          canGoPrevious={false}
          canGoNext={showResult}
          hasAnswered={showResult}
          hasAnswer={!!userAnswer}
          submitting={submitting}
          isLastQuestion={nextQuestionData.progress.current >= nextQuestionData.progress.max}
          onPrevious={() => {}}
          onNext={goToNextQuestion}
          onSubmit={handleSubmitAnswer}
          onComplete={async () => {
            await completeAssessment(Number(assessmentId));
          }}
        />
      </div>
    </div>
  );
}

