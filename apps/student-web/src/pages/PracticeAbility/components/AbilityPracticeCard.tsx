/**
 * 能力练习卡片组件
 * 显示能力信息和练习状态
 */
import { PracticeStateCard } from "@/components/biz/PracticeStateCard";
import { memo } from "react";

interface AbilityPracticeCardProps {
  atomic: Ability;
}

export const AbilityPracticeCard = memo(function AbilityPracticeCard({ atomic }: AbilityPracticeCardProps) {
  return (
    <PracticeStateCard
      type="ability_practice"
      atomic={atomic}
      extra={
        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-full border border-amber-200">
          {"★".repeat(atomic.difficulty)}
        </span>
      }
    />
  );
});
