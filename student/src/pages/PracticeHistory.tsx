import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { profileApi, StudyRecord, StudentStats } from '@/services/profile';
import { toast } from 'sonner';

export function PracticeHistory() {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, statsData] = await Promise.all([
        profileApi.getRecords(),
        profileApi.getStats(),
      ]);
      setRecords(recordsData);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('加载记录失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} 分钟`;
  };

  const groupRecordsByDate = () => {
    const grouped: { [key: string]: StudyRecord[] } = {};
    records.forEach((record) => {
      const date = formatDate(record.study_date);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    return grouped;
  };

  const getTodayRecords = () => {
    const today = new Date().toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
    return records.filter((r) => formatDate(r.study_date) === today);
  };

  const groupedRecords = groupRecordsByDate();
  const streakDays = stats?.current_streak || 0;

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
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 头部 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">练习记录</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                连续练习 <span className="font-semibold text-foreground">{streakDays}</span> 天
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                今日练习 <span className="font-semibold text-foreground">{getTodayRecords().length}</span> 次
              </span>
            </div>
          </div>
        </div>

        {/* 周视图（简化） */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">本周完成</span>
              <span className="text-2xl font-bold">
                {Object.keys(groupedRecords).length} 天
              </span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, index) => {
                const isCompleted = index < Object.keys(groupedRecords).length;
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex-1 h-8 rounded',
                      isCompleted ? 'bg-primary' : 'bg-gray-200'
                    )}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 时间轴记录 */}
        <div className="space-y-4">
          {Object.keys(groupedRecords).length > 0 ? (
            Object.entries(groupedRecords).map(([date, dayRecords]) => {
              const totalQuestions = dayRecords.length;
              const totalTime = dayRecords.reduce((sum, r) => sum + r.time_spent, 0);
              const correctCount = dayRecords.filter((r) => r.is_correct === 1).length;
              const accuracy = Math.round((correctCount / totalQuestions) * 100);

              return (
                <Card key={date} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{date}</p>
                            <p className="text-sm text-muted-foreground">
                              教材 #{dayRecords[0].textbook_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                          <span>{totalQuestions} 道题</span>
                          <span>{formatTime(totalTime)}</span>
                          <span
                            className={cn(
                              'font-semibold',
                              accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-orange-600' : 'text-red-600'
                            )}
                          >
                            正确率 {accuracy}%
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">暂无练习记录</p>
                <p className="text-sm text-muted-foreground mt-2">开始你的第一次练习吧！</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
