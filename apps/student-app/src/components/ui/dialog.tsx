import * as React from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react-native';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => onOpenChange(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 p-4">
          {children}
        </View>
      </Modal>
    </DialogContext.Provider>
  );
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('DialogContent must be used within Dialog');
  }

  return (
    <View
      ref={ref}
      className={cn(
        'w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg',
        className
      )}
      {...props}
    >
      <Pressable
        onPress={() => context.onOpenChange(false)}
        className="absolute right-4 top-4 rounded-sm opacity-70"
      >
        <X size={16} color="#666" />
      </Pressable>
      {children}
    </View>
  );
});
DialogContent.displayName = 'DialogContent';

const DialogHeader = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
));
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentProps<typeof Text>
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentProps<typeof Text>
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

const DialogFooter = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
));
DialogFooter.displayName = 'DialogFooter';

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

