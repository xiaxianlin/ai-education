import { PracticeCardProps } from "../types";
import { CompleteCard } from "./CompleteCard";
import { GeneratingCard } from "./GeneratingCard";
import { PracticingCard } from "./PracticingCard";
import { WaitCard } from "./WaitCard";

export function UnitPracticeCard({ unit, practice }: PracticeCardProps) {
  if (!practice) {
    return <WaitCard unit={unit} />;
  }

  if (practice.generate_status === PracticeGenerateStatus.GENERATING) {
    return <GeneratingCard unit={unit} />;
  }

  switch (practice.status) {
    case PracticeSessionStatus.READY:
    case PracticeSessionStatus.PRACTICING:
      return <PracticingCard unit={unit} practice={practice} />;
    case PracticeSessionStatus.COMPLETED:
      return <CompleteCard unit={unit} practice={practice} />;
  }
}
