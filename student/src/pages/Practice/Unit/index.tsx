/**
 * 单元练习页面
 * 参考 Daily 练习页面结构，简化逻辑
 */
import { useProfileStore } from "@/stores/profile-store";
import { SubjectTabs } from "@/components/business/SubjectTab";
import { Card, CardContent } from "@/components/ui/card";
import { useRequest } from "ahooks";
import { practiceService } from "@/services/practice";
import { TextbookUnitsSection } from "./views/TextbookUnitsSection";
import { KnowledgeModal } from "./views/KnowledgeModal";
import { useUnitPracticePage } from "./hooks/useUnitPracticePage";

export default function UnitPractice() {
  const activeTextbooks = useProfileStore(
    (state) => state.activeTextbooks || []
  );

  // 获取单元练习列表
  const { data: practices = [] } = useRequest(practiceService.getUnitPractice);

  const {
    knowledgeModal,
    openKnowledgeModal,
    closeKnowledgeModal,
  } = useUnitPracticePage();

  return (
    <div>
      {/* 顶部介绍卡片 */}
      <Card className="border-none shadow-md rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
        <CardContent className="p-6 sm:p-7">
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

      {/* 未选择教材的空状态提示 */}
      {!activeTextbooks.length && (
        <Card className="border-none bg-muted/30 shadow-md rounded-3xl">
          <CardContent className="py-10 px-6 sm:px-8 text-center space-y-3">
            <div className="text-5xl mb-1">📖</div>
            <p className="text-xl font-bold text-foreground">
              还没有选教材呢
            </p>
            <p className="text-sm text-muted-foreground">
              去设置里选择你的学习教材，系统就能为你生成单元练习啦～
            </p>
          </CardContent>
        </Card>
      )}

      {/* 主体：按学科分组的单元卡片 */}
      <SubjectTabs className="my-2">
        {(subject) => {
          const textbooks = activeTextbooks.filter(
            (t) => t.subject === subject
          );

          return (
            <div key={subject} className="space-y-6">
              {textbooks.map((textbook) => (
                <TextbookUnitsSection
                  key={textbook.id}
                  textbook={textbook}
                  practices={practices}
                  onShowKnowledge={openKnowledgeModal}
                />
              ))}
            </div>
          );
        }}
      </SubjectTabs>

      {/* 知识点弹窗 */}
      <KnowledgeModal
        open={knowledgeModal.open}
        unitName={knowledgeModal.unitName}
        knowledges={knowledgeModal.knowledges}
        loading={knowledgeModal.loading}
        onClose={closeKnowledgeModal}
      />
    </div>
  );
}
