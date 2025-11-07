import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Settings, Award, BookOpen, TrendingUp, Target, Calendar, ChevronRight } from 'lucide-react';
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
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 数据统计 - 优化设计 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              学习统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 border border-blue-200/50">
                <div className="absolute top-2 right-2 opacity-20">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-700 mb-1">{stats?.total_practice || 0}</p>
                <p className="text-xs font-medium text-blue-600/80">练习次数</p>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 p-5 border border-green-200/50">
                <div className="absolute top-2 right-2 opacity-20">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-700 mb-1">{stats?.total_questions || 0}</p>
                <p className="text-xs font-medium text-green-600/80">完成题目</p>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 border border-purple-200/50">
                <div className="absolute top-2 right-2 opacity-20">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-700 mb-1">{Math.round(stats?.accuracy || 0)}%</p>
                <p className="text-xs font-medium text-purple-600/80">平均正确率</p>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 p-5 border border-orange-200/50">
                <div className="absolute top-2 right-2 opacity-20">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-700 mb-1">{stats?.current_streak || 0}</p>
                <p className="text-xs font-medium text-orange-600/80">连续天数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 功能列表 - 优化设计 */}
        <div className="space-y-2.5">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="font-medium text-gray-800">我的成就</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-800">评测报告</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Link to="/settings">
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group mt-3">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <Settings className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-800">信息设置</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
