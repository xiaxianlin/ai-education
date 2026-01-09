import { PracticeStateCard } from "@/components/biz/PracticeStateCard";
import { usePageModel } from "../models/page";

interface UnitPracticeCardProps {
  unit: Unit;
}

export function UnitPracticeCard({ unit }: UnitPracticeCardProps) {
  const { setUnit } = usePageModel();

  return (
    <PracticeStateCard
      type="unit"
      unit={unit}
      showKnowledgeButton
      onKnowledgeClick={setUnit}
    />
  );
}
