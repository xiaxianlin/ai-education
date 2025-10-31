import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PracticeHistory() {
  // 模拟练习记录数据
  const history = [
    {
      date: '2025-01-15',
      subject: '数学',
      duration: 18,
      accuracy: 85,
      questions: 12,
      completed: true,
    },
    {
      date: '2025-01-14',
      subject: '英语',
      duration: 20,
      accuracy: 90,
      questions: 15,
      completed: true,
    },
    {
      date: '2025-01-13',
      subject: '数学',
      duration: 15,
      accuracy: 80,
      questions: 10,
      completed: true,
    },
    {
      date: '2025-01-12',
      subject: '英语',
      duration: 22,
      accuracy: 75,
      questions: 14,
      completed: true,
    },
  ];

  const streakDays = 4; // 连续练习天数

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
          </div>
        </div>

        {/* 周视图（简化） */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">本周完成</span>
              <span className="text-2xl font-bold">{history.length} 天</span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, index) => {
                const isCompleted = index < history.length;
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
          {history.map((record, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {record.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">{record.date}</p>
                        <p className="text-sm text-muted-foreground">{record.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                      <span>{record.questions} 道题</span>
                      <span>{record.duration} 分钟</span>
                      <span className={cn(
                        'font-semibold',
                        record.accuracy >= 80 ? 'text-green-600' : 'text-orange-600'
                      )}>
                        正确率 {record.accuracy}%
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    查看详情
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空状态 */}
        {history.length === 0 && (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无练习记录</p>
              <p className="text-sm text-muted-foreground mt-2">开始你的第一次练习吧！</p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
