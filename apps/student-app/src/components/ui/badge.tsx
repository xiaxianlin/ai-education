import * as React from 'react';
import { View, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.ComponentProps<typeof View>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={cn(
        'text-xs font-semibold',
        variant === 'default' && 'text-primary-foreground',
        variant === 'secondary' && 'text-secondary-foreground',
        variant === 'destructive' && 'text-destructive-foreground',
        variant === 'outline' && 'text-foreground'
      )}>
        {children}
      </Text>
    </View>
  );
}

export { Badge, badgeVariants };

