/**
 * 每日练习统计卡片组件
 */
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, Zap, Award, BookCheck, Brain } from 'lucide-react';

interface DailyPracticeStatsProps {
  todayProgress: number;
  dailyQuestions: number;
  completedQuestions: number;
}

export const DailyPracticeStats = memo(function DailyPracticeStats({
  todayProgress,
  dailyQuestions,
  completedQuestions,
}: DailyPracticeStatsProps) {
  const stats = [
    {
      icon: Target,
      label: '今日进度',
      value: `${todayProgress}%`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: BookCheck,
      label: '今日题目',
      value: `${completedQuestions}/${dailyQuestions}`,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: '连续天数',
      value: '7',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: Award,
      label: '累计练习',
      value: '128',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <div className={`inline-flex p-3 rounded-2xl ${stat.bg} mb-3`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

