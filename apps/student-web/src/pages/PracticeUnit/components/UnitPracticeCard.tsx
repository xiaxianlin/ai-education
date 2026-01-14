import { PracticeStateCard } from "@/components/biz/PracticeStateCard";
import { memo } from "react";

interface UnitPracticeCardProps {
  unit: Unit;
}

export const UnitPracticeCard = memo(function UnitPracticeCard({ unit }: UnitPracticeCardProps) {
  return <PracticeStateCard type="unit_practice" unit={unit} />;
});
