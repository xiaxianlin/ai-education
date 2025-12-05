/**
 * 单元练习卡片
 * 参考 Daily/views/PracticeCard.tsx 结构
 */
import { memo } from "react";
import { useRequest } from "ahooks";
import { studentApi } from "@ai-education/shared-api-client";
import { WaitCard } from "./WaitCard";
import { GeneratingCard } from "./GeneratingCard";
import { InProgressCard } from "./InProgressCard";

interface UnitPracticeCardProps {
  unit: Unit;
  textbook: Textbook;
  practice?: PracticeSession;
  onShowKnowledge: (unit: Unit) => void;
}

export const UnitPracticeCard = memo(function UnitPracticeCard({
  unit,
  textbook,
  practice,
  onShowKnowledge,
}: UnitPracticeCardProps) {
  const { loading, run: createPractice } = useRequest(
    () => studentApi.createPractice({ type: "unit_practice", textbook_id: textbook.id, unit_id: unit.id }),
    { manual: true }
  );

  if (!loading && !practice) {
    return (
      <WaitCard
        unit={unit}
        onShowKnowledge={onShowKnowledge}
        onCreatePractice={createPractice}
      />
    );
  }

  if (loading || practice?.generate_status === 0) {
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
