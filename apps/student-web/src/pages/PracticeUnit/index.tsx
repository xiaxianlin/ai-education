import { PageModel } from "./models/page";
import { TextbookUnits } from "./views/TextbookUnits";

export default function UnitPractice() {
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
        <TextbookUnits />
      </div>
    </PageModel.Provider>
  );
}
