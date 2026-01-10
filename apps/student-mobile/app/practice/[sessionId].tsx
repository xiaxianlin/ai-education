import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Button, Circle, Progress, ScrollView, Spinner, Text, View, XStack, YStack } from "tamagui";
import { studentApi } from "../../src/api/client";

export default function PracticeSession() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取练习数据
  const { data: practiceData, isLoading } = useQuery({
    queryKey: ["practice", sessionId],
    queryFn: () => studentApi.getPracticeSessionData(sessionId),
  });

  const questions = practiceData?.questions || [];
  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const handleSelectOption = (optionId: string) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: optionId,
    });
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 循环提交所有未提交的答案
      // 在这个简化的 mobile 版本中，我们假设在完成时统一处理或每步提交
      // 为了符合刷题交互，我们这里先实现一个简单的“完成练习”调用
      await studentApi.completePractice(sessionId);
      router.replace(`/practice/result/${sessionId}`);
    } catch (error) {
      console.error("Failed to complete practice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 提交单个答案的逻辑（如果需要即时反馈）
  const submitAnswerMutation = useMutation({
    mutationFn: (params: any) => studentApi.submitAnswer(params),
  });

  const handleAnswerChange = async (answer: any) => {
    setUserAnswers({ ...userAnswers, [currentQuestion.id]: answer });
    // 即时提交
    await submitAnswerMutation.mutateAsync({
      session_id: sessionId,
      question_id: currentQuestion.id,
      answer: answer,
      time_spent: 10, // 简化处理
    });
  };

  if (isLoading) {
    return (
      <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner size="large" color="$blue10" />
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Text>未找到题目</Text>
        <Button onPress={() => router.back()}>返回</Button>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack paddingHorizontal="$4" paddingTop="$12" space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Button
            icon={<FontAwesome name="close" size={20} />}
            circular
            size="$3"
            onPress={() => router.back()}
            chromeless
          />
          <Text fontWeight="bold" fontSize="$5">
            {currentIndex + 1} / {total}
          </Text>
          <View width={40} />
        </XStack>
        <Progress value={progress} height={6} backgroundColor="$gray3">
          <Progress.Indicator animation="lazy" backgroundColor="$blue10" />
        </Progress>
      </YStack>

      <ScrollView flex={1} padding="$4">
        <YStack space="$6" paddingTop="$4">
          {/* Question Stem */}
          <YStack space="$4">
            <View
              backgroundColor="$blue2"
              paddingHorizontal="$3"
              paddingVertical="$1"
              borderRadius="$2"
              alignSelf="flex-start"
            >
              <Text color="$blue10" fontWeight="bold" fontSize="$2">
                {currentQuestion.question_type_code}
              </Text>
            </View>
            <Text fontSize="$6" fontWeight="600" lineHeight={30}>
              {currentQuestion.stem.text}
            </Text>
          </YStack>

          {/* Options */}
          <YStack space="$3">
            {currentQuestion.options?.map((option: any) => {
              const isSelected = userAnswers[currentQuestion.id] === option.id;
              return (
                <XStack
                  key={option.id}
                  padding="$4"
                  borderWidth={2}
                  borderColor={isSelected ? "$blue10" : "$gray4"}
                  borderRadius="$6"
                  backgroundColor={isSelected ? "$blue1" : "$background"}
                  onPress={() => handleAnswerChange(option.id)}
                  space="$3"
                  alignItems="center"
                >
                  <Circle
                    size={24}
                    borderWidth={2}
                    borderColor={isSelected ? "$blue10" : "$gray6"}
                    backgroundColor={isSelected ? "$blue10" : "transparent"}
                  >
                    {isSelected && <FontAwesome name="check" color="white" size={12} />}
                  </Circle>
                  <Text flex={1} fontSize="$4" fontWeight={isSelected ? "bold" : "normal"}>
                    {option.text}
                  </Text>
                </XStack>
              );
            })}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Footer Navigation */}
      <XStack padding="$4" paddingBottom="$8" space="$4" borderTopWidth={1} borderTopColor="$gray3">
        <Button flex={1} size="$5" variant="outlined" onPress={handlePrev} disabled={currentIndex === 0}>
          上一题
        </Button>
        {currentIndex === total - 1 ? (
          <Button flex={2} size="$5" theme="blue" onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Spinner color="white" /> : "完成练习"}
          </Button>
        ) : (
          <Button flex={2} size="$5" theme="blue" onPress={handleNext}>
            下一题
          </Button>
        )}
      </XStack>
    </View>
  );
}
