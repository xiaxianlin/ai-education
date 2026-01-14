import { Avatar, Button, H2, Text, View, XStack, YStack, Card } from "tamagui";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useProfileStore } from "../../src/stores/useProfileStore";
import { useState } from "react";
import { LearningSettingsDialog } from "../../src/components/LearningSettingsDialog";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const GRADES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { profile, loading, fetchProfile, hasSettings } = useProfileStore();
  const [settingsDialogVisible, setSettingsDialogVisible] = useState(false);

  const { name, phone, grade, semester, subject } = profile || {};

  return (
    <View flex={1} backgroundColor="$background">
      <YStack space="$6" padding="$4" paddingTop="$10">
        <H2 fontWeight="900">个人中心</H2>

        {/* 用户信息卡片 */}
        <Card bordered backgroundColor="$white">
          <Card.Header padded>
            <XStack space="$4" alignItems="center">
              <Avatar circular size="$8">
                <Avatar.Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces" />
                <Avatar.Fallback backgroundColor="$blue10" />
              </Avatar>
              <YStack flex={1}>
                <Text fontSize="$6" fontWeight="bold">
                  {name || "未登录"}
                </Text>
                <Text color="$gray11" fontSize="$3">
                  {phone || ""}
                </Text>
              </YStack>
            </XStack>
          </Card.Header>
        </Card>

        {/* 学习信息卡片 */}
        {loading ? (
          <Card bordered backgroundColor="$white">
            <Card.Header padded>
              <Text>加载中...</Text>
            </Card.Header>
          </Card>
        ) : (
          <Card bordered backgroundColor="$white">
            <Card.Header padded>
              <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                <Text fontSize="$4" fontWeight="600">
                  学习信息
                </Text>
                <Button size="$2" variant="outlined" onPress={() => setSettingsDialogVisible(true)}>
                  <XStack space="$2" alignItems="center">
                    <FontAwesome name="pencil" size={12} color="#2563eb" />
                    <Text color="$blue10" fontSize="$2">
                      编辑
                    </Text>
                  </XStack>
                </Button>
              </XStack>

              {hasSettings ? (
                <YStack space="$3">
                  <XStack justifyContent="space-between" paddingVertical="$2">
                    <Text color="$gray11">学科</Text>
                    <Text fontWeight="500">{subject}</Text>
                  </XStack>
                  <XStack justifyContent="space-between" paddingVertical="$2">
                    <Text color="$gray11">年级</Text>
                    <Text fontWeight="500">{GRADES[grade! - 1] || grade}</Text>
                  </XStack>
                  <XStack justifyContent="space-between" paddingVertical="$2">
                    <Text color="$gray11">学期</Text>
                    <Text fontWeight="500">{semester}</Text>
                  </XStack>
                </YStack>
              ) : (
                <YStack space="$3" alignItems="center" paddingVertical="$4">
                  <Text color="$gray11" textAlign="center">
                    还未设置学习信息
                  </Text>
                  <Button size="$3" theme="orange" onPress={() => setSettingsDialogVisible(true)}>
                    去设置
                  </Button>
                </YStack>
              )}
            </Card.Header>
          </Card>
        )}

        {/* 强制设置弹窗（未设置学习信息时自动显示） */}
        {!hasSettings && <LearningSettingsDialog required />}

        {/* 编辑学习信息弹窗 */}
        <LearningSettingsDialog open={settingsDialogVisible} onOpenChange={setSettingsDialogVisible} />

        <YStack space="$4" paddingTop="$4">
          <Button theme="red" onPress={logout}>
            退出登录
          </Button>
        </YStack>
      </YStack>
    </View>
  );
}
