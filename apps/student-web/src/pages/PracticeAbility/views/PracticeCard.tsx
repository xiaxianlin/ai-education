import { CompleteCard } from "../components/CompleteCard";
import { GeneratingCard } from "../components/GeneratingCard";
import { PracticingCard } from "../components/PracticingCard";
import { WaitCard } from "../components/WaitCard";
import { usePageModel } from "../models/page";
import { PracticeGenerateStatus, PracticeStatus } from "@ai-education/shared-web";

export function PracticeCard({ textbook }: { textbook: Textbook }) {
  const { practices } = usePageModel();

  // 通过 subject 和 grade 匹配练习（后端按 subject + grade 分组）
  const practice = practices.find(
    (p) => p.subject === textbook.subject && p.grade === textbook.grade
  );
  if (!practice) {
    return <WaitCard textbook={textbook} />;
  }

  if (practice.generate_status === PracticeGenerateStatus.GENERATING) {
    return <GeneratingCard textbook={textbook} />;
  }

  switch (practice.status) {
    case PracticeStatus.READY:
    case PracticeStatus.PRACTICING:
      return <PracticingCard textbook={textbook} practice={practice!} />;
    case PracticeStatus.COMPLETED:
      return <CompleteCard practice={practice!} textbook={textbook} />;
  }
}
