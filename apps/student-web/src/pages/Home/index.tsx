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
  const greetingEmojis = ["👋", "😊", "🎈", "🌈", "🎨", "🚀", "🍦"];
  const randomGreeting = greetingEmojis[Math.floor(Math.random() * greetingEmojis.length)];

  return (
    <div className="space-y-8 animate-springy">
      {/* 欢迎区域 */}
      <section className="bg-white rounded-[2rem] p-8 border-4 border-white shadow-xl shadow-primary/5 flex items-center gap-6">
        <div className="text-6xl animate-float select-none">{randomGreeting}</div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight">你好呀，探险家！</h1>
          <p className="text-lg font-bold text-muted-foreground italic">今天想要学习什么新知识呢？✨</p>
        </div>
      </section>

      {/* 主要内容区域 */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-2">
          <div className="w-2 h-10 bg-primary rounded-full" />
          <h2 className="text-3xl font-black text-foreground">我的学习任务</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-[2.5rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {practices.map((practice) => {
              const path = PRACTICE_PATH_MAP[practice.slug];
              return (
                <div key={practice.id} className="animate-springy" style={{ animationDelay: `${practice.id * 100}ms` }}>
                  <PracticeCard
                    title={practice.name}
                    description={practice.description}
                    icon={practice.icon}
                    path={path}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
