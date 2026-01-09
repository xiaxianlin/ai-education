import { Button } from "@/components/ui";
import { PracticeStateCard } from "@/components/biz/PracticeStateCard";
import { memo } from "react";
import { usePageModel } from "../models/page";

interface UnitPracticeCardProps {
  unit: Unit;
}

export const UnitPracticeCard = memo(function UnitPracticeCard({ unit }: UnitPracticeCardProps) {
  const { setUnit } = usePageModel();

  return (
    <PracticeStateCard
      type="unit_practice"
      unit={unit}
      extra={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUnit(unit)}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
        >
          知识点
        </Button>
      }
    />
  );
});
