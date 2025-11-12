/**
 * 欢迎卡片组件
 */
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Flame } from 'lucide-react';
import type { StudentStats } from '@/services/profile';

interface WelcomeCardProps {
  stats: StudentStats | null;
}

export const WelcomeCard = memo(function WelcomeCard({ stats }: WelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-300 shadow-2xl rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-6xl animate-bounce">👋</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">你好！</h1>
              <p className="text-base text-gray-600">今天也要加油学习哦~</p>
            </div>
          </div>

          {/* 连续学习徽章 */}
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 border-2 border-orange-300 shadow-lg">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats?.current_streak || 0} 天</p>
              <p className="text-xs font-medium text-orange-600">连续打卡 🔥</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, stats?.current_streak || 0))].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

