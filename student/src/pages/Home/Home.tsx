/**
 * 首页
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Header } from "@/components/layout/Header";
import { TextbookSetupModal } from "@/components/TextbookSetupModal";
import { LoadingSpinner } from "@/components/biz/LoadingSpinner";
import { useHomePage } from "./hooks/useHomePage";
import { WelcomeCard } from "./components/WelcomeCard";
import { DailyPracticeCard } from "./components/DailyPracticeCard";
import { AssessmentCard } from "./components/AssessmentCard";
import { UnitPracticeCard } from "./components/UnitPracticeCard";
import { QuickActions } from "./components/QuickActions";

export function Home() {
  const {
    showTextbookModal,
    checking,
    stats,
    dailyPracticeStatus,
    dailyPracticeSession,
    assessmentStatus,
    assessmentSession,
    unitPracticeStatus,
    unitPracticeSession,
    createDailyPractice,
    createAssessment,
    closeTextbookModal,
  } = useHomePage();

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在加载..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 pb-12">
      <Header />
      {showTextbookModal && <TextbookSetupModal onClose={closeTextbookModal} />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 欢迎区域 */}
        <WelcomeCard stats={stats} />

        {/* 主要内容区域 */}
        <div className="mt-8 space-y-6">
          {/* 每日练习卡片 */}
          <DailyPracticeCard
            status={dailyPracticeStatus}
            session={dailyPracticeSession}
            onCreate={createDailyPractice}
          />

          {/* 单元练习卡片 */}
          <UnitPracticeCard
            status={unitPracticeStatus}
            session={unitPracticeSession}
          />

          {/* 能力评测卡片 */}
          <AssessmentCard
            status={assessmentStatus}
            session={assessmentSession}
            onCreate={createAssessment}
          />

          {/* 快速操作 */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
