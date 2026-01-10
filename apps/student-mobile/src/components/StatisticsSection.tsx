import { Spinner, Tabs, Text, XStack, YStack } from "tamagui";
import { PracticeStatistics } from "../api/types";
import { StatCard } from "./StatCard";

interface StatisticsSectionProps {
  statistics: {
    recent_30_days: PracticeStatistics;
    all_time: PracticeStatistics;
  };
  loading?: boolean;
}

export const StatisticsSection = ({ statistics, loading }: StatisticsSectionProps) => {
  if (loading) {
    return (
      <YStack padding="$4" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$blue10" />
      </YStack>
    );
  }

  return (
    <Tabs defaultValue="recent_30_days" orientation="horizontal" flexDirection="column" width="100%" borderRadius="$4">
      <Tabs.List
        disablePassBorderRadius="bottom"
        aria-label="Manage your account"
        marginBottom="$4"
        backgroundColor="$gray3"
        padding="$1"
        borderRadius="$4"
      >
        <Tabs.Tab flex={1} value="recent_30_days">
          <Text>最近30天</Text>
        </Tabs.Tab>
        <Tabs.Tab flex={1} value="all_time">
          <Text>全部时间</Text>
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Content value="recent_30_days">
        <StatsGrid statistics={statistics.recent_30_days} />
      </Tabs.Content>

      <Tabs.Content value="all_time">
        <StatsGrid statistics={statistics.all_time} />
      </Tabs.Content>
    </Tabs>
  );
};

const StatsGrid = ({ statistics }: { statistics: PracticeStatistics }) => {
  return (
    <YStack space="$4" paddingBottom="$8">
      <XStack space="$4">
        <View flex={1}>
          <StatCard title="总练习数" value={statistics.total_practices} icon="📚" description="所有练习会话" />
        </View>
        <View flex={1}>
          <StatCard title="总做题数" value={statistics.total_questions} icon="✏️" description="已完成的题目" />
        </View>
      </XStack>
      <XStack space="$4">
        <View flex={1}>
          <StatCard
            title="单元练习"
            value={statistics.completed_unit_practices}
            icon="📖"
            description="已完成的单元练习"
          />
        </View>
        <View flex={1}>
          <StatCard
            title="能力练习"
            value={statistics.completed_ability_practices}
            icon="🎯"
            description="已完成的能力练习"
          />
        </View>
      </XStack>
      <XStack space="$4">
        <View flex={1}>
          <StatCard
            title="总正确率"
            value={`${statistics.total_accuracy.toFixed(1)}%`}
            icon="✅"
            description="整体正确率"
          />
        </View>
        <View flex={1}>
          <StatCard
            title="平均正确率"
            value={`${statistics.average_accuracy.toFixed(1)}%`}
            icon="📊"
            description="练习平均正确率"
          />
        </View>
      </XStack>
    </YStack>
  );
};

import { View } from "tamagui";
