import { useCreatePracticeTask } from "@/hooks";
import { GeneratingCard } from "../components/GeneratingCard";
import { CompleteCard } from "../components/CompleteCard";
import { WaitCard } from "../components/WaitCard";
import { PracticingCard } from "../components/PracticingCard";
import { GRADES } from "@/constants/profile";
import { PracticeCardStateModel } from "../../shared/models/practice-card-state";
import { PracticeCardStatus } from "../../shared/types/practice-card";

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

  return (
    <PracticeCardStateModel.Provider
      initialState={{
        practice,
        practiceType: "assessment",
        isCreating: loading,
      }}
    >
      <PracticeCardBody title={textbookTitle} onCreate={handleCreate} />
    </PracticeCardStateModel.Provider>
  );
}

function PracticeCardBody({
  title,
  onCreate,
}: {
  title: string;
  onCreate: () => void;
}) {
  const state = PracticeCardStateModel.useContainer();
  const practice = state.practice;

  if (state.status === PracticeCardStatus.GENERATING) {
    return <GeneratingCard title={title} />;
  }

  switch (state.status) {
    case PracticeCardStatus.WAIT_TO_GENERATE:
      return <WaitCard title={title} onCreate={onCreate} loading={false} />;
    case PracticeCardStatus.READY_TO_PRACTICE:
    case PracticeCardStatus.IN_PROGRESS:
      return (
        <PracticingCard
          session={practice!}
          textbookTitle={title}
        />
      );
    case PracticeCardStatus.COMPLETED:
    default:
      return (
        <CompleteCard
          session={practice!}
          textbookTitle={title}
          onRegenerate={onCreate}
        />
      );
  }
}
