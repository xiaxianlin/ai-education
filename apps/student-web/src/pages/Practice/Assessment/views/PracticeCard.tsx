import { useCreatePracticeTask } from "@/hooks";
import { GeneratingCard } from "../components/GeneratingCard";
import { CompleteCard } from "../components/CompleteCard";
import { WaitCard } from "../components/WaitCard";
import { GRADES } from "@/constants/profile";

interface PracticeCardProps {
  textbook: Textbook;
  practice?: PracticeSession;
  onRefresh?: () => void;
}

export function PracticeCard({ textbook, practice, onRefresh }: PracticeCardProps) {
  const { loading, createPractice } = useCreatePracticeTask({
    onSuccess: () => {
      // 任务完成后刷新列表
      onRefresh?.();
    },
  });

  const handleCreate = () => {
    createPractice({
      type: "assessment",
      textbook_id: textbook.id,
    });
  };

  const textbookTitle = `${GRADES[textbook.grade]}${textbook.semester}`;

  if (!practice) {
    return <WaitCard title={textbookTitle} onCreate={handleCreate} loading={loading} />;
  }

  const generating = loading || practice.generate_status === 0;

  if (generating) {
    return <GeneratingCard title={textbookTitle} />;
  }

  return <CompleteCard session={practice} textbookTitle={textbookTitle} />;
}
