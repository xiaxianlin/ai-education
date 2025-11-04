import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { User, LogOut, Settings, Award, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { GRADES } from '@/stores/useSettingsStore';
import { profileApi, StudentProfile, StudentStats } from '@/services/profile';
import { toast } from 'sonner';

export function Profile() {
  const { logout } = useAuthStore();
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

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const currentGrade = profile?.grade ? GRADES.find((g) => g.id === profile.grade) : null;
  const gradeLabel = currentGrade ? currentGrade.label : '未设置';

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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 用户信息卡片 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">学生</h2>
                <p className="text-sm text-muted-foreground">{gradeLabel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">学习统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats?.total_practice || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">练习次数</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats?.total_questions || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">完成题目</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{Math.round(stats?.accuracy || 0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">平均正确率</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats?.current_streak || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">连续天数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 功能列表 */}
        <div className="space-y-2">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">我的成就</span>
                </div>
                <Button variant="ghost" size="sm">
                  &gt;
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">评测报告</span>
                </div>
                <Button variant="ghost" size="sm">
                  &gt;
                </Button>
              </div>
            </CardContent>
          </Card>

          <Link to="/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">学习设置</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    &gt;
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 退出登录 */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          退出登录
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
