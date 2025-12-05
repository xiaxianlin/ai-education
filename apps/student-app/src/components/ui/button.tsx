import * as React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        outline: 'border border-input bg-background',
        secondary: 'bg-secondary',
        ghost: '',
        link: '',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, children, loading, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text
            className={cn(
              'text-sm font-medium',
              variant === 'default' && 'text-primary-foreground',
              variant === 'destructive' && 'text-destructive-foreground',
              variant === 'secondary' && 'text-secondary-foreground',
              variant === 'outline' && 'text-foreground',
              variant === 'ghost' && 'text-foreground',
              variant === 'link' && 'text-primary underline',
              isDisabled && 'opacity-50'
            )}
          >
            {children}
          </Text>
        )}
      </Pressable>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

