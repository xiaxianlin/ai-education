/**
 * 教材单元区域组件
 * 显示某个教材下的所有单元练习卡片
 */
import { useRequest } from "ahooks";
import { textbookService } from "@/services/textbook";
import { UnitPracticeCard } from "./UnitPracticeCard";
import { GRADES } from "@/constants/profile";

interface TextbookUnitsSectionProps {
  textbook: Textbook;
  practices: PracticeSession[];
  onShowKnowledge: (unit: Unit) => void;
}

export function TextbookUnitsSection({
  textbook,
  practices,
  onShowKnowledge,
}: TextbookUnitsSectionProps) {
  // 获取该教材的单元列表
  const { data: units = [], loading } = useRequest(
    () => textbookService.getTextbookUnits(textbook.id),
    {
      refreshDeps: [textbook.id],
    }
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

  const textbookTitle = `${GRADES[textbook.grade]}${textbook.semester}`;

  return (
    <div className="space-y-4">
      {/* 教材标题 */}
      <h3 className="text-lg font-semibold text-foreground px-2">
        {textbookTitle}
      </h3>

      {/* 单元卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              onShowKnowledge={onShowKnowledge}
            />
          );
        })}
      </div>
    </div>
  );
}
