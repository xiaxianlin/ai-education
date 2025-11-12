/**
 * 统计卡片组件
 */
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Target, Clock, History, Star } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface StatsCardProps {
  todayProgress: number;
  dailyQuestions: number;
  completedQuestions: number;
  continuousDays: number;
  totalPracticeTime: number;
}

export const StatsCard = memo(function StatsCard({
  todayProgress,
  dailyQuestions,
  completedQuestions,
  continuousDays,
  totalPracticeTime,
}: StatsCardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  return (
    <Card className="border-2 border-blue-200 shadow-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{todayProgress}%</div>
            <div className="text-xs text-gray-600 mt-1">今日进度</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
            <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">
              {completedQuestions}/{dailyQuestions}
            </div>
            <div className="text-xs text-gray-600 mt-1">今日题目</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-purple-50 border border-purple-100">
            <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{continuousDays}</div>
            <div className="text-xs text-gray-600 mt-1">连续天数</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-orange-50 border border-orange-100">
            <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700">
              {formatTime(totalPracticeTime)}
            </div>
            <div className="text-xs text-gray-600 mt-1">累计练习</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

