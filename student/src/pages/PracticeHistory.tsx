import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { CheckCircle, Clock, TrendingUp, Flame } from 'lucide-react';
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
        <Card className="border-2 border-blue-300 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-6">
              {/* 标题 */}
              <div className="flex items-center gap-4">
                <div className="text-6xl">📝</div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">练习记录</h1>
                  <p className="text-base text-gray-600">回顾学习历程</p>
                </div>
              </div>
              
              {/* 统计信息 */}
              <div className="flex items-center gap-6">
                <div className="text-center px-4 py-2 rounded-xl bg-orange-50 border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <p className="text-2xl font-bold text-orange-600">{streakDays}</p>
                  </div>
                  <p className="text-xs text-orange-600">连续天数</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-blue-50 border-2 border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{getTodayRecords().length}</p>
                  <p className="text-xs text-blue-600">今日次数</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 周视图 - 更漂亮 */}
        <Card className="bg-gradient-to-r from-purple-100 via-blue-100 to-cyan-100 border-2 border-purple-300 shadow-2xl rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-gray-800">本周完成</span>
              <span className="text-4xl font-bold text-purple-700">
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
                      'flex-1 h-12 rounded-2xl transition-all duration-300 shadow-md',
                      isCompleted 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 scale-105' 
                        : 'bg-gray-300'
                    )}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 时间轴记录 - 更漂亮 */}
        <div className="space-y-4">
          {Object.keys(groupedRecords).length > 0 ? (
            Object.entries(groupedRecords).map(([date, dayRecords]) => {
              const totalQuestions = dayRecords.length;
              const totalTime = dayRecords.reduce((sum, r) => sum + r.time_spent, 0);
              const correctCount = dayRecords.filter((r) => r.is_correct === 1).length;
              const accuracy = Math.round((correctCount / totalQuestions) * 100);

              return (
                <Card key={date} className="hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 rounded-3xl hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-2xl bg-green-100 shadow-md">
                            <CheckCircle className="h-7 w-7 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-800">{date}</p>
                            <p className="text-sm text-gray-500 font-medium">
                              教材 #{dayRecords[0].textbook_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-base font-medium ml-2">
                          <span className="text-blue-600">
                            📝 {totalQuestions} 题
                          </span>
                          <span className="text-purple-600">
                            ⏱️ {formatTime(totalTime)}
                          </span>
                          <span
                            className={cn(
                              'font-bold px-3 py-1 rounded-xl',
                              accuracy >= 80 
                                ? 'bg-green-100 text-green-700' 
                                : accuracy >= 60 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-red-100 text-red-700'
                            )}
                          >
                            {accuracy >= 80 ? '✅' : accuracy >= 60 ? '😊' : '💪'} {accuracy}%
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="h-12 px-6 text-base font-bold rounded-2xl border-2 hover:bg-blue-50"
                      >
                        查看
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-2 border-gray-300 shadow-2xl rounded-3xl">
              <CardContent className="py-16 text-center">
                <div className="text-7xl mb-6">📚</div>
                <p className="text-2xl font-bold text-gray-800 mb-3">还没有记录哦</p>
                <p className="text-base text-gray-600">开始你的第一次练习吧！🚀</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
