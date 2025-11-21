/**
 * 练习状态卡片组件
 * 展示练习的生成状态和进度
 */
import { memo } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Target,
  TrendingUp,
  Zap,
  Play,
  Sparkles,
  Award,
  BookCheck,
  Brain,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PracticeStatus } from '../hooks/useDailyPracticePage';

interface PracticeStatusCardProps {
  status: PracticeStatus;
  progress: number;
  sessionId: number | null;
  onStart: () => void;
}

export const PracticeStatusCard = memo(function PracticeStatusCard({
  status,
  progress,
  sessionId,
  onStart,
}: PracticeStatusCardProps) {
  if (status === 'ready' && sessionId) {
    return (
      <Card className="border-2 border-green-300 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-7xl mb-4">🎉</div>
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            每日练习已就绪！
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mb-6">
            准备好开始今天的挑战了吗？
          </CardDescription>
          <Button
            onClick={onStart}
            size="lg"
            className="h-16 px-12 text-xl font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl"
          >
            <Play className="h-6 w-6 mr-3" fill="currentColor" />
            开始练习 🚀
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'generating') {
    return (
      <Card className="border-2 border-blue-300 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center space-y-6">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto" />
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            正在生成每日练习...
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mb-4">
            AI 正在为你精心准备题目，请稍候
          </CardDescription>
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{progress}%</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="border-2 border-red-300 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-red-50 to-orange-50">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl mb-4">😔</div>
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            生成失败
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mb-6">
            练习生成遇到问题，请稍后重试
          </CardDescription>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="lg"
            className="h-14 px-8 text-lg rounded-2xl"
          >
            刷新重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
});

