import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface UnitProgressIndicatorProps {
  unitName: string;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
}

export function UnitProgressIndicator({
  unitName,
  currentIndex,
  totalQuestions,
  answeredCount,
}: UnitProgressIndicatorProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <Card className="border-2 border-blue-200 shadow-md">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span className="font-semibold text-gray-800">{unitName}</span>
          </div>
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <span>已答：{answeredCount} 题</span>
          <span>剩余：{totalQuestions - currentIndex - 1} 题</span>
        </div>
      </CardContent>
    </Card>
  );
}

