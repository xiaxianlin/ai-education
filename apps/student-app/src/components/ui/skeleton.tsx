import * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };

