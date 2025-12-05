import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Card, CardContent } from '@/components/ui/card';

export function DailyPracticeScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-8">
        <Text className="text-2xl font-bold mb-4">每日练习</Text>
        <Card>
          <CardContent className="p-4">
            <Text className="text-muted-foreground text-center">
              每日练习功能开发中...
            </Text>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

