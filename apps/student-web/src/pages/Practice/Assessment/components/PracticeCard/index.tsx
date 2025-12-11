import { GeneratingCard } from "./GeneratingCard";
import { WaitCard } from "./WaitCard";
import { PracticingCard } from "./PracticingCard";
import { useAssessmentPractice } from "../../hooks/useAssessmentPractice";
import { PracticeStatus } from "../../../constants";
import { CompleteCard } from "./CompleteCard";
import { PracticeCardProps } from "./types";

export function PracticeCard({ textbook }: PracticeCardProps) {
  const { practice, status, loading, createPractice, shouldCreate } = useAssessmentPractice(textbook.id);

  switch (status) {
    case PracticeStatus.WAIT:
      return <WaitCard textbook={textbook} loading={loading} onCreate={createPractice} />;
    case PracticeStatus.GENERATING:
      return <GeneratingCard textbook={textbook} />;
    case PracticeStatus.READY:
    case PracticeStatus.PRACTICING:
      return <PracticingCard textbook={textbook} practice={practice!} />;
    case PracticeStatus.COMPLETED:
      return (
        <CompleteCard
          practice={practice!}
          textbook={textbook}
          shouldCreate={shouldCreate}
          onCreate={createPractice}
          loading={loading}
        />
      );
  }
}
