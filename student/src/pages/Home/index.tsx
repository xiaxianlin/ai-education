/**
 * 首页
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { WelcomeCard } from "./views/WelcomeCard";
import { DailyPracticeCard } from "./views/DailyPracticeCard";
import { AssessmentCard } from "./views/AssessmentCard";
import { UnitPracticeCard } from "./views/UnitPracticeCard";
import { QuickActions } from "./views/QuickActions";

export default function Home() {
  return (
    <div>
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
  );
}
