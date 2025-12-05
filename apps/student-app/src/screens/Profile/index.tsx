import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileStore } from '@/stores/profile-store';

export function ProfileScreen() {
  const { student, activeTextbooks } = useProfileStore();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">个人信息</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-base mb-2">姓名：{student?.name}</Text>
            <Text className="text-base mb-2">年级：{student?.grade}年级</Text>
            <Text className="text-base">手机号：{student?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">已选教材</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTextbooks && activeTextbooks.length > 0 ? (
              activeTextbooks.map((book) => (
                <View key={book.id} className="mb-2">
                  <Text className="text-base">
                    {book.subject} - {book.name} ({book.semester})
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-muted-foreground">暂无教材</Text>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

