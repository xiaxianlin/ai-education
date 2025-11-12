import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { TrendingUp } from 'lucide-react';
import { profileApi, StudentProfile, StudentStats } from '@/services/profile';
import { toast } from 'sonner';

export function Profile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getStats(),
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorMessage = error instanceof Error ? error.message : '加载数据失败';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-12 flex items-center justify-center">
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
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 头部卡片 - 一行内展示 */}
        <Card className="border-2 border-purple-300 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-6xl">👤</div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">我的主页</h1>
                <p className="text-base text-gray-600">看看你的学习成果！</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据统计 - 简化设计 */}
        <Card className="border-2 border-purple-300 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">我的成绩</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 p-6 border-2 border-blue-300 shadow-lg">
                <div className="text-center">
                  <div className="text-5xl mb-2">🎯</div>
                  <p className="text-4xl font-bold text-blue-700 mb-2">{stats?.total_practice || 0}</p>
                  <p className="text-sm font-bold text-blue-700">练了几次</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 p-6 border-2 border-green-300 shadow-lg">
                <div className="text-center">
                  <div className="text-5xl mb-2">📚</div>
                  <p className="text-4xl font-bold text-green-700 mb-2">{stats?.total_questions || 0}</p>
                  <p className="text-sm font-bold text-green-700">做了几题</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-6 border-2 border-purple-300 shadow-lg">
                <div className="text-center">
                  <div className="text-5xl mb-2">✅</div>
                  <p className="text-4xl font-bold text-purple-700 mb-2">{Math.round(stats?.accuracy || 0)}%</p>
                  <p className="text-sm font-bold text-purple-700">正确率</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-100 p-6 border-2 border-orange-300 shadow-lg">
                <div className="text-center">
                  <div className="text-5xl mb-2">🔥</div>
                  <p className="text-4xl font-bold text-orange-700 mb-2">{stats?.current_streak || 0}</p>
                  <p className="text-sm font-bold text-orange-700">连续天数</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 功能卡片 - 横向并排 */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-yellow-200 rounded-3xl">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center group-hover:from-yellow-200 group-hover:to-orange-200 transition-colors shadow-lg">
                    <div className="text-5xl">🏆</div>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-800">我的成就</p>
                <p className="text-sm text-gray-600">查看学习成就</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-blue-200 rounded-3xl">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-cyan-200 transition-colors shadow-lg">
                    <div className="text-5xl">📊</div>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-800">评测报告</p>
                <p className="text-sm text-gray-600">查看能力评测</p>
              </div>
            </CardContent>
          </Card>

          <Link to="/settings" className="block">
            <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-gray-300 rounded-3xl">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-colors shadow-lg">
                      <div className="text-5xl">⚙️</div>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-800">我的设置</p>
                  <p className="text-sm text-gray-600">修改个人信息</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
