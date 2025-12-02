/**
 * 加载视图
 */
import { FC, memo } from "react";
import { LoadingSpinner } from "@/components/business/LoadingSpinner";

export const LoadingView: FC = memo(() => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    </div>
  );
});

LoadingView.displayName = "LoadingView";

