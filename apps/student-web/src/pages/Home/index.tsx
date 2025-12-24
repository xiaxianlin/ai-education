/**
 * 首页
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { PracticeCard } from "@/components/biz";
import { Skeleton } from "@/components/ui";
import { PRACTICE_PATH_MAP } from "@/lib/constants";

export default function Home() {
  const { practices, loading } = useProfileModel();
  const greetingEmojis = ["👋", "😊", "🎈", "🌈", "🎨"];
  const randomGreeting = greetingEmojis[Math.floor(Math.random() * greetingEmojis.length)];

  return (
    <div>
      {/* 欢迎区域 */}
      <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="text-7xl animate-bounce" style={{ animationDuration: "2s" }}>
              {randomGreeting}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                你好呀！
              </h1>
              <span className="text-lg sm:text-xl text-muted-foreground font-medium">今天也要加油学习哦~ 💪</span>
            </div>
          </div>
        </div>
      </div>
      {/* 主要内容区域 */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {practices.map((practice) => {
              const path = PRACTICE_PATH_MAP[practice.slug];
              return (
                <PracticeCard
                  key={practice.id}
                  title={practice.name}
                  description={practice.description}
                  icon={practice.icon}
                  path={path}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
