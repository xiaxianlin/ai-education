/**
 * 单元练习卡片
 * 参考 Daily/views/PracticeCard.tsx 结构
 */
import { memo } from "react";
import { WaitCard } from "./WaitCard";
import { GeneratingCard } from "./GeneratingCard";
import { PracticingCard } from "./PracticingCard";
import { CompleteCard } from "./CompleteCard";
import { useUnitPracticeStore } from "../stores/unit-practice-store";
import { PracticeCardStateModel } from "../../shared/models/practice-card-state";
import { PracticeCardStatus } from "../../shared/types/practice-card";

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
  
  const isCurrentUnitGenerating = loading && confirmModal.unitId === unit.id;

  return (
    <PracticeCardStateModel.Provider
      initialState={{
        practice,
        practiceType: "unit_practice",
        isCreating: isCurrentUnitGenerating,
      }}
    >
      <UnitPracticeCardBody
        unit={unit}
        onShowKnowledge={onShowKnowledge}
      />
    </PracticeCardStateModel.Provider>
  );
});

function UnitPracticeCardBody({
  unit,
  onShowKnowledge,
}: {
  unit: Unit;
  onShowKnowledge: (unit: Unit) => void;
}) {
  const { openConfirmModal } = useUnitPracticeStore();
  const state = PracticeCardStateModel.useContainer();
  const practice = state.practice;

  switch (state.status) {
    case PracticeCardStatus.WAIT_TO_GENERATE:
      return <WaitCard unit={unit} onShowKnowledge={onShowKnowledge} />;
    case PracticeCardStatus.GENERATING:
      return <GeneratingCard unit={unit} />;
    case PracticeCardStatus.READY_TO_PRACTICE:
    case PracticeCardStatus.IN_PROGRESS:
      return (
        <PracticingCard
          unit={unit}
          practice={practice!}
          onShowKnowledge={onShowKnowledge}
        />
      );
    case PracticeCardStatus.COMPLETED:
    default:
      return (
        <CompleteCard
          unit={unit}
          practice={practice!}
          onRegenerate={() => openConfirmModal(unit)}
          onShowKnowledge={onShowKnowledge}
        />
      );
  }
}
