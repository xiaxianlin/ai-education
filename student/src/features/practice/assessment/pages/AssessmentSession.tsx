import { useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { ChevronLeft, Brain } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useAssessmentSession } from '../hooks/useAssessmentSession';
import { useCompleteAssessment } from '../hooks/useCompleteAssessment';
import { AssessmentProgress } from '../components/AssessmentProgress';
import { AssessmentQuestionCard } from '../components/AssessmentQuestionCard';
import { AssessmentReport } from '../components/AssessmentReport';

export function AssessmentSession() {
  const { assessmentId } = useParams({ from: '/assessment/$assessmentId' });
  const navigate = useNavigate();

  const {
    loading,
    nextQuestionData,
    userAnswer,
    showResult,
    submitting,
    handleAnswer,
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
        <AssessmentQuestionCard
          question={nextQuestionData.question}
          userAnswer={userAnswer}
          showResult={showResult}
          submitting={submitting}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}

