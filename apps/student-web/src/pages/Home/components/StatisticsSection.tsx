import { StatCard } from "@/components/biz/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC } from "react";

interface StatisticsSectionProps {
  statistics: PracticeStatistics;
  loading?: boolean;
}

export const StatisticsSection: FC<StatisticsSectionProps> = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32 rounded-[2rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="总练习数"
        value={statistics.total_practices}
        icon="📚"
        description="所有练习会话"
      />
      <StatCard
        title="总做题数"
        value={statistics.total_questions}
        icon="✏️"
        description="已完成的题目"
      />
      <StatCard
        title="单元练习"
        value={statistics.completed_unit_practices}
        icon="📖"
        description="已完成的单元练习"
      />
      <StatCard
        title="能力练习"
        value={statistics.completed_ability_practices}
        icon="🎯"
        description="已完成的能力练习"
      />
      <StatCard
        title="总正确率"
        value={`${statistics.total_accuracy.toFixed(1)}%`}
        icon="✅"
        description="整体正确率"
      />
      <StatCard
        title="平均正确率"
        value={`${statistics.average_accuracy.toFixed(1)}%`}
        icon="📊"
        description="练习平均正确率"
      />
    </div>
  );
};
