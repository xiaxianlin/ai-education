import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { TextbookSetupModal } from '@/components/TextbookSetupModal';
import { profileApi, StudentStats } from '@/services/profile';
import { BookOpen, Target, Clock, AlertCircle, History, Star, Flame, Sparkles } from 'lucide-react';

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
      if (!profile || !profile.current_textbook_id) {
        setShowTextbookModal(true);
      }
    } catch (error) {
      console.error('Failed to check textbook setup:', error);
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

  const todayProgress = 60;
  const dailyQuestions = 12;
  const completedQuestions = 7;

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-600 animate-pulse">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      {showTextbookModal && (
        <TextbookSetupModal
          onClose={() => {
            setShowTextbookModal(false);
          }}
        />
      )}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 头部卡片 - 一行内展示 */}
        <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-300 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-6">
              {/* 问候语 */}
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

        {/* 主要功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 今日练习 */}
          <Link to="/daily-practice">
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full rounded-3xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Clock className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">今日练习</h3>
                      <p className="text-sm text-gray-600">获得 ⭐ 星星</p>
                    </div>
                  </div>
                </div>

                {/* 进度圆环 */}
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-blue-200"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${todayProgress * 3.14} 314`}
                        className="text-blue-500 transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-blue-700">{completedQuestions}</span>
                      <span className="text-sm text-gray-500">/ {dailyQuestions} 题</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg">
                  {completedQuestions > 0 ? '继续练习 →' : '开始练习 🚀'}
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 单元练习 */}
          <Link to="/unit-practice">
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full rounded-3xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">单元练习</h3>
                    <p className="text-sm text-gray-600">选单元练习</p>
                  </div>
                </div>

                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <div className="text-6xl">📚</div>
                    <p className="text-base text-gray-600 font-medium">按章节练习</p>
                  </div>
                </div>

                <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
                  选择单元 →
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 能力评测 */}
          <Link to="/assessment">
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full rounded-3xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">能力评测</h3>
                    <p className="text-sm text-gray-600">测测实力</p>
                  </div>
                </div>

                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <div className="text-6xl">🎯</div>
                    <p className="text-base text-gray-600 font-medium">约 15 分钟</p>
                  </div>
                </div>

                <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg">
                  开始测试 →
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 错题集 & 练习记录 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/wrong">
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">错题集 📋</h3>
                    <p className="text-sm text-gray-600">复习错题，掌握知识</p>
                  </div>
                  <Sparkles className="h-6 w-6 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/history">
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <History className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">练习记录 📝</h3>
                    <p className="text-sm text-gray-600">查看历史，见证成长</p>
                  </div>
                  <Sparkles className="h-6 w-6 text-indigo-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 鼓励提示 */}
        <Card className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-2 border-pink-200 rounded-3xl shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🌟</div>
            <p className="text-lg font-bold text-gray-800 mb-2">
              {completedQuestions > 0 ? '今天学得真不错！' : '开始今天的学习吧！'}
            </p>
            <p className="text-sm text-gray-600">
              {completedQuestions > 0 
                ? '继续加油，你是最棒的！💪' 
                : '每天进步一点点，你会越来越厉害！🚀'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}