import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message, className }: LoadingSpinnerProps) {
  return (
    <View className={cn('flex-1 items-center justify-center', className)}>
      <ActivityIndicator size="large" color="#007AFF" />
      {message && (
        <Text className="mt-4 text-sm text-muted-foreground">{message}</Text>
      )}
    </View>
  );
}

export function LoadingPage() {
  return <LoadingSpinner message="正在加载..." />;
}

