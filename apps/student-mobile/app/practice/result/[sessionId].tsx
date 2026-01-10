import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Circle, H2, Paragraph, ScrollView, Spinner, Text, View, XStack, YStack } from "tamagui";
import { studentApi } from "../../../src/api/client";

export default function PracticeResult() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  const { data: practiceData, isLoading } = useQuery({
    queryKey: ["practice", sessionId],
    queryFn: () => studentApi.getPracticeSessionData(sessionId),
  });

  if (isLoading) {
    return (
      <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner size="large" color="$blue10" />
      </View>
    );
  }

  const session = practiceData?.session;
  const accuracy = session?.answer_count > 0 ? Math.round((session?.correct_count / session?.answer_count) * 100) : 0;

  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView flex={1}>
        <YStack space="$8" padding="$4" paddingTop="$12">
          {/* Status Header */}
          <YStack alignItems="center" space="$4">
            <Circle size={150} borderWidth={10} borderColor="$blue10" backgroundColor="$blue1">
              <YStack alignItems="center" justifyContent="center">
                <Text fontSize="$10" fontWeight="900" color="$blue10">
                  {accuracy}%
                </Text>
                <Text color="$blue10" fontWeight="bold">
                  正确率
                </Text>
              </YStack>
            </Circle>
            <H2 fontWeight="900" marginTop="$2">
              太棒了！继续加油
            </H2>
            <Paragraph color="$gray11">你已经完成了本次练习，来看看你的表现吧</Paragraph>
          </YStack>

          {/* Stats Grid */}
          <XStack space="$4">
            <StatBox label="总题目" value={session?.question_count || 0} icon="list-ol" />
            <StatBox label="答对" value={session?.correct_count || 0} icon="check-circle" color="$green10" />
            <StatBox label="用时" value="5:30" icon="clock-o" />
          </XStack>

          {/* Question Analysis */}
          <YStack space="$4">
            <H2 fontSize="$6" fontWeight="bold">
              详细分析
            </H2>
            {practiceData?.answers?.map((answer: any, index: number) => (
              <Card key={answer.id} padding="$4" bordered borderRadius="$4" backgroundColor="$gray1" borderWidth={0}>
                <XStack space="$3" alignItems="center">
                  <Circle size={30} backgroundColor={answer.status === 1 ? "$green10" : "$red10"}>
                    <Text color="white" fontWeight="bold">
                      {index + 1}
                    </Text>
                  </Circle>
                  <YStack flex={1}>
                    <Text fontWeight="bold" numberOfLines={1}>
                      {answer.question?.stem?.text}
                    </Text>
                    <Text color={answer.status === 1 ? "$green10" : "$red10"} fontSize="$2">
                      {answer.status === 1 ? "正确" : "需改进"}
                    </Text>
                  </YStack>
                  <FontAwesome
                    name={answer.status === 1 ? "check" : "times"}
                    color={answer.status === 1 ? "$green10" : "$red10"}
                  />
                </XStack>
              </Card>
            ))}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Footer Actions */}
      <XStack padding="$4" paddingBottom="$8" space="$4" borderTopWidth={1} borderTopColor="$gray3">
        <Button flex={1} size="$5" variant="outlined" onPress={() => router.replace("/")}>
          返回首页
        </Button>
        <Button flex={1} size="$5" theme="blue" onPress={() => router.replace("/practice")}>
          再来一次
        </Button>
      </XStack>
    </View>
  );
}

function StatBox({ label, value, icon, color = "$blue10" }: any) {
  return (
    <YStack flex={1} backgroundColor="$gray2" padding="$4" borderRadius="$6" alignItems="center" space="$2">
      <FontAwesome name={icon} size={20} color={color} />
      <Text fontSize="$6" fontWeight="bold">
        {value}
      </Text>
      <Text fontSize="$2" color="$gray10">
        {label}
      </Text>
    </YStack>
  );
}
