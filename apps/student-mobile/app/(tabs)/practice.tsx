import { useRouter } from "expo-router";
import { useState } from "react";
import { H2, Paragraph, ScrollView, Spinner, Tabs, Text, View, YStack } from "tamagui";
import { studentApi } from "../../src/api/client";
import { SelectionCard } from "../../src/components/SelectionCard";
import { usePracticeSelection } from "../../src/hooks/usePracticeSelection";

export default function PracticeScreen() {
  const { abilities, units, isLoading, user } = usePracticeSelection();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleStartPractice = async (type: "ability_practice" | "unit_practice", id: string | number) => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const params =
        type === "ability_practice"
          ? { type, ability_code: id as string, subject: user?.subject, grade: user?.grade }
          : { type, unit_id: id as number };

      const sessionId = await studentApi.createPractice(params);
      router.push(`/practice/${sessionId}`);
    } catch (error) {
      console.error("Failed to create practice:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading || isCreating) {
    return (
      <View flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color="$blue10" />
        <Text marginTop="$4" color="$gray10">
          {isCreating ? "正在生成练习题目..." : "加载中..."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack space="$8" padding="$4" paddingTop="$10">
        <YStack space="$2">
          <H2 fontWeight="900" fontSize="$9">
            开始练习
          </H2>
          <Paragraph color="$gray11" fontSize="$5">
            选择一个模块进行深度强化
          </Paragraph>
        </YStack>

        <Tabs defaultValue="ability" orientation="horizontal" flexDirection="column" width="100%">
          <Tabs.List backgroundColor="$gray3" padding="$1" borderRadius="$4" marginBottom="$6">
            <Tabs.Tab flex={1} value="ability">
              <Text fontWeight="bold">能力练习</Text>
            </Tabs.Tab>
            <Tabs.Tab flex={1} value="unit">
              <Text fontWeight="bold">单元同步</Text>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Content value="ability">
            <YStack space="$2">
              {abilities.length > 0 ? (
                abilities.map((atomic) => (
                  <SelectionCard
                    key={atomic.code}
                    title={atomic.name}
                    subtitle={atomic.description}
                    icon="🎯"
                    badge={`Lv.${atomic.difficulty}`}
                    onPress={() => handleStartPractice("ability_practice", atomic.code)}
                  />
                ))
              ) : (
                <EmptyState message="暂无能力数据，请检查设置" />
              )}
            </YStack>
          </Tabs.Content>

          <Tabs.Content value="unit">
            <YStack space="$2">
              {units.length > 0 ? (
                units.map((unit) => (
                  <SelectionCard
                    key={unit.id}
                    title={unit.name}
                    subtitle={`同步教材内容`}
                    icon="📖"
                    color="$green10"
                    onPress={() => handleStartPractice("unit_practice", unit.id)}
                  />
                ))
              ) : (
                <EmptyState message="暂无单元数据，请确认教材设置" />
              )}
            </YStack>
          </Tabs.Content>
        </Tabs>
      </YStack>
    </ScrollView>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <YStack padding="$8" alignItems="center" space="$4" backgroundColor="$gray2" borderRadius="$8">
      <Text fontSize="$9">📭</Text>
      <Text color="$gray10" textAlign="center">
        {message}
      </Text>
    </YStack>
  );
}
