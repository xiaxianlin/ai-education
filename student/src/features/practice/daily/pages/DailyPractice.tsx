/**
 * 每日练习页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useDailyPracticePage } from '../hooks/useDailyPracticePage';
import { PracticeStatusCard } from '../components/PracticeStatusCard';
import { DailyPracticeStats } from '../components/DailyPracticeStats';

export function DailyPractice() {
  const {
    loading,
    session,
    status,
    progress,
    handleStartPractice,
  } = useDailyPracticePage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <LoadingSpinner size="lg" text="检查今日练习..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 练习状态卡片 */}
        <PracticeStatusCard
          status={status}
          progress={progress}
          sessionId={session?.id || null}
          onStart={handleStartPractice}
        />

        {/* 统计信息 */}
        {status === 'ready' && (
          <DailyPracticeStats
            todayProgress={60}
            dailyQuestions={12}
            completedQuestions={7}
          />
        )}
      </div>
    </div>
  );
}

