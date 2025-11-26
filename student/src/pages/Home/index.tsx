/**
 * 首页
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Header } from "@/components/biz/Header";
import { WelcomeCard } from "./views/WelcomeCard";
import { DailyPracticeCard } from "./views/DailyPracticeCard";
import { AssessmentCard } from "./views/AssessmentCard";
import { UnitPracticeCard } from "./views/UnitPracticeCard";
import { QuickActions } from "./views/QuickActions";

export function Home() {
  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 欢迎区域 */}
        <WelcomeCard />

        {/* 主要内容区域 */}
        <div className="mt-8 space-y-6">
          {/* 练习卡片区域 - 并排一行 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 每日练习卡片 */}
            <DailyPracticeCard />

            {/* 单元练习卡片 */}
            <UnitPracticeCard />

            {/* 能力评测卡片 */}
            <AssessmentCard />
          </div>

          {/* 快速操作 */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
