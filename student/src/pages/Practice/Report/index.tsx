/**
 * 通用练习结果页面
 * 根据 session_id 显示练习结果
 */
import { Header } from "@/components/business/Header";
import { LoadingSpinner } from "@/components/business/LoadingSpinner";
import { usePracticeResult } from "./hooks/usePracticeResult";
import { ResultSummary } from "./views/ResultSummary";
import { QuestionReview } from "./views/QuestionReview";
import { ActionButtons } from "./views/ActionButtons";

export default function PracticeReport() {
  const { loading, sessionData, unitName, report, error } = usePracticeResult();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <LoadingSpinner size="lg" text="加载结果中..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-lg text-destructive mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return null;
  }

  const sessionType = sessionData.session.session_type;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 结果摘要 */}
        {report && (
          <ResultSummary
            report={report}
            sessionType={sessionType}
            unitName={unitName}
          />
        )}

        {/* 题目回顾 */}
        {sessionData.questions && sessionData.answers && (
          <QuestionReview
            questions={sessionData.questions}
            answers={sessionData.answers}
          />
        )}

        {/* 操作按钮 */}
        <ActionButtons sessionType={sessionType} />
      </div>
    </div>
  );
}
