import { studentApi } from "@ai-education/shared-student";
import { useRequest } from "ahooks";
import { GeneratingCard } from "../components/GeneratingCard";
import { CompleteCard } from "../components/CompleteCard";
import { WaitCard } from "../components/WaitCard";
import { GRADES } from "@/constants/profile";

interface PracticeCardProps {
  textbook: Textbook;
  practice?: PracticeSession;
}

export function PracticeCard({ textbook, practice }: PracticeCardProps) {
  const { loading, run: createPractice } = useRequest(
    () => studentApi.createPractice({ type: "assessment", textbook_id: textbook.id }),
    { manual: true }
  );

  const textbookTitle = `${GRADES[textbook.grade]}${textbook.semester}`;

  if (!practice) {
    return <WaitCard title={textbookTitle} onCreate={createPractice} />;
  }

  const generating = loading || practice.generate_status === 0;

  if (generating) {
    return <GeneratingCard title={textbookTitle} />;
  }

  return <CompleteCard session={practice} textbookTitle={textbookTitle} />;
}
