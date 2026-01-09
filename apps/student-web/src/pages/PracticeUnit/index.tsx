import { useProfileModel } from "@/common/models/ProfileModel";
import { useMemo } from "react";
import { PageModel } from "./models/page";
import { UnitPracticeModel } from "./models/unit_practice";
import { KnowledgeModal } from "./views/KnowledgeModal";
import { TextbookUnits } from "./views/TextbookUnits";

export default function UnitPractice() {
  return (
    <PageModel.Provider>
      <UnitPracticeContent />
    </PageModel.Provider>
  );
}

function UnitPracticeContent() {
  const { activeTextbooks, profile } = useProfileModel();
  const { grade, subject, semester } = profile || {};

  // 根据年级、学科（当前设置的学科）、学期过滤教材
  const matchedTextbooks = useMemo(() => {
    if (!grade || !subject || !semester) return [];

    return activeTextbooks.filter((t) => t.grade === grade && t.subject === subject && t.semester === semester);
  }, [activeTextbooks, grade, subject, semester]);

  return (
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
      {matchedTextbooks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">暂无匹配的教材</p>
          <p className="text-sm mt-2">请先设置您的年级、学科和学期</p>
        </div>
      ) : (
        <div className="space-y-8">
          {matchedTextbooks.map((textbook) => (
            <div key={textbook.id} className="space-y-4">
              <UnitPracticeModel.Provider initialState={textbook}>
                <TextbookUnits />
              </UnitPracticeModel.Provider>
            </div>
          ))}
        </div>
      )}

      {/* 弹窗组件 */}
      <KnowledgeModal />
    </div>
  );
}
