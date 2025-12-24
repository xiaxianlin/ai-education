import { CompleteCard } from "../components/CompleteCard";
import { GeneratingCard } from "../components/GeneratingCard";
import { PracticingCard } from "../components/PracticingCard";
import { WaitCard } from "../components/WaitCard";
import { usePageModel } from "../models/page";

export function PracticeCard({ textbook }: { textbook: Textbook }) {
  const { practices } = usePageModel();

  const practice = practices.find((p) => p.textbook_id === textbook.id);
  if (!practice) {
    return <WaitCard textbook={textbook} />;
  }

  if (practice.generate_status === PracticeGenerateStatus.GENERATING) {
    return <GeneratingCard textbook={textbook} />;
  }

  switch (practice.status) {
    case PracticeSessionStatus.READY:
    case PracticeSessionStatus.PRACTICING:
      return <PracticingCard textbook={textbook} practice={practice!} />;
    case PracticeSessionStatus.COMPLETED:
      return <CompleteCard practice={practice!} textbook={textbook} />;
  }
}
