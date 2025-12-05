import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Card, CardContent } from '@/components/ui/card';

export function WrongRecordsScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-8">
        <Text className="text-2xl font-bold mb-4">错题记录</Text>
        <Card>
          <CardContent className="p-4">
            <Text className="text-muted-foreground text-center">
              暂无错题记录
            </Text>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

