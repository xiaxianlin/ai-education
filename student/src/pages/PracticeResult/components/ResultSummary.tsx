/**
 * 结果摘要组件
 */
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import type { PracticeSessionType } from '@/lib/types/schema';

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
    <Card className="border-2 border-purple-200 shadow-xl rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* 标题 */}
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800">{getTitle()}</h1>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-700">{correctQuestions}</div>
              <div className="text-sm text-green-600 mt-1">正确题数</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-red-700">{wrongQuestions}</div>
              <div className="text-sm text-red-600 mt-1">错误题数</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-700">{score.toFixed(1)}</div>
              <div className="text-sm text-blue-600 mt-1">总分</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{formatTime(totalTime)}</div>
              <div className="text-sm text-purple-600 mt-1">总用时</div>
            </div>
          </div>

          {/* 正确率 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="text-4xl font-bold text-green-700 mb-2">{accuracy}%</div>
            <div className="text-lg text-green-600">正确率</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

