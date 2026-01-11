import { StatCard } from "@/components/biz/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FC } from "react";

interface AbilityAnalysisSectionProps {
  masterySummary: MasterySummary | null | undefined;
  loading?: boolean;
}

export const AbilityAnalysisSection: FC<AbilityAnalysisSectionProps> = ({
  masterySummary,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32 rounded-[2rem]" />
        ))}
      </div>
    );
  }

  if (!masterySummary) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无能力分析数据
      </div>
    );
  }

  const { practiced_abilities, avg_mastery_score, level_distribution } =
    masterySummary;

  const masteredCount = level_distribution.mastered || 0;
  const proficientCount = level_distribution.proficient || 0;
  const beginnerCount = level_distribution.beginner || 0;
  const unlearnedCount = level_distribution.unlearned || 0;

  // 根据平均掌握度确定颜色
  const avgScoreColor =
    avg_mastery_score >= 60 ? "text-green-600" : "text-red-600";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="已练习能力数"
        value={practiced_abilities}
        icon="🎯"
        description="已练习的能力总数"
      />
      <StatCard
        title="平均掌握度"
        value={
          <span className={cn("text-3xl font-black", avgScoreColor)}>
            {avg_mastery_score.toFixed(1)}%
          </span>
        }
        icon="📊"
        description="整体能力掌握度"
      />
      <StatCard
        title="熟练掌握"
        value={masteredCount}
        icon="⭐"
        description="掌握度≥80%的能力"
      />
      <StatCard
        title="基本掌握"
        value={proficientCount}
        icon="✨"
        description="掌握度60-79%的能力"
      />
      <StatCard
        title="初步掌握"
        value={beginnerCount}
        icon="🌱"
        description="掌握度40-59%的能力"
      />
      <StatCard
        title="未掌握"
        value={unlearnedCount}
        icon="📝"
        description="掌握度<40%的能力"
      />
    </div>
  );
};
