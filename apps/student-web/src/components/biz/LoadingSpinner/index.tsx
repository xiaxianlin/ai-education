import { cn } from "@/common/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-16 w-16 border-4",
    lg: "h-24 w-24 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size],
          className
        )}
      />
      {text && <p className="mt-4 text-muted-foreground">{text}</p>}
    </div>
  );
}

/**
 * 页面级加载组件
 */
export function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" text="加载中..." />
    </div>
  );
}
