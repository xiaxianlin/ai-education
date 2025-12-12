import { GeneratingCard } from "./GeneratingCard";
import { WaitCard } from "./WaitCard";
import { PracticingCard } from "./PracticingCard";
import { useUnitPractice } from "../../hooks/useUnitPractice";
import { PracticeStatus } from "../../../constants";
import { CompleteCard } from "./CompleteCard";
import { useMemo } from "react";
import { ConfirmModal } from "./ConfirmModal";

export interface PracticeCardProps {
  unit: Unit;
  textbook: Textbook;
}

export function PracticeCard({ unit, textbook }: PracticeCardProps) {
  const { practice, status, loading, visible, showConfirmModal, hideConfirmModal, createPractice } = useUnitPractice(
    unit,
    textbook,
  );

  const card = useMemo(() => {
    switch (status) {
      case PracticeStatus.WAIT:
        return <WaitCard unit={unit} onCreate={showConfirmModal} />;
      case PracticeStatus.GENERATING:
        return <GeneratingCard unit={unit} />;
      case PracticeStatus.READY:
      case PracticeStatus.PRACTICING:
        return <PracticingCard unit={unit} practice={practice!} />;
      case PracticeStatus.COMPLETED:
        return <CompleteCard unit={unit} practice={practice!} onCreate={showConfirmModal} />;
    }
  }, [status]);

  return (
    <>
      {card}
      <ConfirmModal
        unit={unit}
        loading={loading}
        visible={visible}
        onConfirm={createPractice}
        onCancel={hideConfirmModal}
      />
    </>
  );
}
