import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore } from '@/stores/profile-store';
import { cn } from '@/lib/utils';

export function Header() {
  const navigation = useNavigation();
  const { logout } = useAuthStore();
  const { student } = useProfileStore();

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login' as never);
  };

  return (
    <View className="flex-row items-center justify-between border-b border-border bg-background px-4 py-3">
      <Text className="text-lg font-bold text-foreground">
        {student?.name || '学生端'}
      </Text>
      <Pressable onPress={handleLogout}>
        <Text className="text-sm text-muted-foreground">退出</Text>
      </Pressable>
    </View>
  );
}

