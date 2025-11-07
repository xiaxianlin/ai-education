import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { TextbookSetupModal } from '@/components/TextbookSetupModal';
import { profileApi, StudentStats } from '@/services/profile';
import { BookOpen, Target, TrendingUp, Clock, AlertCircle, History } from 'lucide-react';

export function Home() {
  const [showTextbookModal, setShowTextbookModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<StudentStats | null>(null);

  useEffect(() => {
    checkTextbookSetup();
    loadStats();
  }, []);

  const checkTextbookSetup = async () => {
    try {
      setChecking(true);
      const profile = await profileApi.getProfile();
      // 如果没有设置当前学习教材，显示弹窗
      if (!profile || !profile.current_textbook_id) {
        setShowTextbookModal(true);
      }
    } catch (error) {
      console.error('Failed to check textbook setup:', error);
      // 如果获取失败，也显示弹窗让用户去设置
      setShowTextbookModal(true);
    } finally {
      setChecking(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await profileApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const todayProgress = 60; // 今日练习进度百分比
  const dailyQuestions = 12; // 今日题目数
  const completedQuestions = 7; // 已完成题目数

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header />
      {showTextbookModal && (
        <TextbookSetupModal
          onClose={() => {
            setShowTextbookModal(false);
          }}
        />
      )}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* 问候语 */}
        <div className="space-y-1 pb-2">
          <h1 className="text-2xl font-bold">你好！</h1>
          <p className="text-muted-foreground">今天也要加油学习哦~</p>
        </div>

        {/* 连续练习 - 放在最上面 */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium">连续练习 {stats?.current_streak || 0} 天</p>
                <p className="text-sm text-muted-foreground">继续坚持，解锁更多成就！</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 今日练习、单元练习、能力评测 - 并排显示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 今日练习 */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                今日练习
              </CardTitle>
              <CardDescription className="text-xs">完成今日练习，获得星星奖励</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 进度环 - 缩小尺寸 */}
              <div className="flex items-center justify-center py-2">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${todayProgress * 2.2} 220`}
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold">{completedQuestions}</span>
                    <span className="text-xs text-muted-foreground">/{dailyQuestions}</span>
                  </div>
                </div>
              </div>

              <Link to="/daily-practice">
                <Button className="w-full" size="sm">
                  {completedQuestions > 0 ? '继续练习' : '开始练习'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 单元练习 */}
          <Link to="/unit-practice">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  单元练习
                </CardTitle>
                <CardDescription className="text-xs">按教材单元进行集中训练</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-3">
                  <span className="text-sm text-muted-foreground text-center">选择单元开始练习</span>
                  <Button variant="outline" size="sm" className="w-full">
                    开始
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 能力评测 */}
          <Link to="/assessment">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-purple-500" />
                  能力评测
                </CardTitle>
                <CardDescription className="text-xs">阶段性测评，了解知识掌握情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-3">
                  <span className="text-sm text-muted-foreground text-center">20-30 道题，预计 15 分钟</span>
                  <Button variant="outline" size="sm" className="w-full">
                    开始
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 错题集 & 练习记录 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/wrong">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  错题集
                </CardTitle>
                <CardDescription className="text-xs">整理错题，巩固薄弱知识点</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  查看详情
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/history">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4 text-green-600" />
                  练习记录
                </CardTitle>
                <CardDescription className="text-xs">回顾练习历程，查漏补缺</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  前往查看
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}