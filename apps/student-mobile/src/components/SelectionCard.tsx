import { ReactNode } from "react";
import { Card, Circle, Text, View, XStack, YStack } from "tamagui";

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  icon: string | ReactNode;
  onPress: () => void;
  color?: string;
  badge?: string;
}

export const SelectionCard = ({ title, subtitle, icon, onPress, color = "$blue10", badge }: SelectionCardProps) => {
  return (
    <Card
      elevate
      bordered
      size="$4"
      padding="$4"
      backgroundColor="$background"
      borderRadius="$8"
      onPress={onPress}
      pressStyle={{ scale: 0.98, backgroundColor: "$gray2" }}
      borderWidth={0}
      marginBottom="$4"
    >
      <XStack space="$4" alignItems="center">
        <Circle size={56} backgroundColor={color + "20"}>
          {typeof icon === "string" ? <Text fontSize={28}>{icon}</Text> : icon}
        </Circle>
        <YStack flex={1} space="$1">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$6" fontWeight="bold">
              {title}
            </Text>
            {badge && (
              <View backgroundColor={color} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$full">
                <Text color="white" fontSize="$1" fontWeight="bold">
                  {badge}
                </Text>
              </View>
            )}
          </XStack>
          {subtitle && (
            <Text color="$gray11" fontSize="$3">
              {subtitle}
            </Text>
          )}
        </YStack>
        <Text color="$gray9" fontSize="$6">
          ›
        </Text>
      </XStack>
    </Card>
  );
};
