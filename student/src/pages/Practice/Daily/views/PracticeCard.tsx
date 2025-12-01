import { practiceService } from "@/services/practice";
import { useRequest } from "ahooks";
import { GeneratingCard } from "../components/GeneratingCard";
import { CompleteCard } from "../components/CompleteCard";
import { WaitCard } from "../components/WaitCard";

interface PracticeCardProps {
  textbook: Textbook;
  practice?: PracticeSession;
}

export function PracticeCard({ textbook, practice }: PracticeCardProps) {
  const { loading, run: createPractice } = useRequest(
    () => practiceService.createPractice("daily_practice", textbook.id),
    { manual: true }
  );

  if (!practice) {
    return <WaitCard onCreate={createPractice} />;
  }

  const generating = loading || practice.generate_status === 0;

  if (generating) {
    return <GeneratingCard />;
  }

  return <CompleteCard session={practice} />;
}
