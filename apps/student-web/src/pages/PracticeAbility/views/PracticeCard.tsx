import { useProfileModel } from "@/common/models/ProfileModel";
import { PracticeGenerateStatus, PracticeStatus } from "@ai-education/shared-web";
import { useMemo } from "react";
import { CompleteCard } from "../components/CompleteCard";
import { GeneratingCard } from "../components/GeneratingCard";
import { PracticingCard } from "../components/PracticingCard";
import { WaitCard } from "../components/WaitCard";
import { useAbilityPractice } from "../hooks/useAbilityPractice";
import { usePageModel } from "../models/page";

export function PracticeCard({ abilityCode }: { abilityCode: string }) {
  const { practice, loading, creating, createPractice, canCreate } = useAbilityPractice(abilityCode);
  const { activeTextbook } = useProfileModel();
  const { atomicsBySubject } = usePageModel();

  // 从 abilityCode 找到对应的 AbilityAtomic，以获取 subject 和 grade
  const atomic = useMemo(() => {
    for (const atomics of Object.values(atomicsBySubject)) {
      const found = atomics.find((a) => a.code === abilityCode);
      if (found) return found;
    }
    return null;
  }, [atomicsBySubject, abilityCode]);

  // 从 practice 或 atomic 找到对应的 textbook
  const textbook = useMemo(() => {
    let subject: string | undefined;
    let grade: number | undefined;

    if (practice?.subject && practice?.grade) {
      subject = practice.subject;
      grade = practice.grade;
    } else if (atomic) {
      subject = atomic.subject;
      grade = atomic.grade;
    }

    if (subject && grade && activeTextbook) {
      // 检查 activeTextbook 是否匹配
      if (activeTextbook.subject === subject && activeTextbook.grade === grade) {
        return activeTextbook;
      }
    }
    return null;
  }, [practice, atomic, activeTextbook]);

  if (loading) {
    // 加载中状态，可以显示一个加载卡片
    return null;
  }

  if (!practice) {
    // 如果没有练习，显示 WaitCard
    return <WaitCard textbook={textbook || undefined} createPractice={createPractice} creating={creating} canCreate={canCreate} />;
  }

  if (practice.generate_status === PracticeGenerateStatus.GENERATING) {
    if (!textbook) return null;
    return <GeneratingCard textbook={textbook} />;
  }

  if (!textbook) return null;

  switch (practice.status) {
    case PracticeStatus.READY:
    case PracticeStatus.PRACTICING:
      if (!textbook) return null;
      return <PracticingCard textbook={textbook} practice={practice} />;
    case PracticeStatus.COMPLETED:
      if (!textbook) return null;
      return <CompleteCard practice={practice} textbook={textbook} />;
    default:
      return null;
  }
}
