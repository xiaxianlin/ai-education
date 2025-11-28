/**
 * 首页
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { WelcomeCard } from "./views/WelcomeCard";
import { PracticeCard } from "./views/PracticeCard";
import { QuickActions } from "./views/QuickActions";

export default function Home() {
  return (
    <div>
      {/* 欢迎区域 */}
      <WelcomeCard />
      {/* 主要内容区域 */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold text-foreground px-2">🚀 开始练习</h2>
        {/* 练习卡片区域 - 并排一行 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 每日练习卡片 */}
          <PracticeCard title="每日练习" description="快来开始今天的练习吧！✨" buttonText="去练习" icon="📆" path="/practice/daily" />
          {/* 单元练习卡片 */}
          <PracticeCard title="单元练习" description="选择单元开始练习，巩固知识点！✨" buttonText="选择单元" icon="📚" path="/practice/unit" />
          {/* 综合评估卡片 */}
          <PracticeCard title="综合评估" description="让AI帮你找到学习的方向！✨" buttonText="去练习" icon="🎯" path="/practice/assessment" />
        </div>
        {/* 快速操作 */}
        <QuickActions />
      </div>
    </div>
  );
}
