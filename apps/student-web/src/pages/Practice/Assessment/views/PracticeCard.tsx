import { CompleteCard } from "../components/CompleteCard";
import { GeneratingCard } from "../components/GeneratingCard";
import { PracticingCard } from "../components/PracticingCard";
import { WaitCard } from "../components/WaitCard";
import { usePageModel } from "../models/page";
import dayjs from "dayjs";
import { useMemo } from "react";

export function PracticeCard({ textbook }: { textbook: Textbook }) {
  const { practices } = usePageModel();

  const practice = practices.find((p) => p.textbook_id === textbook.id);

  // 判断是否可以创建新评估（30天限制）
  const shouldCreate = useMemo(() => {
    if (!practice) {
      return true;
    }

    // 如果练习未完成，则不能创建新的评估
    if (practice.status !== PracticeSessionStatus.COMPLETED) {
      return false;
    }

    // 最近一次完成评估的时间
    const completedTime = dayjs((practice.update_time || 0) * 1000);

    // 如果最近一次完成评估的时间在30天前，则可以创建新的评估
    return completedTime.isBefore(dayjs().subtract(30, "day"));
  }, [practice]);

  if (!practice) {
    return <WaitCard textbook={textbook} />;
  }

  if (practice.generate_status === PracticeGenerateStatus.GENERATING) {
    return <GeneratingCard textbook={textbook} />;
  }

  switch (practice.status) {
    case PracticeSessionStatus.READY:
    case PracticeSessionStatus.PRACTICING:
      return <PracticingCard textbook={textbook} practice={practice} />;
    case PracticeSessionStatus.COMPLETED:
      return <CompleteCard practice={practice} textbook={textbook} shouldCreate={shouldCreate} />;
  }
}

