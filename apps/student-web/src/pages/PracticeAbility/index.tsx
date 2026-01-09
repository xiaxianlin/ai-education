import { Skeleton } from "@/components/ui";
import { AbilityPracticeCard } from "./components/AbilityPracticeCard";
import { PageModel, usePageModel } from "./models/page";

export default function AbilityPractice() {
  return (
    <PageModel.Provider>
      <AbilityPracticeContent />
    </PageModel.Provider>
  );
}

function AbilityPracticeContent() {
  const { atomicsBySubject, subjects, loading } = usePageModel();

  return (
    <div className="space-y-8 animate-springy">
      {/* 顶部介绍卡片 */}
      <section className="bg-white rounded-[2rem] p-8 border-4 border-white shadow-xl shadow-primary/5 flex items-center gap-6">
        <div className="text-6xl animate-float select-none">🎯</div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight">能力练习</h1>
          <p className="text-lg font-bold text-muted-foreground italic">提升核心能力，突破学习瓶颈！🚀</p>
        </div>
      </section>

      {/* 主体：按学科分组的能力练习卡片 */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {subjects.map((subject) => {
            const atomics = atomicsBySubject[subject] || [];
            if (atomics.length === 0) return null;

            return (
              <div key={subject} className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {atomics.map((atomic) => (
                    <AbilityPracticeCard key={atomic.id} atomic={atomic} />
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(atomicsBySubject).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">暂无原子能力数据</p>
              <p className="text-sm mt-2">请先设置您的年级和学科</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
