/**
 * 首页
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { useRequest } from "ahooks";
import { WelcomeCard } from "./views/WelcomeCard";
import { PracticeCard } from "./views/PracticeCard";
import { QuickActions } from "./views/QuickActions";
import { studentApi } from "@/lib/api";
import { Skeleton } from "@/components/ui";

// 练习类型到路径的映射
const PRACTICE_TYPE_PATH_MAP: Record<string, string> = {
  daily_practice: "/practice/daily",
  unit_practice: "/practice/unit",
  assessment: "/practice/assessment",
};

// 默认图标映射
const DEFAULT_ICONS: Record<string, string> = {
  daily_practice: "📆",
  unit_practice: "📚",
  assessment: "🎯",
};

export default function Home() {
  const { data: practices = [], loading } = useRequest(() => studentApi.listPractices());

  // 如果没有练习数据，使用默认的3个系统练习（兼容旧逻辑）
  const displayPractices = practices.length > 0 
    ? practices 
    : [
        { id: 0, name: "日常练习", slug: "daily_practice", practice_type: "daily_practice", description: "快来开始今天的练习吧！✨" },
        { id: 1, name: "单元练习", slug: "unit_practice", practice_type: "unit_practice", description: "选择单元开始练习，巩固知识点！✨" },
        { id: 2, name: "综合评估", slug: "assessment", practice_type: "assessment", description: "让AI帮你找到学习的方向！✨" },
      ];

  return (
    <div>
      {/* 欢迎区域 */}
      <WelcomeCard />
      {/* 主要内容区域 */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold text-foreground px-2">🚀 开始练习</h2>
        {/* 练习卡片区域 - 并排一行 */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {displayPractices.map((practice) => {
              const path = practice.practice_type 
                ? PRACTICE_TYPE_PATH_MAP[practice.practice_type] 
                : `/practice/${practice.slug}`;
              const icon = practice.icon || DEFAULT_ICONS[practice.practice_type || ""] || "📝";
              
              return (
                <PracticeCard
                  key={practice.id}
                  title={practice.name}
                  description={practice.description || "开始练习，提升你的学习能力！✨"}
                  buttonText={practice.practice_type === "unit_practice" ? "选择单元" : "去练习"}
                  icon={icon}
                  path={path}
                />
              );
            })}
          </div>
        )}
        {/* 快速操作 */}
        <QuickActions />
      </div>
    </div>
  );
}
