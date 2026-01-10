import { ReactNode } from "react";
import { Card, Text, View, XStack, YStack } from "tamagui";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
}

export const StatCard = ({ title, value, icon, description }: StatCardProps) => {
  return (
    <Card
      elevate
      bordered
      size="$4"
      padding="$4"
      backgroundColor="$background"
      borderRadius="$8"
      borderWidth={0}
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 10 }}
      shadowOpacity={0.1}
      shadowRadius={20}
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack space="$2" flex={1}>
          <Text fontSize="$3" fontWeight="bold" color="$gray10">
            {title}
          </Text>
          <Text fontSize="$8" fontWeight="900" color="$color">
            {value}
          </Text>
          {description && (
            <Text fontSize="$2" color="$gray9">
              {description}
            </Text>
          )}
        </YStack>
        {icon && (
          <View
            width={48}
            height={48}
            borderRadius="$4"
            backgroundColor="$blue3"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="$6">{icon}</Text>
          </View>
        )}
      </XStack>
    </Card>
  );
};
