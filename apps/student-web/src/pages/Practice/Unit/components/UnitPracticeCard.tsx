/**
 * 单元练习卡片
 * 参考 Daily/views/PracticeCard.tsx 结构
 */
import { memo } from "react";
import { WaitCard } from "./WaitCard";
import { GeneratingCard } from "./GeneratingCard";
import { InProgressCard } from "./InProgressCard";
import { useUnitPracticeStore } from "../stores/unit-practice-store";

interface UnitPracticeCardProps {
  unit: Unit;
  textbook: Textbook;
  practice?: PracticeSession;
  onShowKnowledge: (unit: Unit) => void;
}

export const UnitPracticeCard = memo(function UnitPracticeCard({
  unit,
  practice,
  onShowKnowledge,
}: UnitPracticeCardProps) {
  const { loading, confirmModal } = useUnitPracticeStore();
  
  // 判断当前单元是否正在生成中
  const isCurrentUnitGenerating = loading && confirmModal.unitId === unit.id;

  if (!practice && !isCurrentUnitGenerating) {
    return (
      <WaitCard
        unit={unit}
        onShowKnowledge={onShowKnowledge}
      />
    );
  }

  if (isCurrentUnitGenerating || practice?.generate_status === 0) {
    return <GeneratingCard unit={unit} />;
  }

  return (
    <InProgressCard
      unit={unit}
      practice={practice!}
      onShowKnowledge={onShowKnowledge}
    />
  );
});
