import { useProfileStore } from "@/stores/profile-store";
import { SubjectTabs } from "@/components/business/SubjectTab";
import { Card, CardContent } from "@/components/ui/card";
import { useRequest } from "ahooks";
import { studentApi } from "@ai-education/shared-frontend";
import { PracticeCard } from "./views/PracticeCard";

export default function DailyPractice() {
  const activeTextbooks = useProfileStore(
    (state) => state.activeTextbooks || []
  );

  const { data: practices = [] } = useRequest(studentApi.getDailyPractice);

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

      {/* 未选择教材的空状态提示 */}
      {!activeTextbooks.length && (
        <Card className="border-2 border-accent/50 bg-accent/10 shadow-lg rounded-3xl">
          <CardContent className="py-10 px-6 text-center space-y-3">
            <div className="text-5xl">📖</div>
            <p className="text-xl font-bold text-foreground">还没有选教材呢</p>
            <p className="text-sm text-muted-foreground">
              去设置里选择你的学习教材，系统就能为你生成每日练习啦～
            </p>
          </CardContent>
        </Card>
      )}

      {/* 主体：按学科分组的练习卡片 */}
      <SubjectTabs className="my-2">
        {(subject) => {
          const textbooks = activeTextbooks.filter(
            (t) => t.subject === subject
          );

          return (
            <div key={subject} className="space-y-4">
              <div className="grid grid-cols-2 gap-5">
                {textbooks.map((t) => {
                  const practice = practices.find(
                    (p) => p.textbook_id === t.id
                  );
                  return (
                    <PracticeCard key={t.id} textbook={t} practice={practice} />
                  );
                })}
              </div>
            </div>
          );
        }}
      </SubjectTabs>
    </div>
  );
}
