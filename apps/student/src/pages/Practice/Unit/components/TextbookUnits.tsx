/**
 * 教材单元区域组件
 * 显示某个教材下的所有单元练习卡片
 */
import { useRequest } from "ahooks";
import { studentApi } from "@ai-education/shared-api-client";
import { UnitPracticeCard } from "./UnitPracticeCard";
import { useUnitPracticeStore } from "../stores/unit-practice-store";

interface TextbookUnitsSectionProps {
  textbook: Textbook;
}

export function TextbookUnits({ textbook }: TextbookUnitsSectionProps) {
  const { practices, openKnowledgeModal } = useUnitPracticeStore();
  const { data: units = [], loading } = useRequest(
    () => studentApi.getTextbookUnits(textbook.id),
    { refreshDeps: [textbook.id] }
  );

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        加载单元中...
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        该教材暂无单元
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {units.map((unit) => {
        // 查找该单元的练习会话
        const practice = practices.find(
          (p) => p.target_id === unit.id && p.textbook_id === textbook.id
        );
        return (
          <UnitPracticeCard
            key={unit.id}
            unit={unit}
            textbook={textbook}
            practice={practice}
            onShowKnowledge={openKnowledgeModal}
          />
        );
      })}
    </div>
  );
}
