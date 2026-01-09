/**
 * 能力练习卡片组件
 * 显示原子能力信息和练习状态
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { PracticeStateCard } from "@/components/biz/PracticeStateCard";
import { useMemo } from "react";

interface AbilityPracticeCardProps {
  atomic: AbilityAtomic;
}

export function AbilityPracticeCard({ atomic }: AbilityPracticeCardProps) {
  const { activeTextbook } = useProfileModel();

  // 匹配教材
  const textbook = useMemo(() => {
    if (activeTextbook && activeTextbook.subject === atomic.subject && activeTextbook.grade === atomic.grade) {
      return activeTextbook;
    }
    return undefined;
  }, [activeTextbook, atomic.subject, atomic.grade]);

  return (
    <PracticeStateCard type="ability" abilityCode={atomic.code} atomic={atomic} textbook={textbook} />
  );
}
