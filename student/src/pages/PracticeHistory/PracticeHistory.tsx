/**
 * 练习统计页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Flame } from 'lucide-react';
import { LoadingSpinner } from '@/components/biz/LoadingSpinner';
import { usePracticeHistory } from './hooks/usePracticeHistory';
import { RecordCard } from './components/RecordCard';
import { cn } from '@/lib/utils';

export function PracticeHistory() {
  const {
    stats,
    loading,
    groupRecordsByDate,
    getTodayRecords,
    formatDate,
    formatTime,
  } = usePracticeHistory();

  const streakDays = stats?.current_streak || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在加载..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 头部卡片 */}
        <Card className="border-2 border-blue-300 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-6">
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
                  <p className="text-2xl font-bold text-blue-600">{getTodayRecords.length}</p>
                  <p className="text-xs text-blue-600">今日次数</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 周视图 */}
        <Card className="bg-gradient-to-r from-purple-100 via-blue-100 to-cyan-100 border-2 border-purple-300 shadow-2xl rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-gray-800">本周完成</span>
              <span className="text-4xl font-bold text-purple-700">
                {Object.keys(groupRecordsByDate).length} 天
              </span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, index) => {
                const isCompleted = index < Object.keys(groupRecordsByDate).length;
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

        {/* 时间轴记录 */}
        <div className="space-y-4">
          {Object.keys(groupRecordsByDate).length > 0 ? (
            Object.entries(groupRecordsByDate).map(([date, dayRecords]) => (
              <RecordCard
                key={date}
                date={date}
                dayRecords={dayRecords}
                formatTime={formatTime}
              />
            ))
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

