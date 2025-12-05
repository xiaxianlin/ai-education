/**
 * 进度指示器组件
 */
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProgressIndicatorProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  practiceType?: string;
}

export const ProgressIndicator = memo(function ProgressIndicator({
  currentIndex,
  totalQuestions,
  answeredCount,
  practiceType,
}: ProgressIndicatorProps) {
  const progress = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const answerProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <Card className="border-2 border-primary/20 shadow-lg rounded-2xl bg-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          {practiceType && (
            <div className="text-lg font-semibold text-foreground">
              {practiceType}
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>第 {currentIndex + 1} 题 / 共 {totalQuestions} 题</span>
            <span>已完成 {answeredCount} 题</span>
          </div>
          <div className="space-y-2">
            {/* 当前进度 */}
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* 答题进度 */}
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300 rounded-full"
                style={{ width: `${answerProgress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

