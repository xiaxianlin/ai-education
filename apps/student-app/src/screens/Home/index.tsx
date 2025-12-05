/**
 * 首页
 */
import React from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfileStore } from '@/stores/profile-store';

export function HomeScreen() {
  const navigation = useNavigation();
  const { student } = useProfileStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const getEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-8">
        {/* 欢迎区域 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">
              {getEmoji()} {getGreeting()}，{student?.name || '同学'}！
            </CardTitle>
          </CardHeader>
        </Card>

        {/* 练习入口 */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-4 px-2">
            🚀 开始练习
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <Pressable
              className="w-[48%] mb-4"
              onPress={() => navigation.navigate('Practice' as never, { screen: 'Daily' } as never)}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📆 每日练习</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text className="text-sm text-muted-foreground mb-4">
                    快来开始今天的练习吧！✨
                  </Text>
                  <Button className="w-full">去练习</Button>
                </CardContent>
              </Card>
            </Pressable>

            <Pressable
              className="w-[48%] mb-4"
              onPress={() => navigation.navigate('Practice' as never, { screen: 'Unit' } as never)}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📚 单元练习</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text className="text-sm text-muted-foreground mb-4">
                    选择单元开始练习，巩固知识点！✨
                  </Text>
                  <Button className="w-full">选择单元</Button>
                </CardContent>
              </Card>
            </Pressable>

            <Pressable
              className="w-[48%]"
              onPress={() => navigation.navigate('Practice' as never, { screen: 'Assessment' } as never)}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎯 综合评估</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text className="text-sm text-muted-foreground mb-4">
                    让AI帮你找到学习的方向！✨
                  </Text>
                  <Button className="w-full">去评估</Button>
                </CardContent>
              </Card>
            </Pressable>
          </View>
        </View>

        {/* 快速操作 */}
        <View>
          <Text className="text-xl font-bold text-foreground mb-4 px-2">
            快速操作
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <Pressable
              className="w-[48%] mb-4"
              onPress={() => navigation.navigate('Practice' as never, { screen: 'History' } as never)}
            >
              <Card>
                <CardContent className="p-4">
                  <Text className="text-base font-semibold">📊 练习记录</Text>
                </CardContent>
              </Card>
            </Pressable>

            <Pressable
              className="w-[48%] mb-4"
              onPress={() => navigation.navigate('WrongRecords' as never)}
            >
              <Card>
                <CardContent className="p-4">
                  <Text className="text-base font-semibold">❌ 错题复习</Text>
                </CardContent>
              </Card>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

