import { useProfileModel } from "@/common/models/ProfileModel";
import { SubjectTabs } from "@/components/biz";
import { PageModel } from "./models/page";
import { PracticeCard } from "./views/PracticeCard";

export default function DailyPractice() {
  const { activeTextbooks } = useProfileModel();

  return (
    <PageModel.Provider>
      <div className="space-y-8 animate-springy">
        {/* 顶部介绍卡片 */}
        <section className="bg-white rounded-[2rem] p-8 border-4 border-white shadow-xl shadow-primary/5 flex items-center gap-6">
          <div className="text-6xl animate-float select-none">📅</div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">日常练习</h1>
            <p className="text-lg font-bold text-muted-foreground italic">保持学习节奏，每天进步一点点！✨</p>
          </div>
        </section>

        {/* 主体：按学科分组的练习卡片 */}
        <SubjectTabs className="my-2">
          {(subject) => {
            return (
              <div key={subject} className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {activeTextbooks
                    .filter((t) => t.subject === subject)
                    .map((t) => (
                      <PracticeCard key={t.id} textbook={t} />
                    ))}
                </div>
              </div>
            );
          }}
        </SubjectTabs>
      </div>
    </PageModel.Provider>
  );
}
