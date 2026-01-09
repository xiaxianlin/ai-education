import { useProfileModel } from "@/common/models/ProfileModel";
import { PracticeGenerateStatus, PracticeStatus } from "@ai-education/shared-web";
import { useMemo } from "react";
import { useUnitPractice } from "../hooks/useUnitPractice";
import { PracticeCardProps } from "../types";
import { CompleteCard } from "./CompleteCard";
import { GeneratingCard } from "./GeneratingCard";
import { PracticingCard } from "./PracticingCard";
import { WaitCard } from "./WaitCard";

export function UnitPracticeCard({ unit }: Omit<PracticeCardProps, "practice">) {
  const { practice, loading, creating, createPractice, canCreate } = useUnitPractice(unit.id);
  const { activeTextbook } = useProfileModel();

  // 从 practice 或 unit 找到对应的 textbook
  const textbook = useMemo(() => {
    if (activeTextbook) {
      return activeTextbook;
    }
    return null;
  }, [activeTextbook]);

  if (loading) {
    // 加载中状态，可以显示一个加载卡片
    return null;
  }

  if (!practice) {
    // 如果没有练习，显示 WaitCard
    return (
      <WaitCard
        unit={unit}
        textbook={textbook || undefined}
        createPractice={createPractice}
        creating={creating}
        canCreate={canCreate}
      />
    );
  }

  if (practice.generate_status === PracticeGenerateStatus.GENERATING) {
    if (!textbook) return null;
    return <GeneratingCard unit={unit} textbook={textbook} />;
  }

  if (!textbook) return null;

  switch (practice.status) {
    case PracticeStatus.READY:
    case PracticeStatus.PRACTICING:
      if (!textbook) return null;
      return <PracticingCard unit={unit} practice={practice} textbook={textbook} />;
    case PracticeStatus.COMPLETED:
      if (!textbook) return null;
      return <CompleteCard practice={practice} unit={unit} textbook={textbook} />;
    default:
      return null;
  }
}
