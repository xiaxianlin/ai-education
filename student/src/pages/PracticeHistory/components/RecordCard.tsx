/**
 * 练习记录卡片组件
 */
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudyRecord } from '@/services/profile';

interface RecordCardProps {
  date: string;
  dayRecords: StudyRecord[];
  formatTime: (seconds: number) => string;
}

export const RecordCard = memo(function RecordCard({
  date,
  dayRecords,
  formatTime,
}: RecordCardProps) {
  const totalQuestions = dayRecords.length;
  const totalTime = dayRecords.reduce((sum, r) => sum + r.time_spent, 0);
  const correctCount = dayRecords.filter((r) => r.is_correct === 1).length; // StudyRecord 的 is_correct 保持不变
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  return (
    <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 rounded-3xl hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-green-100 shadow-md">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{date}</p>
                <p className="text-sm text-gray-500 font-medium">
                  教材 #{dayRecords[0].textbook_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-base font-medium ml-2">
              <span className="text-blue-600">📝 {totalQuestions} 题</span>
              <span className="text-purple-600">⏱️ {formatTime(totalTime)}</span>
              <span
                className={cn(
                  'font-bold px-3 py-1 rounded-xl',
                  accuracy >= 80
                    ? 'bg-green-100 text-green-700'
                    : accuracy >= 60
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                )}
              >
                {accuracy >= 80 ? '✅' : accuracy >= 60 ? '😊' : '💪'} {accuracy}%
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-12 px-6 text-base font-bold rounded-2xl border-2 hover:bg-blue-50"
          >
            查看
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

