import { Avatar, Button, H2, Text, View, XStack, YStack } from "tamagui";
import { useAuthStore } from "../../src/stores/useAuthStore";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <View flex={1} backgroundColor="$background">
      <YStack space="$8" padding="$4" paddingTop="$10">
        <H2 fontWeight="900">个人中心</H2>

        <XStack space="$4" alignItems="center" backgroundColor="$gray2" padding="$4" borderRadius="$8">
          <Avatar circular size="$6">
            <Avatar.Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces" />
            <Avatar.Fallback backgroundColor="$blue10" />
          </Avatar>
          <YStack>
            <Text fontSize="$6" fontWeight="bold">
              {user?.name || "未登录"}
            </Text>
            <Text color="$gray11">{user?.phone || ""}</Text>
          </YStack>
        </XStack>

        <YStack space="$4">
          <Button theme="red" onPress={logout}>
            退出登录
          </Button>
        </YStack>
      </YStack>
    </View>
  );
}
