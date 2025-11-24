/**
 * 欢迎卡片组件
 * 简单、活泼、大气、可爱的设计
 */
import { memo } from 'react';
import { Flame } from 'lucide-react';
import type { StudentStats } from '@/services/profile';

interface WelcomeCardProps {
  stats: StudentStats | null;
}

export const WelcomeCard = memo(function WelcomeCard({ stats }: WelcomeCardProps) {
  const streak = stats?.current_streak || 0;
  const emojis = ['🌟', '✨', '💫', '⭐', '🎉'];
  const greetingEmojis = ['👋', '😊', '🎈', '🌈', '🎨'];
  const randomGreeting = greetingEmojis[Math.floor(Math.random() * greetingEmojis.length)];

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-purple-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* 左侧欢迎信息 - 一行展示 */}
        <div className="flex items-center gap-5">
          <div className="text-7xl animate-bounce" style={{ animationDuration: '2s' }}>
            {randomGreeting}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              你好呀！
            </h1>
            <span className="text-lg sm:text-xl text-gray-600 font-medium">
              今天也要加油学习哦~ 💪
            </span>
          </div>
        </div>

        {/* 右侧连续打卡徽章 */}
        {streak > 0 && (
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br from-orange-100 via-yellow-100 to-pink-100 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
                <Flame className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 text-2xl animate-pulse">
                {emojis[Math.min(streak - 1, emojis.length - 1)]}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                {streak} 天
              </p>
              <p className="text-sm font-semibold text-orange-600 mt-0.5">
                连续打卡 🔥
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

