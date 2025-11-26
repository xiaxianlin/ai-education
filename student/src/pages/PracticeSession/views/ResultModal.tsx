/**
 * 练习结果弹窗组件
 */
import { memo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ResultModalProps {
  report: any;
  sessionType?: PracticeSessionType;
}

export const ResultModal = memo(function ResultModal({
  report,
  sessionType,
}: ResultModalProps) {
  const navigate = useNavigate();

  const getBackPath = () => {
    switch (sessionType) {
      case 'daily_practice':
        return '/home';
      case 'unit_practice':
        return '/unit-practice';
      case 'assessment':
        return '/home'; // Fallback to home as /assessment route might not exist or be typed
      default:
        return '/home';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`;
  };

  const totalQuestions = report.total_questions || 0;
  const correctQuestions = report.correct_questions || 0;
  const score = report.overall_score || 0;
  const totalTime = report.total_time || 0;
  const accuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl rounded-3xl overflow-hidden bg-card">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* 标题 */}
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-foreground">练习完成！</h2>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-green-500/10 rounded-2xl p-6 border-2 border-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{correctQuestions}</div>
                <div className="text-sm text-green-600 dark:text-green-400 mt-1">正确题数</div>
              </div>
              <div className="bg-destructive/10 rounded-2xl p-6 border-2 border-destructive/20">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <div className="text-3xl font-bold text-destructive">{totalQuestions - correctQuestions}</div>
                <div className="text-sm text-destructive/80 mt-1">错误题数</div>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary/20">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">{score.toFixed(1)}</div>
                <div className="text-sm text-primary/80 mt-1">总分</div>
              </div>
              <div className="bg-secondary/10 rounded-2xl p-6 border-2 border-secondary/20">
                <Clock className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary-foreground">{formatTime(totalTime)}</div>
                <div className="text-sm text-secondary-foreground/80 mt-1">总用时</div>
              </div>
            </div>

            {/* 正确率 */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border-2 border-green-500/20">
              <div className="text-4xl font-bold text-green-700 dark:text-green-300 mb-2">{accuracy}%</div>
              <div className="text-lg text-green-600 dark:text-green-400">正确率</div>
            </div>

            {/* 按钮 */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate({ to: getBackPath() })}
                className="flex-1 h-12 rounded-xl"
              >
                返回
              </Button>
              <Button
                onClick={() => navigate({ to: '/history' })}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                查看历史记录
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

