import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Card, Circle, H2, Paragraph, ScrollView, Spinner, Text, View, XStack, YStack } from "tamagui";
import { studentApi } from "../../src/api/client";

export default function RecordsScreen() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["practiceRecords"],
    queryFn: () => studentApi.getPracticeRecords(),
  });

  const records = data?.data || [];

  if (isLoading) {
    return (
      <View flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color="$blue10" />
      </View>
    );
  }

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack space="$8" padding="$4" paddingTop="$10">
        <YStack space="$2">
          <H2 fontWeight="900" fontSize="$9">
            练习记录
          </H2>
          <Paragraph color="$gray11" fontSize="$5">
            你的每一次进步都值得被记录
          </Paragraph>
        </YStack>

        <YStack space="$4" paddingBottom="$8">
          {records.length > 0 ? (
            records.map((record: any) => (
              <HistoryCard
                key={record.id}
                record={record}
                onPress={() => router.push(`/practice/result/${record.id}`)}
              />
            ))
          ) : (
            <YStack padding="$10" alignItems="center" space="$4" backgroundColor="$gray2" borderRadius="$8">
              <Text fontSize="$10">📊</Text>
              <Text color="$gray10">暂无练习记录，快去刷题吧！</Text>
            </YStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}

function HistoryCard({ record, onPress }: { record: any; onPress: () => void }) {
  const accuracy = record.answer_count > 0 ? Math.round((record.correct_count / record.answer_count) * 100) : 0;

  return (
    <Card
      elevate
      bordered
      padding="$4"
      borderRadius="$6"
      backgroundColor="$background"
      onPress={onPress}
      pressStyle={{ scale: 0.98, backgroundColor: "$gray2" }}
      borderWidth={0}
    >
      <XStack space="$4" alignItems="center">
        <Circle size={50} backgroundColor={accuracy >= 80 ? "$green3" : "$blue3"}>
          <Text fontWeight="bold" color={accuracy >= 80 ? "$green10" : "$blue10"}>
            {accuracy}%
          </Text>
        </Circle>
        <YStack flex={1} space="$1">
          <Text fontWeight="bold" fontSize="$5">
            {record.practice_type === "ability_practice" ? "能力练习" : "单元练习"}
          </Text>
          <Text color="$gray11" fontSize="$3">
            题目: {record.question_count} | 正确: {record.correct_count}
          </Text>
          <Text color="$gray9" fontSize="$2">
            {new Date(record.create_time * 1000).toLocaleDateString()}
          </Text>
        </YStack>
        <Text color="$gray9">›</Text>
      </XStack>
    </Card>
  );
}
