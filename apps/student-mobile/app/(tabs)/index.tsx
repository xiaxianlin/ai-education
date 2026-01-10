import { H1, Paragraph, ScrollView, View, XStack, YStack } from "tamagui";
import { StatisticsSection } from "../../src/components/StatisticsSection";
import { useHomeStatistics } from "../../src/hooks/useHomeStatistics";

export default function HomeScreen() {
  const { data: statistics, isLoading } = useHomeStatistics();

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack space="$8" padding="$4" paddingTop="$10">
        {/* 标题区域 */}
        <YStack space="$4">
          <XStack alignItems="center" space="$4">
            <View width={8} height={40} backgroundColor="$blue10" borderRadius="$full" />
            <H1 fontSize="$9" fontWeight="900">
              我的学习统计
            </H1>
          </XStack>
          <Paragraph fontSize="$5" fontWeight="bold" color="$gray11">
            查看你的练习数据，了解学习进度和成果
          </Paragraph>
        </YStack>

        {/* 统计数据区域 */}
        {statistics ? (
          <StatisticsSection statistics={statistics} loading={isLoading} />
        ) : (
          <StatisticsSection
            statistics={{
              recent_30_days: {
                total_practices: 0,
                total_questions: 0,
                completed_unit_practices: 0,
                completed_ability_practices: 0,
                total_accuracy: 0,
                average_accuracy: 0,
              },
              all_time: {
                total_practices: 0,
                total_questions: 0,
                completed_unit_practices: 0,
                completed_ability_practices: 0,
                total_accuracy: 0,
                average_accuracy: 0,
              },
            }}
            loading={isLoading}
          />
        )}
      </YStack>
    </ScrollView>
  );
}
