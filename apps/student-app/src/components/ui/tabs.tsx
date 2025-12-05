import * as React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps extends React.ComponentProps<typeof View> {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

function Tabs({ value, onValueChange, children, className, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View className={cn('w-full', className)} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof ScrollView>,
  React.ComponentProps<typeof ScrollView>
>(({ className, ...props }, ref) => (
  <ScrollView
    ref={ref}
    horizontal
    showsHorizontalScrollIndicator={false}
    className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1', className)}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ComponentProps<typeof Pressable> {
  value: string;
  children: React.ReactNode;
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof Pressable>, TabsTriggerProps>(
  ({ className, value: triggerValue, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) {
      throw new Error('TabsTrigger must be used within Tabs');
    }

    const isActive = context.value === triggerValue;

    return (
      <Pressable
        ref={ref}
        onPress={() => context.onValueChange(triggerValue)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
          isActive && 'bg-background text-foreground shadow-sm',
          !isActive && 'text-muted-foreground',
          className
        )}
        {...props}
      >
        <Text
          className={cn(
            'text-sm font-medium',
            isActive ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {children}
        </Text>
      </Pressable>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View> & { value: string }
>(({ className, value: contentValue, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  if (context.value !== contentValue) {
    return null;
  }

  return (
    <View
      ref={ref}
      className={cn('mt-2 ring-offset-background', className)}
      {...props}
    >
      {children}
    </View>
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };

