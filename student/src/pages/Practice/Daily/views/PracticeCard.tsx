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

  const textbookTitle = `${textbook.subject} · ${textbook.grade}年级 ${textbook.semester}`;

  if (!practice) {
    return <WaitCard title={textbookTitle} onCreate={createPractice} />;
  }

  const generating = loading || practice.generate_status === 0;

  if (generating) {
    return <GeneratingCard title={textbookTitle} />;
  }

  return <CompleteCard session={practice} textbookTitle={textbookTitle} />;
}
