/**
 * 首页
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Header } from '@/components/layout/Header';
import { TextbookSetupModal } from '@/components/TextbookSetupModal';
import { LoadingSpinner } from '@/components/biz/LoadingSpinner';
import { useHomePage } from './hooks/useHomePage';
import { WelcomeCard } from './components/WelcomeCard';
import { StatsCard } from './components/StatsCard';
import { QuickActions } from './components/QuickActions';

export function Home() {
  const {
    showTextbookModal,
    checking,
    stats,
    todayProgress,
    dailyQuestions,
    completedQuestions,
    closeTextbookModal,
  } = useHomePage();

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在加载..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      {showTextbookModal && (
        <TextbookSetupModal onClose={closeTextbookModal} />
      )}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <WelcomeCard stats={stats} />
        <StatsCard
          todayProgress={todayProgress}
          dailyQuestions={dailyQuestions}
          completedQuestions={completedQuestions}
          continuousDays={stats?.current_streak || 0}
          totalPracticeTime={stats?.total_practice_time || 0}
        />
        <QuickActions />
      </div>
    </div>
  );
}

