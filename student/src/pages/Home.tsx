import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { SettingsModal } from '@/components/SettingsModal';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { BookOpen, Target, TrendingUp, Clock } from 'lucide-react';

export function Home() {
  const { isSettingsComplete, init } = useSettingsStore();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    init();
    if (!isSettingsComplete()) {
      setShowSettingsModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayProgress = 60; // 今日练习进度百分比
  const dailyQuestions = 12; // 今日题目数
  const completedQuestions = 7; // 已完成题目数

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {showSettingsModal && (
        <SettingsModal
          onComplete={() => {
            setShowSettingsModal(false);
          }}
        />
      )}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 问候语 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">你好！</h1>
          <p className="text-muted-foreground">今天也要加油学习哦~</p>
        </div>

        {/* 今日任务卡 */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              今日练习
            </CardTitle>
            <CardDescription>完成今日练习，获得星星奖励</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 进度环 */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${todayProgress * 3.516} 352`}
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{completedQuestions}</span>
                  <span className="text-xs text-muted-foreground">/{dailyQuestions}</span>
                </div>
              </div>
            </div>

            <Link to="/daily-practice">
              <Button className="w-full" size="lg">
                {completedQuestions > 0 ? '继续练习' : '开始每日练习'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 单元练习卡片 */}
        <Link to="/unit-practice">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                单元练习
              </CardTitle>
              <CardDescription>按教材单元进行集中训练</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">选择单元开始练习</span>
                <Button variant="outline" size="sm">
                  开始
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 能力评测卡片 */}
        <Link to="/assessment">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                能力评测
              </CardTitle>
              <CardDescription>阶段性测评，了解知识掌握情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">20-30 道题，预计 15 分钟</span>
                <Button variant="outline" size="sm">
                  开始
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 成就提示 */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium">连续练习 3 天</p>
                <p className="text-sm text-muted-foreground">继续坚持，解锁更多成就！</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}