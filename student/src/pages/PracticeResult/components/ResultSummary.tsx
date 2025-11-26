/**
 * 结果摘要组件
 */
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ResultSummaryProps {
  report: {
    total_questions: number;
    correct_questions: number;
    overall_score: number;
    total_time: number;
  };
  sessionType: PracticeSessionType;
  unitName?: string;
}

export const ResultSummary = memo(function ResultSummary({
  report,
  sessionType,
  unitName,
}: ResultSummaryProps) {
  const totalQuestions = report.total_questions || 0;
  const correctQuestions = report.correct_questions || 0;
  const wrongQuestions = totalQuestions - correctQuestions;
  const score = report.overall_score || 0;
  const totalTime = report.total_time || 0;
  const accuracy = totalQuestions > 0 
    ? Math.round((correctQuestions / totalQuestions) * 100) 
    : 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`;
  };

  const getTitle = () => {
    switch (sessionType) {
      case 'daily_practice':
        return '每日练习完成！';
      case 'unit_practice':
        return `单元练习完成${unitName ? `：${unitName}` : ''}！`;
      case 'assessment':
        return '能力评测完成！';
      default:
        return '练习完成！';
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-xl rounded-3xl overflow-hidden bg-card">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* 标题 */}
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-foreground">{getTitle()}</h1>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-green-500/10 rounded-2xl p-6 border-2 border-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">{correctQuestions}</div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-1">正确题数</div>
            </div>
            <div className="bg-destructive/10 rounded-2xl p-6 border-2 border-destructive/20">
              <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <div className="text-3xl font-bold text-destructive">{wrongQuestions}</div>
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
        </div>
      </CardContent>
    </Card>
  );
});

