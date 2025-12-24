import { useProfileModel } from "@/common/models/ProfileModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { PageModel } from "./models/page";
import { UnitPracticeModel } from "./models/unit_practice";
import { KnowledgeModal } from "./views/KnowledgeModal";
import { TextbookUnits } from "./views/TextbookUnits";

export default function UnitPractice() {
  const { activeTextbooks } = useProfileModel();
  return (
    <PageModel.Provider>
      <div className="space-y-8 animate-springy">
        {/* 顶部介绍卡片 */}
        <section className="bg-white rounded-[2rem] p-8 border-4 border-white shadow-xl shadow-primary/5 flex items-center gap-6">
          <div className="text-6xl animate-float select-none">📚</div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">单元练习</h1>
            <p className="text-lg font-bold text-muted-foreground italic">专项突破，攻克每一个知识核心！🚀</p>
          </div>
        </section>

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
              <UnitPracticeModel.Provider initialState={textbook}>
                <TextbookUnits />
              </UnitPracticeModel.Provider>
            </TabsContent>
          ))}
        </Tabs>

        {/* 弹窗组件 */}
        <KnowledgeModal />
      </div>
    </PageModel.Provider>
  );
}
