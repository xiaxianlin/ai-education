import { SubjectTabs } from "@/components/SubjectTab";
import { Card, CardContent } from "@/components/card";
import { usePageModel } from "@/pages/Practice/Daily/models/PageModel";
import { PracticeCard } from "../components/PracticeCard";

export function MainView() {
  const { textbooks } = usePageModel();

  return (
    <div>
      {/* 顶部介绍卡片 */}
      <Card className="border-2 border-primary/20 shadow-lg rounded-3xl bg-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="text-4xl">📅</div>每日练习
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              根据你已选教材，智能生成当天的练习任务，帮你保持学习节奏。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 主体：按学科分组的练习卡片 */}
      <SubjectTabs className="my-2">
        {(subject) => {
          return (
            <div key={subject} className="space-y-4">
              <div className="grid grid-cols-2 gap-5">
                {textbooks
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
  );
}
