import * as React from "react";
import { TextInput, View, Text } from "react-native";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="text-sm font-medium text-foreground mb-2">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
            error && "border-destructive",
            className
          )}
          placeholderTextColor="#999"
          {...props}
        />
        {error && (
          <Text className="text-sm text-destructive mt-1">{error}</Text>
        )}
      </View>
    );
  }
);
Input.displayName = "Input";

export { Input };

