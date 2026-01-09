import { PracticeCardProps } from "../types";
import { CompleteCard } from "./CompleteCard";
import { GeneratingCard } from "./GeneratingCard";
import { PracticingCard } from "./PracticingCard";
import { WaitCard } from "./WaitCard";
import { PracticeGenerateStatus, PracticeStatus } from "@ai-education/shared-web";

export function UnitPracticeCard({ unit, practice }: PracticeCardProps) {
  if (!practice) {
    return <WaitCard unit={unit} />;
  }

  if (practice.generate_status === PracticeGenerateStatus.GENERATING) {
    return <GeneratingCard unit={unit} />;
  }

  switch (practice.status) {
    case PracticeStatus.READY:
    case PracticeStatus.PRACTICING:
      return <PracticingCard unit={unit} practice={practice} />;
    case PracticeStatus.COMPLETED:
      return <CompleteCard unit={unit} practice={practice} />;
  }
}
