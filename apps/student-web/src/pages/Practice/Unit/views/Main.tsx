import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileModel } from "@/models/ProfileModel";
import { TextbookUnits } from "../components/TextbookUnits";
import { KnowledgeModal } from "./KnowledgeModal";

export function MainView() {
  const { activeTextbooks } = useProfileModel();

  return (
    <div>
      {/* 顶部介绍卡片 */}
      <Card className="border-2 border-primary/20 shadow-lg rounded-3xl bg-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="text-4xl">📚</div>单元练习
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              选择你想要练习的单元，AI 将根据该单元内容为你生成专属练习题。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 主体：按教材分组的单元列表 */}
      <Tabs defaultValue={activeTextbooks[0]?.id.toString()}>
        <TabsList className="h-auto rounded-full bg-muted/80 p-1.5 gap-2 border border-border my-3">
          {activeTextbooks.map((textbook) => (
            <TabsTrigger
              key={textbook.id}
              value={textbook.id.toString()}
              className="rounded-full px-6 py-2.5 text-base font-medium text-muted-foreground transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-105 hover:text-primary"
            >
              {textbook.subject} · {textbook.semester}
            </TabsTrigger>
          ))}
        </TabsList>
        {activeTextbooks.map((textbook) => (
          <TabsContent key={textbook.id} value={textbook.id.toString()}>
            <TextbookUnits textbook={textbook} />
          </TabsContent>
        ))}
      </Tabs>

      {/* 弹窗组件 */}
      <KnowledgeModal />
    </div>
  );
}
